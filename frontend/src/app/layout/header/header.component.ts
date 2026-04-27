import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { ThemeService } from 'src/app/services/theme.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit {
  htmlElement: any;
  title!: string;
  dataZip: any;
  isShow: boolean = false;
  topPosToStartShowing = 100;
  isLoader: boolean = false;
  settings: any;
  showModal: any = '';
  importData: any = [];
  importResult: any = [];
  importList: any = [];
  tab: any = '';
  del_filter: any = {
  }
  affData: any = [];
  mms: any = []
  defaultMM: any = 'Select Default MM';
  menuItems: any[] = [];
  customColor: string = '';
  isChangelogVisible: boolean = false;
  isContextSettingsVisible: boolean = false;
  contextKey: string | null = null;
  updates: any[] = [];
  hasNewUpdates: boolean = false;
  lastSeenVersion: string | null = null;

  // Route → settingsUI key mapping
  private readonly routeKeyMap: { [route: string]: string } = {
    'aawak': 'aawak', 'aawakN': 'aawak',
    'jawak': 'jawak', 'jawakN': 'jawak',
    'hmp': 'hmp',
    'pbk': 'pbk',
    'mm': 'mm',
    'nimitt': 'nimitt',
    'bachat': 'bachat', 'bachat_new': 'bachat',
    'category': 'category',
    'department': 'department',
    'item': 'item',
    'product': 'product',
    'repairing': 'repairing',
    'report': 'report',
    'point': 'point',
  };

  constructor(
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private router: Router,
    private toastr: ToastrService,
    public auth: AuthService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    public themeService: ThemeService) {

    this.settings = this.auth.webUser.settings;
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.setDefaultMMLabel();
      this.initMenu();
    });
  }
  @HostListener('window:scroll')


  checkScroll() {
    // window의 scroll top
    // Both window.pageYOffset and document.documentElement.scrollTop returns the same result in all the cases. window.pageYOffset is not supported below IE 9.
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollPosition >= this.topPosToStartShowing) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
  }

  openModal(type: String) {
    this.showModal = type;
    $('#modal').modal('show');
  }

  closeModal() {
    this.showModal = "";
    $('#modal').modal('hide');
  }
  closeImportModal() {
    this.showModal = "";
    $('#importmodal').modal('hide');
  }

  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  ngOnInit(): void {
    this.htmlElement = this.elementRef.nativeElement.ownerDocument.documentElement;
    this.initMenu();
    this.loadUpdates();

    // Auto-detect context key from router URL
    this.detectContextKey(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.detectContextKey(event.urlAfterRedirects || event.url);
      this.isContextSettingsVisible = false; // close panel on navigation
    });
  }

  detectContextKey(url: string) {
    const segment = url.replace(/^\//, '').split('/')[0].split('?')[0];
    this.contextKey = this.routeKeyMap[segment] || null;
  }

  toggleContextSettings() {
    this.isContextSettingsVisible = !this.isContextSettingsVisible;
    if (this.isContextSettingsVisible) { this.isChangelogVisible = false; }
  }

  loadUpdates() {
    this.http.get('assets/updates.json').subscribe((data: any) => {
      this.updates = data;
      this.lastSeenVersion = localStorage.getItem('last_seen_version');
      this.checkNewUpdates();
    }, err => {
      console.error('Could not load updates.json', err);
    });
  }

  checkNewUpdates() {
    if (this.updates && this.updates.length > 0) {
      const latestVersion = this.updates[0].version;

      if (latestVersion !== this.lastSeenVersion) {
        this.hasNewUpdates = true;
        // Auto-open panel on load if new version exists
        this.isChangelogVisible = true;
      }
    }
  }

  toggleChangelog() {
    this.isChangelogVisible = !this.isChangelogVisible;
    if (this.isChangelogVisible && this.hasNewUpdates) {
      if (this.updates && this.updates.length > 0) {
        // Clear badge but DONT update lastSeenVersion yet in memory so panel can expand
        this.hasNewUpdates = false;
        // Update localStorage for next app load
        localStorage.setItem('last_seen_version', this.updates[0].version);
      }
    }
  }

  initMenu() {
    this.menuItems = [
      { title: 'Home', icon: 'uil-home-alt', link: 'dashboard', visible: true },
      {
        title: 'Entries',
        icon: 'uil-edit',
        dropdown: true,
        visible: true,
        children: [
          { title: 'Aawak', link: 'aawak', visible: this.auth.webUser.settings?.aawak?.visible },
          { title: 'Aawak (Bunch)', link: 'aawakN', visible: this.auth.webUser.settings?.aawak?.visible },
          { title: 'Jawak', link: 'jawak', visible: this.auth.webUser.settings?.jawak?.visible },
          { title: 'Jawak (Bunch)', link: 'jawakN', visible: this.auth.webUser.settings?.jawak?.visible },
          { title: 'HMP', link: 'hmp', visible: true },
          { title: 'Prastav', link: 'prastav', visible: true },
          { title: 'PBK Closing', link: 'pbk_closing', visible: true },
          { title: 'Product', link: 'product', visible: this.auth.webUser.settings?.product?.visible },
          { title: 'Vehicle', link: 'vehicle', visible: this.auth.webUser.settings?.vehicle?.visible },
        ]
      },

      {
        title: 'Main Lists',
        icon: 'uil-list-ul',
        dropdown: true,
        visible: true,
        children: [
          { title: 'LOT Nos', link: 'view/lot_no', visible: this.auth.webUser.settings?.aawak?.lot_no },
          { title: 'Item', link: 'item', visible: this.auth.webUser.settings?.item?.visible },
          { title: 'Variant', link: 'variant', visible: true },
          { title: 'VariantNew', link: 'variantN', visible: true },
          { title: 'MM', link: 'mm', visible: this.auth.webUser.settings?.mm?.visible },
          { title: 'PBK', link: 'pbk', visible: this.auth.webUser.settings?.pbk?.visible },
          { title: 'Nimitt', link: 'nimitt', visible: this.auth.webUser.settings?.nimitt?.visible },
          { title: 'Zone', link: 'view/zone', visible: true },
          { title: 'State', link: 'view/state', visible: true },
          { title: 'District', link: 'view/district', visible: true },
          { title: 'Unit', link: 'view/unit', visible: true },
          { title: 'Category', link: 'category', visible: this.auth.webUser.settings?.category?.visible },
          { title: 'Subitem List', link: 'view/subitem_list', visible: true },
        ]
      },
      {
        title: 'Lists',
        icon: 'uil-list-ui-alt',
        dropdown: true,
        visible: true,
        children: [
          { title: 'Aawak Type', link: 'view/aawak_type', visible: true },
          { title: 'Aawak Source', link: 'view/aawak_source', visible: true },
          { title: 'Jawak Type', link: 'view/jawak_type', visible: true },
          { title: 'Usage List', link: 'view/usage_list', visible: true },
          { title: 'Condition', link: 'view/condition', visible: true },
          { title: 'MM Type', link: 'view/mm_type', visible: true },
          { title: 'Dictionary', link: 'view/dict', visible: true },
          { title: 'Gender', link: 'view/gender', visible: true },
          { title: 'Relation', link: 'view/relation', visible: true },
          { title: 'Word Correction', link: 'view/word_correction', visible: true },
        ]
      },
      {
        title: 'Reports',
        icon: 'uil-apps',
        dropdown: true,
        visible: true,
        children: [
          { title: 'Bachat', link: 'bachat_new', visible: true },
          { title: 'All Time Bachat', link: 'bachat', visible: this.auth.webUser.settings?.bachat?.visible },
          { title: 'Aawak Jawak Check', link: 'report-aj-check', visible: this.auth.webUser.settings?.report?.report_aj_check },
          { title: 'Aawak Type Saar', link: 'report-at', visible: this.auth.webUser.settings?.report?.report_at },
          { title: 'Jawak Type Saar', link: 'report-jt', visible: this.auth.webUser.settings?.report?.report_jt },
          { title: 'Store Stock', link: 'report-str-stk', visible: this.auth.webUser.settings?.report?.report_str_stk },
          { title: 'Khet Saar', link: 'report-kh-saar', visible: this.auth.webUser.settings?.report?.report_kh },
          { title: 'Khet Saar (Item Wise)', link: 'report-kh-itemwise', visible: this.auth.webUser.settings?.report?.report_kh },
          { title: 'Khet AJ saar', link: 'report-kh-ajsaar', visible: this.auth.webUser.settings?.report?.report_kh },
        ]
      },
      {
        title: 'Utility',
        icon: 'uil-wrench',
        dropdown: true,
        visible: true,
        children: [
          { title: 'Department', link: 'department', visible: this.auth.webUser.settings?.department?.visible },
          { title: 'NetDrop', link: 'netdrop', visible: true, target: '_blank' },
        ]
      },
      { title: 'Points', icon: 'uil-layer-group', link: 'point', visible: this.auth.webUser.settings?.point?.visible },
      { title: 'MySQL', icon: 'uil-layer-group', link: 'mysql', visible: true },
    ];
  }

  getActiveChildTitle(item: any): string {
    if (!item.children) return '';
    // Find the child whose link matches the current URL
    const activeChild = item.children.find((sub: { link: string; }) => this.router.url.includes(sub.link));
    return activeChild ? activeChild.title : '';
  }

  setDefaultMMLabel(id: any = null) {
    let mm = null;
    if (id) {
      mm = this.mms.find((m: { _id: any; }) => m._id == id);
    } else if (this.settings?.defaultMM) {
      mm = this.mms.find((m: { _id: any; }) => m._id == this.settings.defaultMM);
    }
    if (mm) {
      this.defaultMM = mm.mm_hin + (mm.mm_code ? ' : ' + mm.mm_code : '');
    } else {
      this.defaultMM = 'Select Default MM';
    }
  }

  ngAfterViewInit(): void {
    // Re-initialize jQuery/app.min.js logic after Angular has rendered the component
    if ((window as any).jQuery && (window as any).jQuery.App) {
      console.log("initialized");

      (window as any).jQuery.App.init();  // Re-initialize app.min.js here

    } else {
      console.log("not initialized");

    }
  }

  defaultMMChanged(ev: any) {
    if (ev) {
      let mm = this.mms.find((m: { _id: any; }) => m._id == ev);
      this.defaultMM = mm.mm_hin + (mm.mm_code ? ' : ' + mm.mm_code : '');
    } else {
      this.defaultMM = 'Select Default MM';
    }
    this.auth.updateSettings();
  }

  logout() {
    this.auth.removewebUser()
    this.router.navigate(['login']);
  }

  isRegionActive(): boolean {
    const url: string = this.router.url || '';
    return url.includes('/city')
      || url.includes('/view/zone')
      || url.includes('/view/district')
      || url.includes('/view/state')
      || url.includes('/view/country');
  }

  setLightMode() {
    this.auth.webUser.settings.darkMode = false;
    this.auth.webUser.settings.amoledMode = false;
    this.auth.updateSettings();
    this.themeService.initializeTheme();
  }

  setDarkMode(amoled: boolean = false) {
    this.auth.webUser.settings.darkMode = true;
    this.auth.webUser.settings.amoledMode = amoled;
    this.auth.updateSettings();
    this.themeService.initializeTheme();
  }

  exportUpdate() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('IMPORTUPDATES') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result']) {
        // this.router.navigate(data['result'])
        // window.open("file:///D:/MD Softwares/AIVV/HisabKitab-2022/Data/Sabji/Sabji_update_3_2022.db", "_blank")
        Swal.fire({
          title: 'Updates of Database Generated',
          text: "FullPath : " + data['result'],
          icon: 'success',
          // showCancelButton: true,
          confirmButtonColor: '#3085d6',
          // cancelButtonColor: '#d33',
          confirmButtonText: 'Ok, Got it.'
        }).then((result) => {
          if (result.isConfirmed) {

          }
        })
      }
    });
    this.isLoader = false;
  }

  exportLatestUpdate = async () => {
    Swal.fire({
      title: 'Start Date',
      html:
        '<span>Date filter functionality currently not working, but still download update is working.</span>' +
        '<input id="exportDate" type="date" class="swal2-input">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Download Update',
      preConfirm: function () {
        const date = $('#exportDate').val();
        if (!date) {
          Swal.showValidationMessage('Please Enter date');
        }
        return date;
      }
    }).then((result) => {
      console.log("result", result);
      if (result.value && result.isConfirmed) {
        this.isLoader = true;
        this.dataZip = new JSZip();
        this.http.put(this.api.getUrl('EXPORTUPDATES') + this.auth.webUser.dept_id, { startDate: result.value }).subscribe((data: any) => {
          if (data['success'] && data['result']) {
            for (let key of Object.keys(data['result'])) {
              this.dataZip.file(key + ".json", JSON.stringify(data['result'][key]));
            }
          }

          let dept = this.auth.webUser;
          let date = new Date();
          this.dataZip.generateAsync({ type: "blob" }).then(function (content: Blob) {
            FileSaver.saveAs(content, dept.dept_eng + "_update_" + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + ".zip");
          });
          this.isLoader = false;
          this.toastr.success("Updated Settings downloaded for '" + dept.dept_eng + "'");
        });

        this.isLoader = false;
      }
    });

  }

  importZip = async (ev: any) => {
    this.isLoader = true;
    console.log("clicked", ev);

    if (ev.target.files[0]) {

      const fileReader: any = new FileReader();
      fileReader.readAsArrayBuffer(ev.target.files[0]); //reading 1st file only

      fileReader.onload = () => {

        this.dataZip = new JSZip();
        //loading zip file content
        this.dataZip.loadAsync(fileReader.result).then((zip: any) => {

          //checking zip data found or not
          if (zip) {
            // getting name of all exists files in zip in array.
            let fileNames = Object.keys(zip.files);
            console.log("readed", zip);

            // loop through all files
            for (let i in fileNames) {

              //accept only files that listed below, other ignore.
              switch (fileNames[i]) {
                case 'settings.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {

                    if (data) {
                      let setting = JSON.parse(data);
                      let body = {
                        query: {
                          // _id: (setting._id ? setting._id : null),
                          dept_id: setting.dept_id,
                          config_key: setting.config_key,
                        },
                        set: {
                          config_key: setting.config_key,
                          config_value: setting.config_value,
                          active: setting.active,
                          created_at: setting.created_at,
                          updated_at: setting.updated_at,
                        }
                      }

                      this.http.put(this.api.getUrl('DEPTCONFIG'), body).subscribe((data: any) => {
                        if (data.result.length > 0) {
                          let setting = JSON.parse(data.result[0].config_value);
                          if (data.result[0].dept_id == this.auth.webUser.dept_id) {
                            this.auth.webUser.settings = setting;
                          }
                          this.toastr.success("settings import successfully");
                        }
                      });
                    }
                    else {
                      this.toastr.error('can not read settings file from zip')
                    }
                  });
                  break;

                case 'country.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'country', data: JSON.parse(data) }).subscribe((result: any) => {
                        this.importResult.push(result);
                      });
                    }
                  }, (err: any) => {
                    console.log(err);

                  });
                  break;
                case 'state.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'state', data: JSON.parse(data) }).subscribe((result: any) => {
                        this.importResult.push(result);
                      });
                    }
                  }, (err: any) => {
                    console.log(err);

                  });
                  break;
                case 'city.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'city', data: JSON.parse(data) }).subscribe((result: any) => {
                        this.importResult.push(result);
                      });
                    }
                  }, (err: any) => {
                    console.log(err);

                  });
                  break;
                case 'category.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'category', data: JSON.parse(data) }).subscribe((result: any) => {
                        this.importResult.push(result);
                      });
                    }
                  }, (err: any) => {
                    console.log(err);

                  });
                  break;
                case 'department_config.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'department_config', data: JSON.parse(data) }).subscribe((result: any) => {
                        this.importResult.push(result);
                      });
                    }
                  }, (err: any) => {
                    console.log(err);

                  });
                  break;
                // case 'department.json':
                //   zip.file(fileNames[i]).async("string").then((data: any) => {
                //     if (data) {
                //       this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'department', data: JSON.parse(data) }).subscribe((result: any) => {
                //         this.importResult.push(result);
                //       });
                //     }
                //   }, (err:any) => {
                //     console.log(err);

                //   });
                //   break;
                case 'support_list.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'support_list', data: JSON.parse(data) }).subscribe((result: any) => {
                        this.importResult.push(result);
                      });
                    }
                  }, (err: any) => {
                    console.log(err);

                  });
                  break;
                case 'subitem_list.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'subitem_list', data: JSON.parse(data) }).subscribe((result: any) => {
                        this.importResult.push(result);
                      });
                    }
                  }, (err: any) => {
                    console.log(err);

                  });
                  break;
                case 'unit.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'unit', data: JSON.parse(data) }).subscribe((result: any) => {
                        this.importResult.push(result);
                      });
                    }
                  }, (err: any) => {
                    console.log(err);

                  });
                  break;
                case 'subitem.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'subitem', data: JSON.parse(data) }).subscribe((result: any) => {
                        this.importResult.push(result);
                      });
                    }
                  }, (err: any) => {
                    console.log(err);

                  });
                  break;
                case 'item.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'item', data: JSON.parse(data) }).subscribe((result: any) => {
                        this.importResult.push(result);
                      });
                    }
                  }, (err: any) => {
                    console.log(err);

                  });
                  break;
                case 'mm.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: 'mm', data: JSON.parse(data) }).subscribe((result: any) => {
                        this.importResult.push(result);
                      });
                    }
                  }, (err: any) => {
                    console.log(err);

                  });
                  break;

              }
            }

            $('#importmodal').modal('show');
          }

        });

      }

    }
    ev = null;
  }

  importZipSummary = async (ev: any) => {
    this.isLoader = true;

    if (ev.target.files[0]) {

      const fileReader: any = new FileReader();
      fileReader.readAsArrayBuffer(ev.target.files[0]); //reading 1st file only

      fileReader.onload = () => {
        this.isLoader = true;
        this.importResult = [];
        this.dataZip = new JSZip();
        //loading zip file content
        this.dataZip.loadAsync(fileReader.result).then(async (zip: any) => {

          //checking zip data found or not
          if (zip) {
            // getting name of all exists files in zip in array.
            let fileNames = Object.keys(zip.files);
            console.log("fileNames", fileNames);

            // loop through all files
            for (let i in fileNames) {
              let fname = fileNames[i].split('.')[0];
              await zip.file(fileNames[i]).async("string").then(async (data: any) => {
                if (data) {
                  if (fname == 'settings') {
                    this.updateSettings(data);
                  } else {
                    await this.importResult.push({ type: fname, data: JSON.parse(data) });
                  }

                }
              }, (err: any) => {
                console.log(err);
              });
            }

            await this.processingImportData();

            this.isLoader = false;
            $('#importmodal').modal('show');

          }

        });

      }

    }
    ev = null;
  }

  updateSettings(data: any) {
    let setting = JSON.parse(data);
    console.log(typeof setting.settings == 'string');

    if (typeof setting.settings == 'string') {
      setting.settings = JSON.parse(setting.settings);
    }
    console.log(setting);

    let body = {
      query: {
        _id: setting._id
      },
      set: {
        ...setting
      }
    }

    this.http.put(this.api.getUrl('DEPT'), body).subscribe(async (data: any) => {
      if (data.success) {

        this.toastr.success("settings import successfully");
        if (data.result._id == this.auth.webUser.dept_id) {
          this.auth.webUser.settings = data.result.settings;

          this.auth.setWebUser(this.auth.webUser);
          setTimeout(() => {
            window.location.reload()
          }, 500);
        }
      }
    });
  }

  /*
  changes => an array of insert, update and delete items.
  found => an array of same items with no changes.
  columns => contains keys of items object.
  status => 0 - found, 1 - insert, 2 - update, 3 - delete. 
  */

  async processingImportData() {

    for (let i in this.importResult) {

      let API: string | null = null;
      this.del_filter[this.importResult[i].type] = [];
      switch (this.importResult[i].type) {
        case 'settings.json':

          let setting = this.importResult[i].data;
          let body = {
            query: {
              _id: setting._id
            },
            set: {
              ...setting
            }
          }

          this.http.put(this.api.getUrl('DEPT'), body).subscribe((data: any) => {
            if (data.result.length > 0) {
              this.toastr.success("settings import successfully");
            }
          });

          break;
        case 'country':
          API = 'COUNTRY';
          break;
        case 'state':
          API = 'STATE';
          break;
        case 'city':
          API = 'CITY';
          break;
        case 'category':
          API = 'CATEGORY';
          break;
        case 'department_config':
          API = 'DEPTCONFIG';
          break;
        case 'department':
          API = 'DEPT';
          break;
        case 'support_list':
          API = 'SUPPORTLIST';
          break;
        case 'subitem_list':
          API = 'SUBITEMLIST';
          break;
        case 'unit':
          API = 'UNIT';
          break;
        case 'subitem':
          API = 'SUBITEM';
          break;
        case 'item':
          API = 'ITEM';
          break;
        case 'mm':
          API = 'MM';
          break;
        case 'pbk':
          API = 'PBK';
          break;
        case 'nimitt':
          API = 'NIMITT';
          break;
        default: this.importResult.splice(i, 1);
      }
      if (API) {
        await this.http.get(this.api.getUrl(API)).subscribe((res: any) => {
          let result: any = { changes: [], found: [], columns: [] }

          if (API == 'DEPTCONFIG') {
            console.log(res, "old");
            console.log(this.importResult[i], "new");

          }
          for (let j in res.result) {
            for (let k = 0; k < this.importResult[i].data.length; k++) {
              if (res.result[j]._id == this.importResult[i].data[k]._id) {
                if (res.result[j].updated_at != this.importResult[i].data[k].updated_at) {
                  res.result[j].status = 2;
                  this.importResult[i].data[k].status = 2;
                  if (result.columns.length < 1) {
                    result.columns = [...Object.keys(this.importResult[i].data[k]), "status"];
                  }
                  result.changes.push({ status: 2, ...this.importResult[i].data[k], oldData: res.result[j] });
                }
                else {
                  result.found.push(this.importResult[i].data[k]);
                  res.result[j].status = 4;
                  this.importResult[i].data[k].status = 4;
                }
                break;
              }
            }
            if (!res.result[j].status) {
              if (result.columns.length < 1) {
                result.columns = [...Object.keys(res.result[j]), "status"];
              }
              result.changes.unshift({ status: 3, ...res.result[j] });
              this.del_filter[this.importResult[i].type].push(res.result[j]._id);
            }
          }
          for (let j in this.importResult[i].data) {
            if (result.columns.length < 1) {
              result.columns = [...Object.keys(this.importResult[i].data[j]), "status"];
            }
            if (!this.importResult[i].data[j].status) {
              result.changes.push({ status: 1, ...this.importResult[i].data[j] })
            }
          }
          this.importResult[i].result = result;
        });
      }
      else {
        this.importResult[i].result = { changes: this.importResult[i].data, found: [], columns: [] }
      }
    }

  }

  getAffectedData() {
    this.http.put(this.api.getUrl('IMPORTEXPORT') + 'aff_data/', this.del_filter).subscribe((data: any) => {
      console.log(data);

    });
  }

  importUpdates() {
    for (let i in this.importResult) {
      if (this.importResult[i].result && this.importResult[i].result.changes && this.importResult[i].result.changes.length > 0) {
        this.http.put(this.api.getUrl('APPLYUPDATE') + this.auth.webUser.dept_id, { type: this.importResult[i].type, data: this.importResult[i].result.changes }).subscribe((result: any) => {
          if (result) {
            this.toastr.success(this.importResult[i].type + " import successfully");
          }
        });
      }
    }
  }

  importOldData = async (ev: any) => {
    this.isLoader = true;

    if (ev.target.files[0]) {

      const fileReader: any = new FileReader();
      fileReader.readAsText(ev.target.files[0], 'UTF-8'); //reading 1st file only

      fileReader.onload = () => {

        let aawakEntry = JSON.parse(fileReader.result);
        let newAawak: any = [];
        for (let i in aawakEntry) {

          newAawak[i] = {
            pkt_num: aawakEntry[i].parchi_num,
            pbk_id: null,
            date: aawakEntry[i].date,
            item_id: null,
            subitem_id: null,
            unit_id: null,
            item_detail: aawakEntry[i].item_detail,
            qty: aawakEntry[i].quantity,
            rate: aawakEntry[i].rate,
            actual_amt: aawakEntry[i].amount,
            aawak_type_id: null,
            mm_id: null,
            description: aawakEntry[i].desc,
            active: 1,
            mm_hin: aawakEntry[i].aawak_mm_hin,
            mm_eng: aawakEntry[i].aawak_mm_eng,
            mm_code: aawakEntry[i].aawak_mm_code,
            roll_no: aawakEntry[i].aawak_roll_no,
            pbk_hin: aawakEntry[i].pbk_hin,
            pbk_eng: aawakEntry[i].pbk_eng,
            relative_name: aawakEntry[i].sdw_of,
            aawak_type_hin: aawakEntry[i].itemtype_hin,
            aawak_type_eng: aawakEntry[i].itemtype_eng,
            unit_full: aawakEntry[i].unit_full,
            unit_short: aawakEntry[i].unit_short,
            item_hin: aawakEntry[i].item_hin,
            item_eng: aawakEntry[i].item_eng,
            subitem_hin: aawakEntry[i].subitem_hin,
            subitem_eng: aawakEntry[i].subitem_eng,
            item_code: aawakEntry[i].item_code,
            nimmit: aawakEntry[i].nimmit,
            nimitt_id: null,
            jawak_detail: []
          }

          //finding aawak_mm_id
          if (aawakEntry[i].aawak_mm_id) {
            this.gs.Lists.mm.find((m: { mm_hin: string; mm_eng: string; mm_code: string; parent_mm_id: null; _id: any; }) => {
              if (!m.parent_mm_id && (m.mm_hin == aawakEntry[i].aawak_mm_hin || m.mm_eng == aawakEntry[i].aawak_mm_eng || m.mm_code == aawakEntry[i].aawak_mm_code)) {
                newAawak[i].mm_id = m._id;
              }
            });
          }

          //finding pbk_id
          if (aawakEntry[i].pbk_id) {
            this.gs.Lists.pbk.find((p: { _id: any; roll_no: any; }) => {
              if (p.roll_no == aawakEntry[i].roll_no) {
                newAawak[i].pbk_id = p._id;
              }
            });
          }

          //finding item_id and subitem_id
          if (aawakEntry[i].item_id) {
            this.gs.Lists.itemmix.find((it: { _id: any; item_hin: any; item_eng: any; subitems: any[] }) => {
              if (it.item_hin == aawakEntry[i].item_hin || it.item_eng == aawakEntry[i].item_eng) {
                newAawak[i].item_id = it._id;
                if (aawakEntry[i].subitem_id) {
                  it.subitems.find(si => {
                    if (si.subitem_hin == aawakEntry[i].subitem_hin || si.subitem_eng == aawakEntry[i].subitem_eng) {
                      newAawak[i].subitem_id = si._id;
                    }
                  });
                }
              }
            });
          }

          //findig nimmit
          if (aawakEntry[i].nimmit && aawakEntry[i].nimmit.trim() != '') {
            this.gs.Lists.nimmit.find((n: { nimmit_hin: any; nimmit_eng: any; _id: any; }) => {
              if (n.nimmit_hin == aawakEntry[i].nimmit || n.nimmit_eng == aawakEntry[i].nimmit) {
                newAawak[i].nimitt_id = n._id;
              }
            });

          }

          // finding unit
          if (aawakEntry[i].unit_id) {
            this.gs.Lists.unit.find((u: { unit_full: any; unit_short: any; _id: any; }) => {
              if (u.unit_full == aawakEntry[i].unit_full || u.unit_short == aawakEntry[i].unit_short) {
                newAawak[i].unit_id = u._id;
              }
            });
          }

          // finding and setting jawak
          for (let jwk of aawakEntry[i].jawak_detail) {
            if (jwk.jawak_mm_id && jwk.jawak_quantity) {
              let newjwk: any = {};
              newjwk.jawak_mm_hin = jwk.jawak_mm_hin;
              newjwk.jawak_mm_eng = jwk.jawak_mm_eng;
              newjwk.jawak_mm_code = jwk.jawak_mm_code;
              newjwk.qty = jwk.quantity;
              newjwk.jawak_mm_id = null;

              this.gs.Lists.mm.find((m: { mm_hin: string; mm_eng: string; mm_code: string; parent_mm_id: null; _id: string; }) => {
                if (jwk.jawak_mm_id && !m.parent_mm_id && (m.mm_hin == jwk.jawak_mm_hin || m.mm_eng == jwk.jawak_mm_eng || m.mm_code == jwk.jawak_mm_code)) {
                  newjwk.jawak_mm_id = m._id;
                }
              });

              newAawak[i].jawak_detail.push(newjwk);
            }
          }

          this.openModal('import');
          this.importData = newAawak;
        }

      }

    }
    ev = null;
  }

  exportAll = async () => {
    this.isLoader = true;
    this.dataZip = new JSZip();
    this.http.get(this.api.getUrl('EXPORTALL')).subscribe((data: any) => {
      this.dataZip.file("aawak.json", JSON.stringify(data['result']['aawak']));
      this.dataZip.file("category.json", JSON.stringify(data['result']['category']));
      this.dataZip.file("city.json", JSON.stringify(data['result']['city']));
      this.dataZip.file("country.json", JSON.stringify(data['result']['country']));
      this.dataZip.file("department.json", JSON.stringify(data['result']['department']));
      this.dataZip.file("department_config.json", JSON.stringify(data['result']['department_config']));
      this.dataZip.file("item.json", JSON.stringify(data['result']['item']));
      this.dataZip.file("jawak.json", JSON.stringify(data['result']['jawak']));
      this.dataZip.file("mm.json", JSON.stringify(data['result']['mm']));
      this.dataZip.file("pbk.json", JSON.stringify(data['result']['pbk']));
      this.dataZip.file("point.json", JSON.stringify(data['result']['point']));
      this.dataZip.file("product.json", JSON.stringify(data['result']['product']));
      this.dataZip.file("state.json", JSON.stringify(data['result']['state']));
      this.dataZip.file("subitem.json", JSON.stringify(data['result']['subitem']));
      this.dataZip.file("subitem_list.json", JSON.stringify(data['result']['subitem_list']));
      this.dataZip.file("support_list.json", JSON.stringify(data['result']['support_list']));
      this.dataZip.file("unit.json", JSON.stringify(data['result']['unit']));

      this.dataZip.generateAsync({ type: "blob" }).then(function (content: Blob) {
        FileSaver.saveAs(content, "Data.zip");
      });
      console.log("datazip", this.dataZip);

      this.toastr.success(data['message']);
      this.isLoader = false;
    });
  }

  importFile(url: any, file: any) {
    this.isLoader = true;
    this.http.post(this.api.getUrl(url), file).subscribe((data: any) => {
      if (data['success']) {
        this.isLoader = false;
        this.toastr.success(data['result'].length + ' - ' + url + 'inserted');
      } else {
        this.isLoader = false;
        this.toastr.error(data['message']);
      }
    }, err => {
      this.toastr.error(err['message']);
      this.isLoader = false;
    });
  }

}
