import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    console.log('worksheet', worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  public exportTblToExcelFile(table: any, excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table, {raw:false});
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
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }











  // public exportAsExcelFile(el: HTMLElement, excelFileName: string): void {
  //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(el);
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  //   XLSX.writeFile(wb, excelFileName + '.xlsx');
  // }
















  generateExcel(json: any[], excelFileName: string): void {
    var options = {
      filename: './streamed-workbook.xlsx',
      useStyles: true,
      useSharedStrings: true
    };
    let workbook = new Workbook();
    var worksheet = workbook.addWorksheet('Sheet1');


    /*TITLE*/
    worksheet.mergeCells('A1', 'L1');
    worksheet.getCell('C1').value = 'आवक जावक बुक'
    worksheet.getRow(1).font = { name: 'Corbel', family: 4, size: 20, };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2', 'J2', 'K2', 'L2'].map(key => {
      worksheet.getCell(key).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: '96C8FB' }, bgColor: { argb: '96C8FB' }
      };
    });

    /*SUBTITLE*/
    worksheet.mergeCells('A2', 'G2');
    worksheet.getCell('A2').value = 'आवक';
    worksheet.mergeCells('H2', 'L2');
    worksheet.getCell('H2').value = 'जावक';
    ['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3', 'J3', 'K3', 'L3'].map(key => {
      worksheet.getCell(key).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: '23423' }, bgColor: { argb: '98754' }
      };
    });


    /*Column headers*/
    worksheet.getRow(3).values = ['No','Date', 'Item', 'Qty', 'Unit', 'Aawak MM', 'Aawak Type', 'Date', 'Item', 'Qty', 'Unit', 'Jawak MM'];

    /*Define your column keys because this is what you use to insert your data according to your columns, they're column A, B, C, D respectively being idClient, Name, Tel, and Adresse.
    So, it's pretty straight forward */
    worksheet.columns = [
      { key: 'No'},
      { key: 'Date' },
      { key: 'Item' },
      { key: 'Qty' },
      { key: 'Unit' },
      { key: 'Aawak MM' },
      { key: 'Aawak Type' },
      { key: 'J_Date' },
      { key: 'J_Item' },
      { key: 'J_Qty' },
      { key: 'J_Unit' },
      { key: 'J_Jawak MM' }
    ]

    worksheet.getColumn(1).width = 6;
    worksheet.getColumn(2).width = 11;
    worksheet.getColumn(3).width = 11;
    worksheet.getColumn(6).width = 12;
    worksheet.getColumn(7).width = 12;
    worksheet.getColumn(8).width = 11;
    worksheet.getColumn(9).width = 11;
    worksheet.getColumn(12).width = 15;


    /* Now we use the keys we defined earlier to insert your data by iterating through arrData and calling worksheet.addRow()*/
    json.forEach(function (item, i) {
      worksheet.addRow(json[i])
      json[i]['Jawak Detail'].forEach(function (jitem: any, j: number) {
        worksheet.addRow({
          'J_Date': jitem.Date,
          'J_Item': jitem.Item,
          'J_Qty': jitem.Qty,
          'J_Unit': jitem.Unit,
          'J_Jawak MM': jitem['Jawak MM'],
        });
      })
      let totalqty = 0;
      let totalunit;
      json[i]['Jawak Detail'].forEach(function (jtotal: any, t: number) {
        totalqty += jtotal.Qty
        totalunit = jtotal.Unit
      })
      worksheet.addRow({
        'J_Item': 'Total',
        'J_Qty': totalqty,
        'J_Unit': totalunit
      }).font = { name: 'Corbel', family: 4, bold: true };;
    })


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










}
