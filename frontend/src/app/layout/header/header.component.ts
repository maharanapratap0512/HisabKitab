import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  title!: string;
  dataZip: any;
  // dept_eng: any;
  // dept_code: any;
  // isDept: any;
  isLoader: boolean = false;
  webUser: any;

  constructor(private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private router: Router,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
  }

  ngOnInit(): void {
    // var url = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
    // console.log(url);
    // $('[data-toggle="tooltip"]').tooltip();
    // this.dept_code = window.localStorage.getItem('dept_code');
    // this.dept_eng = window.localStorage.getItem('dept_eng');
    // console.log("dept",this.dept_code, this.dept_eng);
    // this.isDept = (this.gs.Lists.department ? this.gs.Lists.department.length : 0);
  }

  logout() {
    this.auth.removewebUser()
    // window.localStorage.removeItem('dept_id');
    // window.localStorage.removeItem('dept_eng');
    // window.localStorage.removeItem('dept_code');
    this.router.navigate(['login']);
  }

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
                  // zip.file(fileNames[i]).async("string").then((data: any) => {
                  //   this.importFile('ITEMTYPEIMPORT', JSON.parse(data));
                  // });
                  break;
                case 'PbkData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('PBK', JSON.parse(data));
                  });
                  break;
                case 'MMData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('MM', JSON.parse(data));
                  });
                  break;
                case 'StateData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('STATE', JSON.parse(data));
                  });
                  break;
                case 'ItemData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('ITEM', JSON.parse(data));
                  });
                  break;
                case 'SubitemData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('SUBITEM', JSON.parse(data));
                  });
                  break;
                case 'CategoryData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('CATEGORY', JSON.parse(data));
                  });
                  break;
                case 'UnitData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('UNIT', JSON.parse(data));
                  });
                  break;
                case 'CityData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('CITY', JSON.parse(data));
                  });
                  break;
                case 'CountryData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('COUNTRY', JSON.parse(data));
                  });
                  break;
                case 'ProductData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    this.importFile('PRODUCT', JSON.parse(data));
                  });
                  break;
                case 'EntryData.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data)
                      this.importFile('ENTRY', JSON.parse(data));
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
    this.http.get(this.api.getUrl('EXPORTALL')).subscribe((data: any) => {
      // this.dataZip.file("ItemtypeData.json", JSON.stringify(data['result']['itemtype']));
      this.dataZip.file("PbkData.json", JSON.stringify(data['result']['Pbks']));
      this.dataZip.file("MMData.json", JSON.stringify(data['result']['MMs']));
      this.dataZip.file("StateData.json", JSON.stringify(data['result']['States']));
      this.dataZip.file("ItemData.json", JSON.stringify(data['result']['Items']));
      this.dataZip.file("SubitemData.json", JSON.stringify(data['result']['Subitems']));
      this.dataZip.file("CategoryData.json", JSON.stringify(data['result']['Categories']));
      this.dataZip.file("UnitData.json", JSON.stringify(data['result']['Units']));
      this.dataZip.file("CityData.json", JSON.stringify(data['result']['Cities']));
      this.dataZip.file("CountryData.json", JSON.stringify(data['result']['Countries']));
      this.dataZip.file("ProductData.json", JSON.stringify(data['result']['Products']));
      // this.dataZip.file("EntryData.json", JSON.stringify(data['result']['entry']));

      setTimeout(() => {
        this.dataZip.generateAsync({ type: "blob" }).then(function (content: Blob) {
          FileSaver.saveAs(content, "Data.zip");
        });
        this.toastr.success(data['message']);
        this.isLoader = false;
      }, 3000);
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
