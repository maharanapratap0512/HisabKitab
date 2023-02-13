import { Component, OnInit } from '@angular/core';
import { ExcelImportService } from '../services/excel-import.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-excel-import',
  templateUrl: './excel-import.component.html',
  styleUrls: ['./excel-import.component.scss']
})
export class ExcelImportComponent implements OnInit {
  importType: any;
  isLoader: any = false;
  excelArr: any = [];
  headerCount: any = 0;
  headerConfig: any = [];
  is2Header: any = false;
  header1: any = 0;
  header2: any = null;
  nextButton:any = false;
  constructor(
    public EIService: ExcelImportService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit(): void {
  }

  excelImport(ev: any) {
    console.log(this.is2Header);

    if (ev) {
      let workBooks: any = null;
      const reader = new FileReader();
      const file = ev.target.files[0];
      reader.onload = (event) => {
        this.isLoader = true;
        // this.loadingStatus = "फाइल लोड की जा रही है ।";        
        const data = reader.result;
        workBooks = XLSX.read(data, { type: 'binary' });
        this.excelArr = XLSX.utils.sheet_to_json(workBooks.Sheets[workBooks.SheetNames[0]], { header: 1 });
        this.isLoader = false;
        for (let i = 0; i < this.excelArr.length; i++) {
          if (this.excelArr[i].length > this.headerCount) {
            this.headerCount = this.excelArr[i].length;
          }
        }
      }
      reader.readAsBinaryString(file);
      ev = null;
    }
    else {
      ev = null;
    }
  }

  nextClick() {
    // this.isLoader = true;
  }

  headerChanged(index: any) {
    for (let i in this.excelArr[index]) {
      let header = this.excelArr[index][i].trim().toLowerCase();
      for (let j in this.headerConfig) {
        if (this.headerConfig[j].name == header || this.headerConfig[j].alt_names.includes(header)) {
          this.headerConfig[j].found = true;
        }
      }
    }
    if(this.headerConfig.find((h: { found: any; })=>!h.found)){
      this.nextButton = true;
    }
  }

}
