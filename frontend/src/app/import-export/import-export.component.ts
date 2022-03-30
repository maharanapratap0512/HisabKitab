import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { HttpClient, JsonpClientBackend } from '@angular/common/http';
import { getLocaleDateFormat, Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { FileSaverService } from 'ngx-filesaver';
import { NgxSpinnerService } from 'ngx-spinner';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2'
declare var $: any;
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent implements OnInit {

  willDownload = false;
  // wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: any;

  tableData: any = ['Entry', 'PBKs', 'MM', 'Item', 'Sub Item', 'Item Type', 'Category', 'Unit', 'City', 'State', 'Country'];
  isLoader: boolean = false;
  entryFormData: any = [];
  categoryFormData: any = [];
  cityFormData: any = [];
  itemFormData: any = [];
  itemtypeFormData: any = [];
  mmFormData: any = [];
  pbkFormData: any = [];
  stateFormData: any = [];
  subitemFormData: any = [];
  unitFormData: any = [];
  exportData: any = [];
  importdata: any;
  inputFile: any;
  importfilename: any;
  downloadJsonHref: any;
  countryFormData: any;
  mmstate: any;
  singlestate: any;
  states: any = [];
  mms: any = [];
  dataZip: any;
  url: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private httpClient: HttpClient,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private fs: FileSaverService,
    private spinner: NgxSpinnerService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.isLoader = true;
    this.http.get(this.api.getUrl('STATE')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.states = data['result'];
        // this.exportFile(data['result'], 'StateData.json');
        this.isLoader = false;
      }
      this.isLoader = false;
    });
    this.isLoader = true;
    this.http.get(this.api.getUrl('MM')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.mms = data['result'];
        this.isLoader = false;
      }
    });
  }

  // Import Functions-------------------
  // =======================================

  import(name: any, ev: any) {

    this.isLoader = true;
    var ext = ev.target.files[0].name.substr(ev.target.files[0].name.lastIndexOf('.') + 1);
    var str = ev.target.files[0].name.split('.');
    var str1 = str[0].split(' ');
    this.importfilename = str1[0];

    // if (ext == "json" || ext == "JSON") {
    let selectedFile = ev.target.files[0];
    const fileReader: any = new FileReader();
    fileReader.readAsText(selectedFile, "UTF-8");
    fileReader.onload = () => {
      // console.log(JSON.parse(fileReader.result));
      this.importdata = JSON.parse(fileReader.result);
      if (name == "Entry") {
        if (this.importfilename != 'EntryData') {
          this.errorToaster('EntryData')
        } else {
          this.importFile('ENTRYIMPORT', this.importdata);
        }
      }
      else if (name == "PBKs") {
        if ((this.importfilename == 'PbkData' || this.importfilename == 'PbksData')) {
          this.importFile('PBKIMPORT', this.importdata);
        } else {
          this.errorToaster('PbkData')
        }
      }
      else if (name == "MM") {
        if (this.importfilename != 'MMData') {
          this.errorToaster('MMData')
        } else {
          this.importFile('MMIMPORT', this.importdata);
        }
      }
      else if (name == "Item") {
        if (this.importfilename == 'ItemData' || this.importfilename == 'ItemsData') {
          this.importFile('ITEMIMPORT', this.importdata);
        } else {
          this.errorToaster('ItemData')
        }
      }
      else if (name == "Sub Item") {
        if (this.importfilename == 'SubitemData' || this.importfilename == 'SubitemData') {
          this.importFile('SUBITEMIMPORT', this.importdata);
        } else {
          this.errorToaster('SubitemData')
        }
      }
      else if (name == "Item Type") {
        if (this.importfilename == 'ItemtypeData' || this.importfilename == 'ItemtypesData') {
          this.importFile('ITEMTYPEIMPORT', this.importdata);
        } else {
          this.errorToaster('ItemtypeData')
        }
      }
      else if (name == "Category") {
        if (this.importfilename != 'CategoryData') {
          this.errorToaster('CategoryData')
        } else {
          this.importFile('CATIMPORT', this.importdata);
        }
      }
      else if (name == "Unit") {
        if (this.importfilename != 'UnitData') {
          this.errorToaster('UnitData')
        } else {
          this.importFile('UNITIMPORT', this.importdata);
        }
      }
      else if (name == "City") {
        if (this.importfilename != 'CityData') {
          this.errorToaster('CityData')
        } else {
          this.importFile('CITYIMPORT', this.importdata);
        }
      }
      else if (name == "State") {
        if (this.importfilename != 'StateData') {
          this.errorToaster('StateData')
        } else {
          this.importFile('STATEIMPORT', this.importdata);
        }
      }
      else if (name == "Country") {
        if (this.importfilename != 'CountryData') {
          this.errorToaster('CountryData')
        } else {
          this.importFile('COUNTRYIMPORT', this.importdata);
        }
      }
      this.isLoader = false;
    }
    fileReader.onerror = (error: any) => {
      this.isLoader = false;
      this.toastr.error('Can not Read File.')
    }    
  }

  importFile(url: any, file: any) {
    this.isLoader = true;
    this.http.put(this.api.getUrl(url), { import: file }).subscribe((data: any) => {
      if (data['success']) {
        this.isLoader = false;
        this.toastr.success(data['message']);
      } else {
        this.isLoader = false;
        this.toastr.error(data['message']);
      }
      this.inputFile = null;
    }, err => {
      this.toastr.error(err['message']);
      this.isLoader = false;
    });
  }

  errorToaster(importfilename: any) {
    this.toastr.error('Please Import "' + importfilename + '" File.');
    this.isLoader = false;
  }


  // Export Functions-------------------
  // =======================================
  export(data: any) {
    this.isLoader = true;
    if (data == "Entry") {
      // this.getEntryData();
      this.isLoader = false;
    }
    else if (data == "PBKs") {
      this.getPbkData();
      this.isLoader = false;
    }
    else if (data == "MM") {
      this.getMM();
      this.isLoader = false;
    }
    else if (data == "Item") {
      this.getItems();
      this.isLoader = false;
    }
    else if (data == "Sub Item") {
      this.getSubitems();
      this.isLoader = false;
    }
    else if (data == "Item Type") {
      // this.getItemtypes();
      this.isLoader = false;
    }
    else if (data == "Category") {
      this.getCatData();
      this.isLoader = false;
    }
    else if (data == "Unit") {
      this.getUnitData();
      this.isLoader = false;
    }
    else if (data == "City") {
      this.getCityData();
      this.isLoader = false;
    }
    else if (data == "State") {
      this.getState();
      this.isLoader = false;
    }
    else if (data == "Country") {
      this.getCountry();
      this.isLoader = false;
    }
  }


  exportFile(file: any, filename: any) {
    if (file) {
      this.isLoader = true;
      var theJSON = JSON.stringify(file);
      const txtBlob = new Blob([theJSON], { type: 'text/json' });
      this.fs.save(txtBlob, filename);
      this.isLoader = false;
    }

  }

  // getEntryData() {
  //   this.isLoader = true;
  //   this.http.get(this.api.getUrl('ENTRY')).subscribe((data) => {
  //     if (data['result'] && data['success']) {
  //       this.entryFormData = data['result'];
  //       this.exportFile(data['result'], 'EntryData.json');
  //       this.isLoader = false;
  //     }
  //     this.isLoader = false;
  //   });
  // }

  getPbkData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('PBK')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.pbkFormData = data['result'];
        for (let i in this.pbkFormData) {
          if (this.pbkFormData[i].dob) {
            let bdate = new Date(this.pbkFormData[i].dob);
            const timeDiff = Math.abs(Date.now() - bdate.getTime());
            let showAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
            this.pbkFormData[i].age = showAge;
          }
        }
        this.exportFile(data['result'], 'PbkData.json');
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  getMM() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('MM')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.mmFormData = data['result'];
        this.exportFile(data['result'], 'MMData.json');
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  getItems() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('ITEM')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.itemFormData = data['result'];
        this.exportFile(data['result'], 'ItemData.json');
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  getSubitems() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('SUBITEM')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.subitemFormData = data['result'];
        this.exportFile(data['result'], 'SubitemData.json');
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  // getItemtypes() {
  //   this.isLoader = true;
  //   this.http.get(this.api.getUrl('ITEMTYPE')).subscribe((data) => {
  //     if (data['result'] && data['success']) {
  //       this.itemtypeFormData = data['result'];
  //       this.exportFile(data['result'], 'ItemtypeData.json');
  //       this.isLoader = false;
  //     }
  //     this.isLoader = false;
  //   });
  // }

  getCatData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('CATEGORY')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.categoryFormData = data['result'];
        this.exportFile(data['result'], 'CategoryData.json');
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  getUnitData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('UNIT')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.unitFormData = data['result'];
        this.exportFile(data['result'], 'UnitData.json');
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  getCityData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('CITY')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.cityFormData = data['result'];
        this.exportFile(data['result'], 'CityData.json');
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  getState() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('STATE')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.stateFormData = data['result'];
        this.exportFile(data['result'], 'StateData.json');
        this.isLoader = false;
      }
      this.isLoader = false;
    })
  }

  getCountry() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('COUNTRY')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.countryFormData = data['result'];
        this.exportFile(data['result'], 'CountryData.json');
        this.isLoader = false;
      }
      this.isLoader = false;
    })
  }

  mmChanged(event: any) {
    if (event) {
      let arr = event.split(':');
      this.singlestate = arr[1];
    }
  }

  exportProject = async () => {
    this.isLoader = true;
    this.dataZip = new JSZip();
    let projectZip = new JSZip();


    this.http.post(this.api.getUrl('EXPORTALL'), { type: 'project', pbkfilter: { state_id: this.singlestate } }).subscribe((data: any) => {

      this.dataZip.file("ItemtypeData.json", JSON.stringify(data['result']['itemtype']));
      this.dataZip.file("PbkData.json", JSON.stringify(data['result']['pbk']));
      this.dataZip.file("MMData.json", JSON.stringify(data['result']['mm']));
      this.dataZip.file("StateData.json", JSON.stringify(data['result']['state']));
      this.dataZip.file("ItemData.json", JSON.stringify(data['result']['item']));
      this.dataZip.file("SubitemData.json", JSON.stringify(data['result']['subitem']));
      this.dataZip.file("CategoryData.json", JSON.stringify(data['result']['category']));
      this.dataZip.file("UnitData.json", JSON.stringify(data['result']['unit']));
      this.dataZip.file("CityData.json", JSON.stringify(data['result']['city']));


      this.http.get(this.api.getUrl('MMPROJECT')).subscribe((data) => {
        // console.log(data.result);      

        projectZip.loadAsync(data.result.data).then(async (project) => {
          let settings = {
            'mm_name': this.mmstate.split(':')[0],
            'created_at': 'date'
          };
          console.log(this.dataZip);

          await this.dataZip.generateAsync({ type: "blob" }).then(function (content: Blob) {
            project.file("SoftwareData.zip", content);
          });
          project.file("EntrySoftware/settings.json", JSON.stringify(settings));
          console.log("project", project);


          await project.generateAsync({ type: "blob" }).then(function (content: Blob) {
            FileSaver.saveAs(content, "project.zip");
          });

          // setTimeout(() => {
          this.toastr.success("EntrySoftware Download as Project.zip");
          this.isLoader = false;
          // }, 10000);

        });
      });

    });
  }

  //import from zip file
  importAll = async (ev: any) => {
    this.isLoader = true;

    // checking if file found or not
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
            console.log(fileNames);

            //loop through all files
            for (let i in fileNames) {

              //accept only files that listed below, other ignore.
              switch (fileNames[i]) {
                case 'ItemtypeData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('ITEMTYPEIMPORT', JSON.parse(data));
                  });
                  break;
                case 'PbkData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('PBKIMPORT', JSON.parse(data));
                  });
                  break;
                case 'MMData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('MMIMPORT', JSON.parse(data));
                  });
                  break;
                case 'StateData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('STATEIMPORT', JSON.parse(data));
                  });
                  break;
                case 'ItemData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('ITEMIMPORT', JSON.parse(data));
                  });
                  break;
                case 'SubitemData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('SUBITEMIMPORT', JSON.parse(data));
                  });
                  break;
                case 'CategoryData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('CATIMPORT', JSON.parse(data));
                  });
                  break;
                case 'UnitData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('UNITIMPORT', JSON.parse(data));
                  });
                  break;
                case 'CityData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('CITYIMPORT', JSON.parse(data));
                  });
                  break;
                case 'CountryData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('COUNTRYIMPORT', JSON.parse(data));
                  });
                  break;
                case 'EntryData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data)
                      this.importFile('ENTRYIMPORT', JSON.parse(data));
                  });
                  break;
              }
            }
          }

        });

      }

    }
  }

  exportAll = async () => {
    this.isLoader = true;
    this.dataZip = new JSZip();
    this.http.post(this.api.getUrl('EXPORTALL'), {}).subscribe((data: any) => {
      this.dataZip.file("ItemtypeData.json", JSON.stringify(data['result']['itemtype']));
      this.dataZip.file("PbkData.json", JSON.stringify(data['result']['pbk']));
      this.dataZip.file("MMData.json", JSON.stringify(data['result']['mm']));
      this.dataZip.file("StateData.json", JSON.stringify(data['result']['state']));
      this.dataZip.file("ItemData.json", JSON.stringify(data['result']['item']));
      this.dataZip.file("SubitemData.json", JSON.stringify(data['result']['subitem']));
      this.dataZip.file("CategoryData.json", JSON.stringify(data['result']['category']));
      this.dataZip.file("UnitData.json", JSON.stringify(data['result']['unit']));
      this.dataZip.file("CityData.json", JSON.stringify(data['result']['city']));
      this.dataZip.file("CountryData.json", JSON.stringify(data['result']['country']));
      this.dataZip.file("EntryData.json", JSON.stringify(data['result']['entry']));

      setTimeout(() => {
        this.dataZip.generateAsync({ type: "blob" }).then(function (content: Blob) {
          FileSaver.saveAs(content, "Data.zip");
        });
        this.toastr.success(data['message']);
        this.isLoader = false;
      }, 3000);
    });
  }
}
