import { Injectable, Inject } from '@angular/core';
import { LOCAL_STORAGE, WINDOW } from '@ng-toolkit/universal';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: any;
  webUser: any = {};
  AdminUser: any = {};

  constructor(
    @Inject(LOCAL_STORAGE) private localStorage: any,
    @Inject(WINDOW) private Window: any
  ) {
    this.webUser = this.getWebUser();
    
  }

  // getToken() {
  //   return this.localStorage.getItem('Authorization');
  // }

  // setToken(loggedInUser: any) {
  //   this.localStorage.setItem('Authorization', loggedInUser);
  // }

  loggedIn() {
    // return !!this.localStorage.getItem('WebUser');
    return !!this.Window.sessionStorage.getItem('WebUser');
  }

  // For WebUser
  async setWebUser(user: any) {
    // this.localStorage.setItem('WebUser', JSON.stringify(user));
    this.Window.sessionStorage.setItem('WebUser', JSON.stringify(user));
    this.webUser = user;
  }

  async updateSettings(setting:any ){
    this.webUser.settings = setting;
    this.Window.sessionStorage.setItem('WebUser', JSON.stringify(this.webUser));
  }

  getWebUser() {
    // return JSON.parse(this.localStorage.getItem('WebUser') || '{}');
    return JSON.parse(this.Window.sessionStorage.getItem('WebUser') || '{}');
  }

  removewebUser() {
    // this.localStorage.removeItem('WebUser');
    this.Window.sessionStorage.removeItem('WebUser');
    // this.localStorage.removeItem('Authorization');
  }
}