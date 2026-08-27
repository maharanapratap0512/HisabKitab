import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnInit {

  // themeList: any[] = [
  //   { theme: 'indigo', color: '#2a2850' },
  //   { theme: 'purple', color: '#6b5fc7' },
  //   { theme: 'blue', color: '#007bff' },
  //   { theme: 'green', color: '#0acf97' },
  //   { theme: 'orange', color: '#ffbc00' },
  //   { theme: 'red', color: '#fa5c7c' },
  //   { theme: 'unified', color: '#1e1d3f' }
  // ];
  themeList: any[] = [
    { theme: 'indigo', color: '#5b5bd6' },
    { theme: 'violet', color: '#9333ea' },
    { theme: 'cyan', color: '#06b6d4' },
    { theme: 'emerald', color: '#10b981' },
    { theme: 'rose', color: '#f43f5e' },
    { theme: 'amber', color: '#f59e0b' },
  ];
  settings: any = {}
  themes: any = {
    indigo: {
      dark: {
        '--bg-color': '#13122b',
        '--thead-bg': 'linear-gradient(180deg, #2a2850 0%, #1e1d3f 100%)',
        '--thead-color': '#e2e1ff',
        '--thead-border-top': '2px solid #5b5bd6',
        '--thead-border-bottom': '1px solid rgba(91,91,214,0.3)',
        '--thead-box-shadow': '0 -1px 10px rgba(91,91,214,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        '--thead-accent-color': '#5b5bd6',
        '--card-header-bg': 'linear-gradient(180deg, #2a2850 0%, #1e1d3f 100%)',
        '--card-header-color': '#e2e1ff',
        '--card-header-border': '1px solid rgba(91,91,214,0.3)',
        '--nav-bg': 'linear-gradient(to right, #0f0c29, #302b63, #24243e)',
        '--nav-border': 'rgba(91,91,214,0.25)',
        '--nav-shadow': '0 10px 30px rgba(91,91,214,0.2)'
      },
      light: {
        '--bg-color': '#f7f7ff',
        '--thead-bg': 'rgba(99,102,241,0.1)',
        '--thead-color': '#3730a3',
        '--thead-border-top': '2px solid #6366f1',
        '--thead-border-bottom': '2px solid rgba(99,102,241,0.25)',
        '--thead-box-shadow': 'none',
        '--thead-accent-color': '#6366f1',
        '--card-header-bg': 'rgba(99,102,241,0.1)',
        '--card-header-color': '#3730a3',
        '--card-header-border': '2px solid rgba(99,102,241,0.25)',
        '--nav-bg': 'linear-gradient(to right, #0f0c29, #302b63, #24243e)',
        '--nav-border': 'rgba(91,91,214,0.25)',
        '--nav-shadow': '0 10px 30px rgba(91,91,214,0.2)'
      }
    },

    violet: {
      dark: {
        '--bg-color': '#170f2b',
        '--thead-bg': 'linear-gradient(180deg, #2e1f4a 0%, #1e1535 100%)',
        '--thead-color': '#e9d5ff',
        '--thead-border-top': '2px solid #9333ea',
        '--thead-border-bottom': '1px solid rgba(147,51,234,0.3)',
        '--thead-box-shadow': '0 -1px 10px rgba(147,51,234,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        '--thead-accent-color': '#9333ea',
        '--card-header-bg': 'linear-gradient(180deg, #2e1f4a 0%, #1e1535 100%)',
        '--card-header-color': '#e9d5ff',
        '--card-header-border': '1px solid rgba(147,51,234,0.3)',
        '--nav-bg': 'linear-gradient(to right, #1a0a2e, #3b1f6b, #2a1a4e)',
        '--nav-border': 'rgba(147,51,234,0.25)',
        '--nav-shadow': '0 10px 30px rgba(147,51,234,0.2)'
      },
      light: {
        '--bg-color': '#fbf5ff',
        '--thead-bg': 'rgba(147,51,234,0.1)',
        '--thead-color': '#6b21a8',
        '--thead-border-top': '2px solid #9333ea',
        '--thead-border-bottom': '2px solid rgba(147,51,234,0.25)',
        '--thead-box-shadow': 'none',
        '--thead-accent-color': '#9333ea',
        '--card-header-bg': 'rgba(147,51,234,0.1)',
        '--card-header-color': '#6b21a8',
        '--card-header-border': '2px solid rgba(147,51,234,0.25)',
        '--nav-bg': 'linear-gradient(to right, #1a0a2e, #3b1f6b, #2a1a4e)',
        '--nav-border': 'rgba(147,51,234,0.25)',
        '--nav-shadow': '0 10px 30px rgba(147,51,234,0.2)'
      }
    },

    cyan: {
      dark: {
        '--bg-color': '#091419',
        '--thead-bg': 'linear-gradient(180deg, #0f2d35 0%, #0a1f26 100%)',
        '--thead-color': '#cffafe',
        '--thead-border-top': '2px solid #06b6d4',
        '--thead-border-bottom': '1px solid rgba(6,182,212,0.3)',
        '--thead-box-shadow': '0 -1px 10px rgba(6,182,212,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        '--thead-accent-color': '#06b6d4',
        '--card-header-bg': 'linear-gradient(180deg, #0f2d35 0%, #0a1f26 100%)',
        '--card-header-color': '#cffafe',
        '--card-header-border': '1px solid rgba(6,182,212,0.3)',
        '--nav-bg': 'linear-gradient(to right, #030f14, #0a2d38, #061e26)',
        '--nav-border': 'rgba(6,182,212,0.25)',
        '--nav-shadow': '0 10px 30px rgba(6,182,212,0.15)'
      },
      light: {
        '--bg-color': '#f5fdff',
        '--thead-bg': 'rgba(6,182,212,0.1)',
        '--thead-color': '#0e7490',
        '--thead-border-top': '2px solid #06b6d4',
        '--thead-border-bottom': '2px solid rgba(6,182,212,0.25)',
        '--thead-box-shadow': 'none',
        '--thead-accent-color': '#06b6d4',
        '--card-header-bg': 'rgba(6,182,212,0.1)',
        '--card-header-color': '#0e7490',
        '--card-header-border': '2px solid rgba(6,182,212,0.25)',
        '--nav-bg': 'linear-gradient(to right, #030f14, #0a2d38, #061e26)',
        '--nav-border': 'rgba(6,182,212,0.25)',
        '--nav-shadow': '0 10px 30px rgba(6,182,212,0.15)'
      }
    },

    emerald: {
      dark: {
        '--bg-color': '#091410',
        '--thead-bg': 'linear-gradient(180deg, #0f2d22 0%, #0a1f18 100%)',
        '--thead-color': '#d1fae5',
        '--thead-border-top': '2px solid #10b981',
        '--thead-border-bottom': '1px solid rgba(16,185,129,0.3)',
        '--thead-box-shadow': '0 -1px 10px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        '--thead-accent-color': '#10b981',
        '--card-header-bg': 'linear-gradient(180deg, #0f2d22 0%, #0a1f18 100%)',
        '--card-header-color': '#d1fae5',
        '--card-header-border': '1px solid rgba(16,185,129,0.3)',
        '--nav-bg': 'linear-gradient(to right, #030f09, #0a2e1c, #061f14)',
        '--nav-border': 'rgba(16,185,129,0.25)',
        '--nav-shadow': '0 10px 30px rgba(16,185,129,0.15)'
      },
      light: {
        '--bg-color': '#f5fdfb',
        '--thead-bg': 'rgba(16,185,129,0.1)',
        '--thead-color': '#065f46',
        '--thead-border-top': '2px solid #10b981',
        '--thead-border-bottom': '2px solid rgba(16,185,129,0.25)',
        '--thead-box-shadow': 'none',
        '--thead-accent-color': '#10b981',
        '--card-header-bg': 'rgba(16,185,129,0.1)',
        '--card-header-color': '#065f46',
        '--card-header-border': '2px solid rgba(16,185,129,0.25)',
        '--nav-bg': 'linear-gradient(to right, #030f09, #0a2e1c, #061f14)',
        '--nav-border': 'rgba(16,185,129,0.25)',
        '--nav-shadow': '0 10px 30px rgba(16,185,129,0.15)'
      }
    },

    rose: {
      dark: {
        '--bg-color': '#150810',
        '--thead-bg': 'linear-gradient(180deg, #2d0f1a 0%, #1f0a12 100%)',
        '--thead-color': '#ffe4e6',
        '--thead-border-top': '2px solid #f43f5e',
        '--thead-border-bottom': '1px solid rgba(244,63,94,0.3)',
        '--thead-box-shadow': '0 -1px 10px rgba(244,63,94,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        '--thead-accent-color': '#f43f5e',
        '--card-header-bg': 'linear-gradient(180deg, #2d0f1a 0%, #1f0a12 100%)',
        '--card-header-color': '#ffe4e6',
        '--card-header-border': '1px solid rgba(244,63,94,0.3)',
        '--nav-bg': 'linear-gradient(to right, #150308, #3d0f1a, #29080f)',
        '--nav-border': 'rgba(244,63,94,0.25)',
        '--nav-shadow': '0 10px 30px rgba(244,63,94,0.15)'
      },
      light: {
        '--bg-color': '#fff5f7',
        '--thead-bg': 'rgba(244,63,94,0.08)',
        '--thead-color': '#9f1239',
        '--thead-border-top': '2px solid #f43f5e',
        '--thead-border-bottom': '2px solid rgba(244,63,94,0.25)',
        '--thead-box-shadow': 'none',
        '--thead-accent-color': '#f43f5e',
        '--card-header-bg': 'rgba(244,63,94,0.08)',
        '--card-header-color': '#9f1239',
        '--card-header-border': '2px solid rgba(244,63,94,0.25)',
        '--nav-bg': 'linear-gradient(to right, #150308, #3d0f1a, #29080f)',
        '--nav-border': 'rgba(244,63,94,0.25)',
        '--nav-shadow': '0 10px 30px rgba(244,63,94,0.15)'
      }
    },

    amber: {
      dark: {
        '--bg-color': '#15100a',
        '--thead-bg': 'linear-gradient(180deg, #2d1f0a 0%, #1f1508 100%)',
        '--thead-color': '#fef3c7',
        '--thead-border-top': '2px solid #f59e0b',
        '--thead-border-bottom': '1px solid rgba(245,158,11,0.3)',
        '--thead-box-shadow': '0 -1px 10px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        '--thead-accent-color': '#f59e0b',
        '--card-header-bg': 'linear-gradient(180deg, #2d1f0a 0%, #1f1508 100%)',
        '--card-header-color': '#fef3c7',
        '--card-header-border': '1px solid rgba(245,158,11,0.3)',
        '--nav-bg': 'linear-gradient(to right, #150e03, #3d2a08, #291c05)',
        '--nav-border': 'rgba(245,158,11,0.25)',
        '--nav-shadow': '0 10px 30px rgba(245,158,11,0.15)'
      },
      light: {
        '--bg-color': '#fffdf5',
        '--thead-bg': 'rgba(245,158,11,0.1)',
        '--thead-color': '#92400e',
        '--thead-border-top': '2px solid #f59e0b',
        '--thead-border-bottom': '2px solid rgba(245,158,11,0.25)',
        '--thead-box-shadow': 'none',
        '--thead-accent-color': '#f59e0b',
        '--card-header-bg': 'rgba(245,158,11,0.1)',
        '--card-header-color': '#92400e',
        '--card-header-border': '2px solid rgba(245,158,11,0.25)',
        '--nav-bg': 'linear-gradient(to right, #150e03, #3d2a08, #291c05)',
        '--nav-border': 'rgba(245,158,11,0.25)',
        '--nav-shadow': '0 10px 30px rgba(245,158,11,0.15)'
      }
    }
  };

  constructor(public auth: AuthService) {
    this.settings = this.auth.webUser.settings;
    this.initializeTheme(this.settings.headerTheme || 'indigo');
  }

  ngOnInit(): void {

  }

  async initializeTheme(defaultTheme: string = 'indigo') {
    const lightTheme = document.getElementById('light-style') as HTMLLinkElement;
    const darkTheme = document.getElementById('dark-style') as HTMLLinkElement;
    document.body.style.visibility = 'hidden';

    const isDark = this.auth.webUser.settings.darkMode;
    const isAmoled = this.auth.webUser.settings.amoledMode;

    if (lightTheme) lightTheme.disabled = isDark;
    if (darkTheme) darkTheme.disabled = !isDark;

    document.body.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');

    const root = document.documentElement;

    // ── Resolve theme name — fallback chain ──
    const resolvedTheme =
      (this.settings?.headerTheme && this.themes[this.settings.headerTheme])
        ? this.settings.headerTheme
        : (this.themes[defaultTheme] ? defaultTheme : 'indigo');

    if (!this.settings.headerTheme || !this.themes[this.settings.headerTheme]) {
      this.settings.headerTheme = resolvedTheme;
    }

    this.themeList.forEach(item => {
      item.active = item.theme === resolvedTheme;
    });

    // ── Pick dark or light variant ──
    let themeParams: any;

    if (this.settings.headerTheme === 'custom' && this.settings.headerCustomColor) {
      themeParams = this.generateThemeFromColor(this.settings.headerCustomColor, isDark);
    } else {
      const themeSet = this.themes[resolvedTheme];
      themeParams = structuredClone(isDark ? themeSet.dark : themeSet.light);
    }

    // ── Amoled / dark bg override ──
    if (isDark && !isAmoled) {
      themeParams['--bg-color'] = '#343a40';
    }

    Object.entries(themeParams).forEach(([k, v]) => root.style.setProperty(k, v as string));

    // ── Show body after CSS loads ──
    const activeSheet = isDark ? darkTheme : lightTheme;
    if (activeSheet) {
      if (activeSheet.sheet) {
        document.body.style.visibility = 'visible';
      } else {
        activeSheet.onload = () => document.body.style.visibility = 'visible';
        setTimeout(() => document.body.style.visibility = 'visible', 300);
      }
    } else {
      document.body.style.visibility = 'visible';
    }
  }

  setHeaderTheme(theme: string) {
    this.settings.headerTheme = theme;
    this.initializeTheme();
    this.auth.webUser.settings.headerTheme = theme;
    this.auth.updateSettings();
  }

  applyCustomColor(hex: string) {
    let isDark = this.auth.webUser.settings.darkMode;
    let isAmoled = this.auth.webUser.settings.amoledMode;
    const theme = this.generateThemeFromColor(hex, isDark);
    if (isDark && !isAmoled) {
      theme['--bg-color'] = '#343a40';
    }
    const root = document.documentElement;
    Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v as string));

    // Save to user settings
    this.auth.webUser.settings.headerTheme = 'custom';
    this.auth.webUser.settings.headerCustomColor = hex;
    this.auth.updateSettings();
  }

  generateThemeFromColor(hex: string, isDark: boolean = true): any {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (isDark) {
      const bgDark = `rgb(${Math.round(r * 0.15)}, ${Math.round(g * 0.15)}, ${Math.round(b * 0.15)})`;
      const bgLight = `rgb(${Math.round(r * 0.22)}, ${Math.round(g * 0.22)}, ${Math.round(b * 0.22)})`;
      const navDark = `rgb(${Math.round(r * 0.06)}, ${Math.round(g * 0.06)}, ${Math.round(b * 0.06)})`;
      const navMid = `rgb(${Math.round(r * 0.18)}, ${Math.round(g * 0.18)}, ${Math.round(b * 0.18)})`;
      const bgColor = `rgb(${Math.round(r * 0.05)}, ${Math.round(g * 0.05)}, ${Math.round(b * 0.05)})`;
      const textR = Math.round(r + (255 - r) * 0.85);
      const textG = Math.round(g + (255 - g) * 0.85);
      const textB = Math.round(b + (255 - b) * 0.85);
      return {
        '--bg-color': bgColor,
        '--thead-bg': `linear-gradient(180deg, ${bgLight} 0%, ${bgDark} 100%)`,
        '--thead-color': `rgb(${textR},${textG},${textB})`,
        '--thead-border-top': `2px solid ${hex}`,
        '--thead-border-bottom': `1px solid rgba(${r},${g},${b},0.3)`,
        '--thead-box-shadow': `0 -1px 10px rgba(${r},${g},${b},0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
        '--thead-accent-color': hex,
        '--card-header-bg': `linear-gradient(180deg, ${bgLight} 0%, ${bgDark} 100%)`,
        '--card-header-color': `rgb(${textR},${textG},${textB})`,
        '--card-header-border': `1px solid rgba(${r},${g},${b},0.3)`,
        '--nav-bg': `linear-gradient(to right, ${navDark}, ${navMid}, ${navDark})`,
        '--nav-border': `rgba(${r},${g},${b},0.25)`,
        '--nav-shadow': `0 10px 30px rgba(${r},${g},${b},0.2)`
      };
    } else {
      const navDark = `rgb(${Math.round(r * 0.06)}, ${Math.round(g * 0.06)}, ${Math.round(b * 0.06)})`;
      const navMid = `rgb(${Math.round(r * 0.18)}, ${Math.round(g * 0.18)}, ${Math.round(b * 0.18)})`;
      const bgColor = `rgba(${r},${g},${b},0.03)`;
      return {
        '--bg-color': bgColor,
        '--thead-bg': `rgba(${r},${g},${b},0.1)`,
        '--thead-color': `rgb(${Math.round(r * 0.4)},${Math.round(g * 0.4)},${Math.round(b * 0.4)})`,
        '--thead-border-top': `2px solid ${hex}`,
        '--thead-border-bottom': `2px solid rgba(${r},${g},${b},0.25)`,
        '--thead-box-shadow': 'none',
        '--thead-accent-color': hex,
        '--card-header-bg': `rgba(${r},${g},${b},0.1)`,
        '--card-header-color': `rgb(${Math.round(r * 0.4)},${Math.round(g * 0.4)},${Math.round(b * 0.4)})`,
        '--card-header-border': `2px solid rgba(${r},${g},${b},0.25)`,
        '--nav-bg': `linear-gradient(to right, ${navDark}, ${navMid}, ${navDark})`,
        '--nav-border': `rgba(${r},${g},${b},0.25)`,
        '--nav-shadow': `0 10px 30px rgba(${r},${g},${b},0.2)`
      };
    }
  }

  toggleDarkMode() {
    this.auth.webUser.settings.darkMode = !this.auth.webUser.settings.darkMode;
    this.auth.updateSettings();
    this.initializeTheme();
  }


  // initializeTheme() {
  //   const lightTheme = document.getElementById('light-style') as HTMLLinkElement;
  //   const darkTheme = document.getElementById('dark-style') as HTMLLinkElement;
  //   document.body.style.visibility = 'hidden';

  //   const isDark = this.auth.webUser.settings.darkMode;
  //   const isAmoled = this.auth.webUser.settings.amoledMode;

  //   if (lightTheme) lightTheme.disabled = isDark;
  //   if (darkTheme) darkTheme.disabled = !isDark;

  //   document.body.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');

  //   const root = document.documentElement;
  //   if (!this.settings?.headerTheme) {
  //     this.settings.headerTheme = 'indigo';
  //   }
  //   this.themeList.forEach(item => {
  //     item.active = this.settings.headerTheme == item.theme;
  //   });

  //   // ── Custom color picker theme ──
  //   let themeParams: any;
  //   if (this.settings.headerTheme === 'custom' && this.settings.headerCustomColor) {
  //     themeParams = this.generateThemeFromColor(this.settings.headerCustomColor);
  //   } else {
  //     themeParams = structuredClone(this.themes[this.settings?.headerTheme] || this.themes['indigo']);
  //   }

  //   if (isDark && !isAmoled) {
  //     themeParams['--bg-color'] = '#343a40';
  //   }

  //   Object.entries(themeParams).forEach(([k, v]) => root.style.setProperty(k, v as string));

  //   const activeSheet = isDark ? darkTheme : lightTheme;

  //   if (activeSheet) {
  //     // If already cached/loaded — show immediately
  //     if (activeSheet.sheet) {
  //       document.body.style.visibility = 'visible';
  //     } else {
  //       // Wait for it to load
  //       activeSheet.onload = () => {
  //         document.body.style.visibility = 'visible';
  //       };
  //       // Safety fallback
  //       setTimeout(() => {
  //         document.body.style.visibility = 'visible';
  //       }, 300);
  //     }
  //   } else {
  //     document.body.style.visibility = 'visible';
  //   }

  //   // document.body.style.visibility = 'visible';
  // }



  // generateThemeFromColor(hex: string): any {
  //   const r = parseInt(hex.slice(1, 3), 16);
  //   const g = parseInt(hex.slice(3, 5), 16);
  //   const b = parseInt(hex.slice(5, 7), 16);

  //   const bgDark = `rgb(${Math.round(r * 0.15)}, ${Math.round(g * 0.15)}, ${Math.round(b * 0.15)})`;
  //   const bgLight = `rgb(${Math.round(r * 0.22)}, ${Math.round(g * 0.22)}, ${Math.round(b * 0.22)})`;
  //   const navDark = `rgb(${Math.round(r * 0.06)}, ${Math.round(g * 0.06)}, ${Math.round(b * 0.06)})`;
  //   const navMid = `rgb(${Math.round(r * 0.18)}, ${Math.round(g * 0.18)}, ${Math.round(b * 0.18)})`;


  //   const textR = Math.round(r + (255 - r) * 0.85);
  //   const textG = Math.round(g + (255 - g) * 0.85);
  //   const textB = Math.round(b + (255 - b) * 0.85);

  //   return {
  //     '--bg-color': `rgb(${Math.round(r * 0.05)}, ${Math.round(g * 0.05)}, ${Math.round(b * 0.05)})`,
  //     '--thead-bg': `linear-gradient(180deg, ${bgLight} 0%, ${bgDark} 100%)`,
  //     '--thead-color': `rgb(${textR},${textG},${textB})`,
  //     '--thead-border-top': `2px solid ${hex}`,
  //     '--thead-border-bottom': `1px solid rgba(${r},${g},${b},0.3)`,
  //     '--thead-box-shadow': `0 -1px 10px rgba(${r},${g},${b},0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
  //     '--thead-accent-color': hex,
  //     '--nav-bg': `linear-gradient(to right, ${navDark}, ${navMid}, ${navDark})`,
  //     '--nav-border': `rgba(${r},${g},${b},0.25)`,
  //     '--nav-shadow': `0 10px 30px rgba(${r},${g},${b},0.2)`
  //   };
  // }


}
