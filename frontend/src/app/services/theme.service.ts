import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnInit {

  constructor(public auth: AuthService) {
    this.initializeTheme();
  }

  ngOnInit(): void {

  }

  initializeTheme() {
    const lightTheme = document.getElementById('light-style') as HTMLLinkElement;
    const darkTheme = document.getElementById('dark-style') as HTMLLinkElement;
    document.body.style.visibility = 'hidden';
    lightTheme.disabled = this.auth.webUser.settings.darkMode;
    darkTheme.disabled = !this.auth.webUser.settings.darkMode;
    document.body.setAttribute('data-leftbar-theme', 'light');
    document.body.style.visibility = 'visible';
  }

  toggleDarkMode() {
    this.auth.webUser.settings.darkMode = !this.auth.webUser.settings.darkMode;
    this.auth.updateSettings();
    this.initializeTheme();
  }
}
