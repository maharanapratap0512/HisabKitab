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
  webUser: any;

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
    
  }

  logout() {
    this.auth.removewebUser()
    this.router.navigate(['login']);
  }

  exportUpdate(){
    this.isLoader = true;
    this.http.get(this.api.getUrl('IMPORTUPDATES') + this.auth.webUser.dept_id).subscribe((data)=>{
      if(data['result']){
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

  importAll = async (ev: any) => {
    this.isLoader = true;

    // checking if file found or not
    if (ev.target.files[0]) {
      // var tmppath = URL.createObjectURL(ev.target.files[0]);
      // console.log("path", ev.target.files[0]);
      
      let formData = new FormData();

      formData.append("updateDB", ev.target.files[0], this.auth.webUser.dept_eng);

      this.http.postFormData(this.api.getUrl("DBUPLOAD"), formData).subscribe((result:any)=>{
        console.log(result);
        
      });
      
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
