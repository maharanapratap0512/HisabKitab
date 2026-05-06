import { HttpClient, HttpErrorResponse, HttpHeaders, HttpInterceptor, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { throwError, Observable } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  // token: string;
  // httpParams: HttpParams;

  constructor(
    private http: HttpClient,
    private router: Router,
    // private auth: AuthService
  ) { }


  // getToken() {
  //   return this.token ? this.token : this.auth.getToken();
  // }

  get(url: string, options?: any) {
    const httpOptions: any = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // Authorization: 'bearer ' + this.getToken(),
      }),
    };
    const params = options ? this.toUrlParams(options.params) : '';
    return (this.http.get(url + params, httpOptions) as Observable<any>).pipe(
      tap(val => {
        catchError(this.handleError);
      })
    );
  }

  post(url: string, body: any) {
    const httpOptions: any = {
      headers: new HttpHeaders({
        'content-type': 'application/json',
        // Authorization: 'bearer ' + this.getToken(),
      }),
    };
    // body.department = ''
    return this.http.post(url, body, httpOptions).pipe(
      tap(val => {
        catchError(this.handleError);
      })
    );
  }

  // postFormData(url: string, body: any) {
  //   // const httpOptions: any = {
  //   //   headers: new HttpHeaders({
  //   //     'content-type': 'application/json',
  //   //     // Authorization: 'bearer ' + this.getToken(),
  //   //   }),
  //   // };
  //   return this.http.post(url, body).pipe(
  //     tap(val => {
  //       catchError(this.handleError);
  //     })
  //   );
  // }


  postFormData(url: string, formData: FormData, options?: any) {
    const httpOptions: any = {
      headers: new HttpHeaders({
        // Authorization: 'bearer ' + this.getToken(),
      }),
    };
    return this.http.post(url, formData, httpOptions).pipe(
      tap(val => {
        catchError(this.handleError);
      })
    );
  }

  put(url: string, body: any) {
    const httpOptions: any = {
      headers: new HttpHeaders({
        'content-type': 'application/json',
        // Authorization: 'bearer ' + this.getToken(),
      }),
    };
    return this.http.put(url, body, httpOptions).pipe(
      timeout(900000), // Add the timeout here
      tap(val => {
        catchError(this.handleError);
      })
    );
  }


  delete(url: string, body?: any) {
    const httpOptions: any = {
      headers: new HttpHeaders({
        'content-type': 'application/json',
        // Authorization: 'bearer ' + this.getToken(),
      }),
    };
    const options = {
      headers: httpOptions.headers,
      body: body
    };
    return this.http.delete(url, options).pipe(
      tap(val => {
        catchError(this.handleError);
      })
    );
  }


  // postFormData(url: string, formData: FormData, options?: any) {
  //   const httpOptions: any = {
  //     headers: new HttpHeaders({
  //       // Authorization: 'bearer ' + this.getToken(),
  //     }),
  //   };
  //   return this.http.post(url, formData, httpOptions).pipe(
  //     tap(val => {
  //       catchError(this.handleError);
  //     })
  //   );
  // }

  downloadData(url: string, options?: any) {
    const httpOptions: any = {
      headers: new HttpHeaders({
        'Content-Type': 'application/octet-stream',
        // Authorization: 'bearer ' + this.getToken(),
      }),
      params: options ? options.params : {},
      responseType: 'blob', // Changing to blob for direct download
    };
    return this.http.get(url, httpOptions).pipe(
      tap(val => {
        catchError(this.handleError);
      })
    );
  }

  toUrlParams(obj: any) {
    let str = '';
    if (obj) {
      str = '?';
      Object.keys(obj).forEach(key => {
        if (str !== '') {
          str += '&';
        }
        str += key + '=' + encodeURIComponent(obj[key]);
      });
      return str;
    } else {
      return str;
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
      switch (error.status) {
        case 401:
          console.error("error 401");
          // this.router.navigate(['/login']);
          break;
        case 419:
          console.error("error 419");
          // this.router.navigate(['/login']);
          break;
      }
    }
    return throwError(error);
  }

}
