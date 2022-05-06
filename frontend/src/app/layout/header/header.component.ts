import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  title!: string;
  dataZip: any;
  isShow: boolean = false;
  topPosToStartShowing = 100;
  isLoader: boolean = false;
  settings: any;

  constructor(
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private router: Router,
    private toastr: ToastrService,
    public auth: AuthService,) {
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

  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  ngOnInit(): void {
    // console.log(this.auth.webUser);
    this.settings = this.auth.webUser.settings;
  }

  logout() {
    this.auth.removewebUser()
    this.router.navigate(['login']);
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
    this.isLoader = true;
    this.dataZip = new JSZip();
    this.http.get(this.api.getUrl('EXPORTUPDATES') + this.auth.webUser.dept_id).subscribe((data: any) => {
      console.log("data", data);
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

      // setTimeout(() => {
      let dept = this.auth.webUser;
      let date = new Date();
      this.dataZip.generateAsync({ type: "blob" }).then(function (content: Blob) {
        FileSaver.saveAs(content, dept.dept_eng + "_update_" + date.getDate() + "-" +date.getMonth() + "-" + date.getFullYear() + ".zip");
      });
      this.isLoader = false;
      // }, 3000);
      this.toastr.success("Updated Settings downloaded for '" + dept.dept_eng + "'");
    });

    // this.dataZip.generateAsync({ type: "blob" }).then(function (content: Blob) {
    //   FileSaver.saveAs(content, dept.dept_eng + "_update_" + date.getDate() + "-" +date.getMonth() + "-" + date.getFullYear() + ".zip");
    // });
    this.isLoader = false;
  }

  importZip = async (ev: any) => {
    this.isLoader = true;

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
            // console.log("fileNames", fileNames);
            // console.log("zip", zip);

            // loop through all files
            for (let i in fileNames) {

              //accept only files that listed below, other ignore.
              switch (fileNames[i]) {
                case 'settings.json':
                  console.log("settings file found");

                  zip.file(fileNames[i]).async("string").then((data: any) => {

                    if (data) {
                      let setting = JSON.parse(data);
                      let body = {
                        query: {
                          _id: (setting._id ? setting._id : null),
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

                      this.http.put(this.api.getUrl('DEPTCONFIG'), body).subscribe((result: any) => {
                        let setting = JSON.parse(result.config_value);
                        if (result.dept_id == this.auth.webUser.dept_id) {
                          this.auth.updateSettings(setting);
                        }
                        this.toastr.success("settings import successfully");
                      });
                    }
                    else {
                      this.toastr.error('can not read settings file from zip')
                    }
                    // this.importFile('ITEMTYPEIMPORT', JSON.parse(data));
                  });
                  break;

              }
            }
          }

        });

      }

    }
    ev = null;
  }

  importOldData = async (ev: any) => {
    this.isLoader = true;

    if (ev.target.files[0]) {

      const fileReader: any = new FileReader();
      fileReader.readAsText(ev.target.files[0], 'UTF-8'); //reading 1st file only

      fileReader.onload = () => {

        let aawakEntry = JSON.parse(fileReader.result);        
        let newAawak:any = [];
        for(let i in aawakEntry){

          newAawak[i] = {
            pkt_num: aawakEntry[i].parchi_num,
            pbk_id: null,
            date: aawakEntry[i].date,
            item_id:null,
            subitem_id:null,
            unit_id:null,
            item_detail:aawakEntry[i].item_detail,
            qty:aawakEntry[i].quantity,
            rate:aawakEntry[i].rate,
            actual_amt:aawakEntry[i].amount,
            aawak_type_id: null,
            mm_id: null,
            description: aawakEntry[i].desc,
            active:1,

          }

          //finding aawak_mm_id
          this.gs.Lists.mm.find((m: { mm_hin: string; mm_eng: string; mm_code: string; parent_mm_id: null; _id: string; })=>{
            if(aawakEntry[i].aawak_mm_id && !m.parent_mm_id && (m.mm_hin == aawakEntry[i].aawak_mm_hin  || m.mm_eng == aawakEntry[i].aawak_mm_eng || m.mm_code == aawakEntry[i].aawak_mm_code)){
              aawakEntry[i].mm_id = m._id;
            }
          });
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
