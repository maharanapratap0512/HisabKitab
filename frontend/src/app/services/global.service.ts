import { Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { HttpService } from 'src/app/services/http.service';
import { ApiService } from 'src/app/services/api.service';
import { BehaviorSubject, Observable, of, shareReplay, tap } from 'rxjs';
import { async } from '@angular/core/testing';
import { getLocaleMonthNames } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  private lists$?: Observable<any>;

  isLoader = new BehaviorSubject<boolean>(false);
  Lists: any = null;
  Config: any = {};
  importPending: any = false;
  exceptionDept: any = [1, 5];
  menuCriteria: any = {};
  // getList$ = new Subject();
  date = new Date();
  dateString = this.date.getFullYear() + '-' + (this.date.getMonth() + 1).toString().padStart(2, "0") + '-' + this.date.getDate().toString().padStart(2, "0")
  years: any = [];
  months: any = [
    { m: 1, name: 'January', name_hin: 'जनवरी' },
    { m: 2, name: 'February', name_hin: 'फरवरी' },
    { m: 3, name: 'March', name_hin: 'मार्च' },
    { m: 4, name: 'April', name_hin: 'अप्रैल' },
    { m: 5, name: 'May', name_hin: 'मई' },
    { m: 6, name: 'June', name_hin: 'जून' },
    { m: 7, name: 'July', name_hin: 'जुलाई' },
    { m: 8, name: 'August', name_hin: 'अगस्त' },
    { m: 9, name: 'September', name_hin: 'सितंबर' },
    { m: 10, name: 'October', name_hin: 'अक्टूबर' },
    { m: 11, name: 'November', name_hin: 'नवंबर' },
    { m: 12, name: 'December', name_hin: 'दिसंबर' },
  ];

  formConfig: any = {
    item: {}
  }

  constructor(
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
    let date = new Date();
    for (let yr = date.getFullYear(); yr >= 2021; yr--) {
      this.years.push(yr);
    }

    // this.getList();
  }

  validationFireOnSubmit(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validationFireOnSubmit(control);
      }
    });
  }

  observeList(forceRefresh: boolean = false): Observable<any> {
    // if Lists already set, just emit it
    if (this.Lists && !forceRefresh) {
      return of(this.Lists);
    }

    if (!this.lists$ || forceRefresh) {
      this.isLoader.next(true);
      this.lists$ = this.http
        .get(this.api.URLS['LISTALL'] + '/' + this.auth.webUser.dept_id)
        .pipe(
          tap((data: any) => {
            this.Lists = {};
            if (data.success && data.result) {
              for (const key of Object.keys(data.result)) {
                this.Lists[key] = data.result[key].data;
              }
            }
            this.isLoader.next(false);
          }),
          shareReplay(1) // cache last value for future subscribers
        );
    }

    return this.lists$;
  }

  addVariantsToItemmix(item_id: any, newVariants: any[]) {
    if (this.Lists && this.Lists.itemmix && Array.isArray(newVariants)) {
      const item = this.Lists.itemmix.find((i: any) => String(i._id) === String(item_id));
      if (item) {
        if (!item.subitems) {
          item.subitems = [];
        }
        newVariants.forEach((v: any) => {
          const subId = v._id || v.subitem_id;
          const subObj = {
            ...v,
            _id: subId,
            item_id: item_id,
            subitem_hin: v.subitem_hin || v.display_name_hin || '',
            subitem_eng: v.subitem_eng || v.display_name_eng || '',
            subitem_roman: v.subitem_roman || v.display_name_roman || '',
            variant_id: v.variant_id
          };
          const exists = item.subitems.some((s: any) => String(s._id) === String(subObj._id));
          if (!exists && subObj._id) {
            item.subitems.push(subObj);
          }
        });
      }
    }
  }

  // observeList(): Observable<any> {
  //   let data = new Observable<any>(observer => {
  //     if (!this.Lists) {
  //       this.Lists = {}
  //       this.http.get(this.api.URLS['LISTALL'] + '/' + this.auth.webUser.dept_id).subscribe((data) => {
  //         if (data['success'] && data['result']) {
  //           for (let key of Object.keys(data['result'])) {
  //             // console.log('key',data['result'][]);
  //             this.Lists[key] = data['result'][key].data;
  //           }
  //         }
  //         this.isLoader = false;
  //         observer.next(this.Lists);
  //       });
  //     }
  //     else {
  //       observer.next(this.Lists);
  //     }
  //   });
  //   return data;
  // }

  formatDisplayDate(d: any) {
    var date = new Date(d)
    var year = date.getFullYear()
    var month = '' + (date.getMonth() + 1);
    var day = '' + date.getDate()
    // if (month.length < 2) month = '0' + month;
    // if (day.length < 2) day = '0' + day;
    var formatted = day.padStart(2, "0") + "-" + month.padStart(2, "0") + "-" + year;
    return (formatted)
  }

  async getDeptConfig() {
    return new Promise((resolve) => {
      this.http.get(this.api.getUrl('DEPTCONFIG') + this.auth.webUser.dept_id).subscribe((data) => {
        if (data['result'] && data['success']) {
          console.log(data['result']);
          resolve(1);
        }
      }, (err) => {
        this.toastr.error(err['error']);
      });
    });
  }

  checkTempImport() {
    this.http.get(this.api.getUrl('IMPORTEXPORT')).subscribe((data: any) => {
      if (data.total_count > 0) {
        this.importPending = true;
      }
      else {
        this.importPending = false;
      }
    })
  }

  yearChangedGetMonth(year: any) {
    if (year) {
      if (year == this.date.getFullYear()) {
        return this.months.filter((i: { m: number; }) => i.m <= this.date.getMonth() + 1)
      } else {
        return this.months;
      }
    } else {
      return []
    }
  }

  cleanString(str: any): string {
    if (str === null || str === undefined) return "";
    return String(str)
      .trim()
      .normalize("NFC")          // normalize Unicode
      .replace(/\u200B/g, "")    // remove zero-width space
      .replace(/\u00A0/g, " ")   // remove non-breaking space
      .replace(/\s+/g, " ")      // collapse multiple spaces
      .toLowerCase();            // case-insensitive for English
  }

  stringCompare(a: string, b: string): boolean {
    return this.cleanString(a) === this.cleanString(b);
  }

  cleanValue(value: any): any {
    // Handle null/undefined first
    if (value === null || value === undefined) {
      return null;
    }

    // If it's a string, clean it
    if (typeof value === "string") {
      const cleaned = this.cleanString(value);

      // Return null for empty or '-'
      if (cleaned === '' || cleaned === '-') {
        return null;
      }

      return cleaned;
    }

    // For numbers, dates, booleans - return as is
    return value;
  }

  /**
   * Universal Slow & Smooth Animated Scroll Helper
   * Can accept an ElementRef, HTMLElement, CSS selector string, or target Y position number
   */
  smoothScrollTo(target: any, offset: number = -20, duration: number = 1000) {
    setTimeout(() => {
      let targetY = 0;
      if (typeof target === 'number') {
        targetY = target;
      } else if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) targetY = el.getBoundingClientRect().top + window.pageYOffset + offset;
        else return;
      } else if (target?.nativeElement) {
        targetY = target.nativeElement.getBoundingClientRect().top + window.pageYOffset + offset;
      } else if (target instanceof HTMLElement) {
        targetY = target.getBoundingClientRect().top + window.pageYOffset + offset;
      } else {
        return;
      }

      const startPosition = window.pageYOffset;
      const distance = targetY - startPosition;
      let start: number | null = null;

      const animateScroll = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Ease In Out Cubic curve for smooth, gentle animation
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }, 50);
  }

}
