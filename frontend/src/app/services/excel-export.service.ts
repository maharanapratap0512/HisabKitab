

import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import { AuthService } from './auth.service';
import { GlobalService } from './global.service';
import { log } from 'console';


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor(public auth: AuthService,
    public gs: GlobalService) { }

  // async promptForDownload(data: Blob, fileName: string) {
  //   const options = {
  //     types: [{ accept: 'application/octet-stream' }],
  //   };

  //   return window.showSaveFilePicker()
  //     .then((handle: any) => {
  //       // this.writeFile(handle, data, fileName)
  //       console.log(handle);

  //     });
  // }

  // private async writeFile(handle: FileSystemDirectoryHandle, data: Blob, fileName: string): Promise<FileSystemDirectoryEntry> {
  //   const writer = await handle.createWriter();
  //   const blobWriter = writer.write(data);
  //   await blobWriter.promise;
  //   writer.close();
  //   return handle.getFile(fileName);
  // }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    console.log("excel json", json);

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }



  public exportTblToExcelFile(table: any, excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table, { raw: false });
    console.log('worksheet', worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    if (fileName && fileName.trim() == '') {
      FileSaver.saveAs(data, `HK_export_` + new Date().getTime() + EXCEL_EXTENSION);
    } else {
      FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
    }
  }









  // public exportAsExcelFile(el: HTMLElement, excelFileName: string): void {
  //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(el);
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  //   XLSX.writeFile(wb, excelFileName + '.xlsx');
  // }
















  // generateExcel(json: any[], excelFileName: string): void {
  //   let date = new Date();
  //   var options = {
  //     filename: './AawakJawak_' + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx',
  //     useStyles: true,
  //     useSharedStrings: true
  //   };
  //   let workbook = new Workbook();
  //   var worksheet = workbook.addWorksheet('Sheet1');


  //   /*TITLE*/
  //   worksheet.mergeCells([1, 1, 1, 23]);
  //   worksheet.getCell('C1').value = 'आवक जावक बुक'
  //   worksheet.getRow(1).font = { name: 'Corbel', family: 4, size: 20, };
  //   worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  //   ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2', 'J2', 'K2', 'L2', 'M2', 'N2', 'O2', 'P2', 'Q2', 'R2', 'S2', 'T2', 'U2', 'V2','W2'].map(key => {
  //     worksheet.getCell(key).fill = {
  //       type: 'pattern', pattern: 'solid', fgColor: { argb: '96C8FB' }, bgColor: { argb: '96C8FB' }
  //     };
  //   });

  //   /*SUBTITLE*/
  //   worksheet.mergeCells('A2', 'P2');
  //   worksheet.getCell('A2').value = 'आवक';
  //   worksheet.mergeCells('Q2', 'W2');
  //   worksheet.getCell('Q2').value = 'जावक';
  //   ['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3', 'J3', 'K3', 'L3', 'M3', 'N3', 'O3', 'P3', 'Q3', 'R3', 'S3', 'T3', 'U3', 'V3','W3'].map(key => {
  //     worksheet.getCell(key).fill = {
  //       type: 'pattern', pattern: 'solid', fgColor: { argb: '23423' }, bgColor: { argb: '98754' }
  //     };
  //   });

  //   worksheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  //   /*Column headers*/
  //   worksheet.getRow(3).values = ['No', 'MM', 'Date', 'Pkt No', 'Aawak MM', 'Roll No', 'Pbk', 'Relation', 'Relative', 'Item', 'Subitem', 'Company', 'Qty', 'Unit', 'Condition', 'Aawak Type', 'Date', 'Jawak MM', 'Kisko Diya', 'Qty', 'Unit', 'Jawak Type', 'Bachat'];

  //   /*Define your column keys because this is what you use to insert your data according to your columns, they're column A, B, C, D respectively being idClient, Name, Tel, and Adresse. 
  //   So, it's pretty straight forward */
  //   worksheet.columns = [
  //     { key: 'No' },
  //     { key: 'MM' },
  //     { key: 'Date' },
  //     { key: 'Pkt No' },
  //     { key: 'Aawak MM' },
  //     { key: 'Roll No' },
  //     { key: 'Pbk' },
  //     { key: 'Relation' },
  //     { key: 'Relative' },
  //     { key: 'Item' },
  //     { key: 'Subitem' },
  //     { key: 'Company' },
  //     { key: 'Qty' },
  //     { key: 'Unit' },
  //     { key: 'Condition' },
  //     { key: 'Aawak Type' },
  //     { key: 'J_Date' },
  //     { key: 'J_Jawak MM' },
  //     { key: 'J_Kisko Diya' },
  //     { key: 'J_Qty' },
  //     { key: 'J_Unit' },
  //     { key: 'J_Jawak Type' },
  //     { key: 'J_Bachat' }
  //   ]

  //   worksheet.getColumn(1).width = 6;
  //   worksheet.getColumn(2).width = 11;
  //   worksheet.getColumn(3).width = 8;
  //   worksheet.getColumn(5).width = 11;
  //   // worksheet.getColumn(5).width = 8;
  //   //roll no - 6
  //   worksheet.getColumn(7).width = 15;
  //   worksheet.getColumn(9).width = 15;
  //   //item -10
  //   worksheet.getColumn(10).width = 12;
  //   worksheet.getColumn(11).width = 12;
  //   //company - 12
  //   worksheet.getColumn(13).width = 7;
  //   worksheet.getColumn(14).width = 6
  //   //condition - 15
  //   worksheet.getColumn(16).width = 11
  //   //start jawak - 17
  //   worksheet.getColumn(17).width = 11
  //   worksheet.getColumn(18).width = 11
  //   worksheet.getColumn(19).width = 15
  //   worksheet.getColumn(20).width = 7
  //   worksheet.getColumn(21).width = 6
  //   worksheet.getColumn(22).width = 11


  //   /* Now we use the keys we defined earlier to insert your data by iterating through arrData and calling worksheet.addRow()*/
  //   json.forEach(function (item, i) {
  //     worksheet.addRow(json[i])
  //     let bachat = json[i].Qty;
  //     json[i]['Jawak Detail'].forEach(function (jitem: any, j: number) {
  //       bachat -= jitem.Qty;
  //       let obj = {
  //         'J_Date': jitem.Date,
  //         'J_Jawak MM': jitem['Jawak MM'],
  //         'J_Kisko Diya': jitem['Kisko Diya'],
  //         'J_Qty': jitem.Qty,
  //         'J_Unit': jitem.Unit,
  //         'J_Jawak Type': jitem['Jawak Type'],
  //         'J_Bachat': bachat
  //       };        
  //       worksheet.addRow(['','','','','','','','','','','','','','','',''].concat(Object.values(obj)));
  //     });   
  //     // let totalqty = 0;
  //     // let totalunit;
  //     // json[i]['Jawak Detail'].forEach(function (jtotal: any, t: number) {
  //     //   totalqty += jtotal.Qty
  //     //   totalunit = jtotal.Unit
  //     // })
  //     // worksheet.addRow({
  //     //   'J_Item': 'Total',
  //     //   'J_Qty': totalqty,
  //     //   'J_Unit': totalunit
  //     // }).font = { name: 'Corbel', family: 4, bold: true };;
  //   })


  //   worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
  //     row.eachCell({ includeEmpty: false }, function (cell, colNumber) {
  //       cell.border = {
  //         top: { style: "thin" },
  //         left: { style: "thin" },
  //         bottom: { style: "thin" },
  //         right: { style: "thin" }
  //       };;
  //     });
  //   });

  //   let fileName = excelFileName + ".xlsx";
  //   const excelBuffer: any = workbook.xlsx.writeBuffer();
  //   workbook.xlsx.writeBuffer()
  //     .then(function (buffer: any) {
  //       // done buffering
  //       const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //       FileSaver.saveAs(data, fileName);
  //     });
  // }


  /* generate Excel by json
  options = {
    title,
    Heading
  }
   */
  generateExcel(json: any[], excelFileName: string, options = {}): void {
    let workbook = new Workbook();
    var worksheet = workbook.addWorksheet('Sheet1');

    let colCount = Object.keys(json[0]).length;
    let Subtitle = ['Aawak Detail'];
    let Header = [];
    for (let key of Object.keys(json[0])) {
      if (typeof json[0][key] == "object" && json[0][key].length > 0) {

        colCount += Object.keys(json[0][key][0]).length;
        Subtitle.push(key);
      }
      else {
        Header.push({ Header: key, key: key });
      }
    }


    /*TITLE*/
    worksheet.mergeCells([1, 1, 1, colCount - Subtitle.length + 1]);
    worksheet.getCell('A1').value = 'आवक जावक बुक'
    worksheet.getRow(1).font = { name: 'Corbel', family: 4, size: 20, };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // worksheet.getCell(1,1).fill = {
    //   type: 'pattern', pattern: 'solid', fgColor: { argb: '96C8FB' }, bgColor: { argb: '96C8FB' }
    // };

    /*SUBTITLE*/
    let endCell = 1;
    let startCell = 1;
    for (let i = 0; i < Subtitle.length; i++) {
      endCell += (i == 0 ? (Object.keys(json[0]).length - Subtitle.length) : Object.keys(json[0][Subtitle[i]][0]).length);

      worksheet.mergeCells([2, startCell, 2, endCell]);
      worksheet.getCell(2, startCell).value = Subtitle[i];
      worksheet.getCell(2, startCell).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: '96C8FB' }, bgColor: { argb: '96C8FB' }
        //adding fields to header
      };
      startCell = endCell + 1;
      if (i > 0) {

        for (let key of Object.keys(json[0][Subtitle[i]][0])) {
          Header.push({ Header: key, key: Subtitle[i].substring(0, 1) + '_' + key });
        }
      }

    }

    worksheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }

    /*Column headers*/
    console.log(Header);

    worksheet.getRow(3).values = Header.map(h => h.Header);
    worksheet.getRow(3).font = {
      // name: 'Arial Black',
      // color: { argb: '96C8FB' },
      family: 2,
      size: 12,
      bold: true,
    };
    worksheet.columns = Header;

    /* Now we use the keys we defined earlier to insert your data by iterating through arrData and calling worksheet.addRow()*/
    let rowNum = 3;
    json.forEach(function (item, i) {
      // for (let j = 0; j < Subtitle.length; j++) {
      //   if(j>0 && json[i][Subtitle[j]].length > 0){          
      //     for (let key of Object.keys(json[i][Subtitle[j]][0])) {
      //       json[i][Subtitle[j].substring(0,1) + '_' + key] = json[i][Subtitle[j]][0][key];
      //     } 
      //     json[i][Subtitle[j]].shift();
      //   }
      // }      
      worksheet.addRow(json[i]);

      rowNum += 1;
      for (let j = 0; j < Subtitle.length; j++) {

        if (j > 0) {
          json[i][Subtitle[j]].forEach(function (subrow: any) {

            let row: any = {};
            for (let key of Object.keys(subrow)) {
              row[Subtitle[j].substring(0, 1) + '_' + key] = subrow[key];
            }
            worksheet.addRow(row);
            rowNum++;
          });
        }
      }
      worksheet.getRow(rowNum).font = {
        name: 'Arial Black',
        color: { argb: 'FFFF0000' },
        family: 2,
        size: 12
      };
      worksheet.addRow({})
      rowNum++;
    });


    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.eachCell({ includeEmpty: false }, function (cell, colNumber) {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };;
      });
    });

    let fileName = excelFileName + ".xlsx";
    const excelBuffer: any = workbook.xlsx.writeBuffer();
    workbook.xlsx.writeBuffer()
      .then(function (buffer: any) {
        // done buffering
        const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(data, fileName);
      });
  }

  exportFailedImport(json: any[], excelFileName: string, options = {}): void {
    let workbook = new Workbook();
    var worksheet = workbook.addWorksheet('Sheet1');

    let colCount = Object.keys(json[0]).length;
    let Subtitle = ['Aawak Detail'];
    let Header = [];
    for (let key of Object.keys(json[0])) {
      if (typeof json[0][key] == "object" && json[0][key].length > 0) {

        colCount += Object.keys(json[0][key][0]).length;
        Subtitle.push(key);
      }
      else {
        Header.push({ Header: key, key: key });
      }
    }


    /*TITLE*/
    worksheet.mergeCells([1, 1, 1, colCount - Subtitle.length + 1]);
    worksheet.getCell('A1').value = 'आवक जावक बुक'
    worksheet.getRow(1).font = { name: 'Corbel', family: 4, size: 20, };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // worksheet.getCell(1,1).fill = {
    //   type: 'pattern', pattern: 'solid', fgColor: { argb: '96C8FB' }, bgColor: { argb: '96C8FB' }
    // };

    /*SUBTITLE*/
    let endCell = 1;
    let startCell = 1;
    for (let i = 0; i < Subtitle.length; i++) {
      endCell += (i == 0 ? (Object.keys(json[0]).length - Subtitle.length) : Object.keys(json[0][Subtitle[i]][0]).length);

      worksheet.mergeCells([2, startCell, 2, endCell]);
      worksheet.getCell(2, startCell).value = Subtitle[i];
      worksheet.getCell(2, startCell).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: '96C8FB' }, bgColor: { argb: '96C8FB' }
        //adding fields to header
      };
      startCell = endCell + 1;
      if (i > 0) {

        for (let key of Object.keys(json[0][Subtitle[i]][0])) {
          Header.push({ Header: key, key: Subtitle[i].substring(0, 1) + '_' + key });
        }
      }

    }

    worksheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }

    /*Column headers*/
    console.log(Header);

    worksheet.getRow(3).values = Header.map(h => h.Header);
    worksheet.getRow(3).font = {
      // name: 'Arial Black',
      // color: { argb: '96C8FB' },
      family: 2,
      size: 12,
      bold: true,
    };
    worksheet.columns = Header;
    let awkErrorCol: any = null;
    let jwkErrorCol: any = null;
    for (let i = 0; i < Header.length; i++) {
      if (Header[i].key == 'Error') {
        awkErrorCol = i + 1;
      }
      if (Header[i].key == 'J_Error') {
        jwkErrorCol = i + 1;
      }
    }

    /* Now we use the keys we defined earlier to insert your data by iterating through arrData and calling worksheet.addRow()*/
    let rowNum = 3;
    json.forEach(function (item, i) {

      worksheet.addRow(json[i]);
      if (awkErrorCol) {
        worksheet.getCell(rowNum, awkErrorCol).font = {
          name: 'Arial Black',
          color: { argb: 'FFFF0000' },
          family: 2,
          size: 12
        }
      }
      if (jwkErrorCol) {
        worksheet.getCell(rowNum, jwkErrorCol).font = {
          name: 'Arial Black',
          color: { argb: 'FFFF0000' },
          family: 2,
          size: 12
        }
      }
      rowNum += 1;
      for (let j = 0; j < Subtitle.length; j++) {

        if (j > 0) {
          json[i][Subtitle[j]].forEach(function (subrow: any) {

            let row: any = {};
            for (let key of Object.keys(subrow)) {
              row[Subtitle[j].substring(0, 1) + '_' + key] = subrow[key];
            }
            worksheet.addRow(row);
            if (jwkErrorCol) {
              worksheet.getCell(rowNum, jwkErrorCol).font = {
                name: 'Arial Black',
                color: { argb: 'FFFF0000' },
                family: 2,
                size: 12
              }
            }
            rowNum++;
          });
        }
      }
      worksheet.addRow({})
      rowNum++;
    });


    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.eachCell({ includeEmpty: false }, function (cell, colNumber) {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
      });
    });

    let fileName = excelFileName + ".xlsx";
    const excelBuffer: any = workbook.xlsx.writeBuffer();
    workbook.xlsx.writeBuffer()
      .then(function (buffer: any) {
        // done buffering
        const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(data, fileName);
      });
  }



  generateReportExcel(json: any[], excelFileName: string, options: any = {}): void {
    let workbook = new Workbook();
    var worksheet = workbook.addWorksheet('Sheet1');

    let monthCount = options.months.length;
    let headers = Object.keys(json[0]).filter(key => !key.includes("arr_"));

    let headerCount = headers.length;
    const headerStyle: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: '96C8FB' }, bgColor: { argb: '96C8FB' } };
    const errorStyle: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' }, bgColor: { argb: 'FD0101' } };
    const headerBorder: any = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }

    // Title
    worksheet.mergeCells([1, 1, 1, headerCount + (monthCount * 4)]);
    let reportTitle = (excelFileName ? excelFileName + ' का ' : '') + 'सार रिपोर्ट ' + options.months[0].name + "-" + options.year + " से " + options.months[monthCount - 1].name + "-" + options.year;
    worksheet.getCell('A1').value = reportTitle;
    worksheet.getRow(1).font = { name: 'Corbel', family: 4, size: 20, };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    // Header
    for (let i = 0; i < headerCount; i++) {
      worksheet.mergeCells([2, i + 1, 3, i + 1]);
      worksheet.getCell(2, i + 1).value = headers[i];
      worksheet.getCell(2, i + 1).fill = headerStyle;
      worksheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }

    // SubHeader  
    let startCell = headerCount + 1;
    for (let i = 0; i < monthCount; i++) {
      worksheet.mergeCells([2, startCell, 2, startCell + 3]);

      worksheet.getCell(2, startCell).value = options.months[i].name + "-" + options.year;
      // worksheet.getCell(2, startCell).fill = headerStyle;
      worksheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      worksheet.getCell(3, startCell).value = 'Aawak';
      // worksheet.getCell(3, startCell).fill = headerStyle;
      worksheet.getCell(3, startCell + 1).value = 'Used';
      // worksheet.getCell(3, startCell + 1).fill = headerStyle;
      worksheet.getCell(3, startCell + 2).value = 'Jawak';
      // worksheet.getCell(3, startCell + 2).fill = headerStyle;
      worksheet.getCell(3, startCell + 3).value = 'Bachat';
      // worksheet.getCell(3, startCell + 3).fill = headerStyle;
      worksheet.getRow(3).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      startCell = startCell + 4;
    }


    worksheet.getRows(2, 2)?.forEach(row => {
      row.eachCell(cell => {
        cell.fill = headerStyle;
        cell.border = headerBorder;
      });
    });

    // writing data
    let rowNum = 4;
    for (let i = 0; i < json.length; i++) {
      for (let j = 0; j < headerCount; j++) {
        worksheet.getCell(rowNum, j + 1).value = json[i][headers[j]];
      }
      for (let j = 0; j < monthCount; j++) {
        const cell1 = worksheet.getCell(rowNum, headerCount + (j * 4) + 1);
        cell1.value = json[i].arr_sum_aawak[j];
        if (json[i].arr_comment[j]) {
          cell1.note = json[i].arr_comment[j]
        }
        if (json[i].arr_sum_aawak[j] < 0) {
          cell1.fill = errorStyle;
        }
        worksheet.getCell(rowNum, headerCount + (j * 4) + 2).value = json[i].arr_sum_used[j];
        if (json[i].arr_sum_used[j] < 0) {
          worksheet.getCell(rowNum, headerCount + (j * 4) + 2).fill = errorStyle;
        }
        worksheet.getCell(rowNum, headerCount + (j * 4) + 3).value = json[i].arr_sum_jawak[j];
        if (json[i].arr_sum_jawak[j] < 0) {
          worksheet.getCell(rowNum, headerCount + (j * 4) + 3).fill = errorStyle;
        }
        worksheet.getCell(rowNum, headerCount + (j * 4) + 4).value = json[i].arr_sum_bachat[j];
        if (json[i].arr_sum_bachat[j] < 0) {
          worksheet.getCell(rowNum, headerCount + (j * 4) + 4).fill = errorStyle;
        }
      }
      rowNum++;
    }

    worksheet.getRows(4, rowNum)?.forEach(row => {
      for (let i = headerCount; i < row.cellCount + 4; i++) {
        row.getCell(i).border = { right: { style: 'double' } };
        i = i + 3;
      }
    });

    let fileName = reportTitle + ".xlsx";
    const excelBuffer: any = workbook.xlsx.writeBuffer();
    workbook.xlsx.writeBuffer()
      .then(function (buffer: any) {
        // done buffering
        const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(data, fileName);
      });
  }


  generateConditionWiseReport(json: any[], conditions: any[], excelFileName: string, options: any = {}): void {
    if (json.length > 0 && conditions.length > 0) {
      if (!conditions.includes((c: { _id: any; }) => c._id == null)) {
        conditions.push({
          _id: null,
          list_name_hin: "N/A",
          list_name_eng: "-"
        })
      }
      let workbook = new Workbook();
      var worksheet = workbook.addWorksheet('Sheet1');

      let monthCount = options.months.length;
      let headers = Object.keys(json[0]).filter(key => !key.includes("arr_"));

      let headerCount = headers.length;
      const headerStyle: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: '96C8FB' }, bgColor: { argb: '96C8FB' } };
      const errorStyle: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' }, bgColor: { argb: 'FD0101' } };
      const headerBorder: any = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }

      // Title
      worksheet.mergeCells([1, 1, 1, headerCount + (monthCount * (conditions.length + 1))]);
      let reportTitle = (excelFileName ? excelFileName + ' का ' : '') + 'कंडीशन अनुसार सार रिपोर्ट ' + options.months[0].name + "-" + options.year + " से " + options.months[monthCount - 1].name + "-" + options.year;
      worksheet.getCell('A1').value = reportTitle;;
      worksheet.getRow(1).font = { name: 'Corbel', family: 4, size: 20, };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      // Header
      for (let i = 0; i < headerCount; i++) {
        worksheet.mergeCells([2, i + 1, 3, i + 1]);
        worksheet.getCell(2, i + 1).value = headers[i];
        worksheet.getCell(2, i + 1).fill = headerStyle;
        worksheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }

      // SubHeader  
      let startCell = headerCount + 1;
      for (let i = 0; i < monthCount; i++) {

        worksheet.mergeCells([2, startCell, 2, startCell + conditions.length]);

        worksheet.getCell(2, startCell).value = options.months[i].name + "-" + options.year;
        // worksheet.getCell(2, startCell).fill = headerStyle;
        worksheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        let c = 0;
        for (c = 0; c < conditions.length; c++) {
          worksheet.getCell(3, startCell + c).value = conditions[c].list_name_hin;
        }
        worksheet.getCell(3, startCell + c).value = "Total Bachat";
        worksheet.getRow(3).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        startCell = startCell + conditions.length + 1;
      }


      worksheet.getRows(2, 2)?.forEach(row => {
        row.eachCell(cell => {
          cell.fill = headerStyle;
          cell.border = headerBorder;
        });
      });

      // writing data
      let rowNum = 4;
      for (let i = 0; i < json.length; i++) {

        for (let j = 0; j < headerCount; j++) {
          worksheet.getCell(rowNum, j + 1).value = json[i][headers[j]];
        }

        // loop through total number of available months
        for (let j = 0; j < monthCount; j++) {
          let k = 0;
          // loop through all available conditions
          for (k = 0; k < conditions.length; k++) {
            if (Array.isArray(json[i].arr_conditionReport)) {
              let value = 0;
              // finding position of cell depending on month, condition number. (consider total bachat added for every month).
              const cell1 = worksheet.getCell(rowNum, headerCount + (j * (conditions.length + 1)) + k + 1);
              for (let crow of json[i].arr_conditionReport) {
                if (crow.condition_id == conditions[k]._id || (crow.condition_id == null && conditions[k]._id == null)) {
                  value = crow.arr_sum_bachat[j];
                  if (crow.arr_comment[j]) {
                    cell1.note = crow.arr_comment[j];
                  }
                  break;
                }
              }
              cell1.value = value;
              if (value < 0) {
                cell1.fill = errorStyle;
              }
            }
          }
          // writing total bachat of month.
          const cellBachat = worksheet.getCell(rowNum, headerCount + (j * (conditions.length + 1)) + k + 1);
          cellBachat.value = json[i].arr_sum_bachat[j];
          if (json[i].arr_sum_bachat[j] < 0) {
            cellBachat.fill = errorStyle;
          }
        }

        rowNum++;
      }

      // creating partition border after every month.
      worksheet.getRows(4, rowNum)?.forEach(row => {
        for (let i = headerCount; i <= row.cellCount; (i = i + conditions.length + 1)) {
          row.getCell(i).border = { right: { style: 'double' } };
        }
      });

      let fileName = reportTitle + ".xlsx";
      const excelBuffer: any = workbook.xlsx.writeBuffer();
      workbook.xlsx.writeBuffer()
        .then(function (buffer: any) {
          // done buffering
          const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          FileSaver.saveAs(data, fileName);
        });
    }
  }


}
