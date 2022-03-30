import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private api: ApiService,
    private http: HttpService,
    private auth: AuthService,
    private _router: Router
  ) { }

  // canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   return true;
  // }

  canActivate(): boolean {
    if (this.auth.loggedIn()) {
      return true;
    } else {
      this._router.navigate(['/login']);
      return false;
    }
  }

  canLoad(): boolean {
    if (this.auth.getWebUser() && this.auth.getWebUser()['dept_id']) {
      return true;
    } else {
      this._router.navigate(['/login']);
      return false;
    }
  }

}
