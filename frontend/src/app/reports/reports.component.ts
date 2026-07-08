import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: []
})
export class ReportsComponent implements OnInit {

  reports = [
    { 
      id: 'report-aj-check', 
      title: 'Aawak Jawak Check', 
      path: '/report-aj-check', 
      description: 'Cross-checks Aawak and Jawak entries for discrepancies.', 
      descriptionHi: 'आवक और जावक एंट्रीज के बीच के अंतर की जांच करता है।',
      howToUse: 'Select the date range and click generate to view mismatched entries between Aawak and Jawak.',
      howToUseHi: 'आवक और जावक के बीच बेमेल एंट्रीज देखने के लिए दिनांक चुनें और जनरेट पर क्लिक करें।'
    },
    { 
      id: 'report-at', 
      title: 'Aawak Type Saar', 
      path: '/report-at', 
      description: 'Summarizes Aawak entries categorized by their type.', 
      descriptionHi: 'आवक प्रकार के आधार पर आवक एंट्रीज का सारांश दिखाता है।',
      howToUse: 'Choose the specific Aawak type and date to view the summarized report.',
      howToUseHi: 'सारांश रिपोर्ट देखने के लिए विशिष्ट आवक प्रकार और दिनांक चुनें।'
    },
    { 
      id: 'report-jt', 
      title: 'Jawak Type Saar', 
      path: '/report-jt', 
      description: 'Summarizes Jawak entries categorized by their type.', 
      descriptionHi: 'जावक प्रकार के आधार पर जावक एंट्रीज का सारांश दिखाता है।',
      howToUse: 'Choose the specific Jawak type and date to view the summarized report.',
      howToUseHi: 'सारांश रिपोर्ट देखने के लिए विशिष्ट जावक प्रकार और दिनांक चुनें।'
    },
    { 
      id: 'report-str-stk', 
      title: 'Store Stock', 
      path: '/report-str-stk', 
      description: 'Displays the current available stock in the store.', 
      descriptionHi: 'स्टोर में वर्तमान उपलब्ध स्टॉक प्रदर्शित करता है।',
      howToUse: 'Open the report to see real-time inventory of all store items.',
      howToUseHi: 'सभी स्टोर आइटम की रीयल-टाइम इन्वेंट्री देखने के लिए रिपोर्ट खोलें।'
    },
    { 
      id: 'report-item-ledger', 
      title: 'Item Ledger', 
      path: '/report-item-ledger', 
      description: 'Detailed ledger showing Aawak, Jawak and Bachat for items.', 
      descriptionHi: 'वस्तुओं के लिए आवक, जावक और बचत दिखाने वाला विस्तृत लेजर।',
      howToUse: 'Select Month/Year, Category, and Items to view the ledger.',
      howToUseHi: 'लेजर देखने के लिए माह/वर्ष, श्रेणी और आइटम चुनें।'
    },
    { 
      id: 'report-kh-saar', 
      title: 'Khet Saar', 
      path: '/report-kh-saar', 
      description: 'Summarizes Khet (farm) related data.', 
      descriptionHi: 'खेत से संबंधित डेटा का सारांश प्रस्तुत करता है।',
      howToUse: 'Select the criteria to view the Khet summary.',
      howToUseHi: 'खेत का सारांश देखने के लिए मापदंड चुनें।'
    },
    { 
      id: 'report-kh-itemwise', 
      title: 'Khet Saar (Item Wise)', 
      path: '/report-kh-itemwise', 
      description: 'Detailed Khet summary broken down by individual items.', 
      descriptionHi: 'विभिन्न आइटम्स के अनुसार खेत का विस्तृत सारांश।',
      howToUse: 'View detailed item-wise farm statistics by selecting the desired item.',
      howToUseHi: 'वांछित आइटम का चयन करके आइटम-वार खेत के आंकड़े देखें।'
    },
    { 
      id: 'report-kh-ajsaar', 
      title: 'Khet AJ Saar', 
      path: '/report-kh-ajsaar', 
      description: 'Aawak Jawak summary specifically for Khet.', 
      descriptionHi: 'विशेष रूप से खेत के लिए आवक जावक सारांश।',
      howToUse: 'Check the inward and outward entries specifically related to farm operations.',
      howToUseHi: 'खेत संचालन से संबंधित आवक और जावक एंट्रीज की जाँच करें।'
    }
  ];

  selectedReport: any = null;
  isDetailsOpen: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.checkCurrentRoute(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkCurrentRoute(event.urlAfterRedirects || event.url);
    });
  }

  checkCurrentRoute(url: string) {
    // URL would be something like /report/report-aj-check
    const found = this.reports.find(r => url.includes(r.path));
    if (found) {
      this.selectedReport = found;
    } else {
      this.selectedReport = null;
    }
  }

  selectReport(report: any) {
    this.selectedReport = report;
    this.isDetailsOpen = false; // Close details when a new report is selected
    this.router.navigate(['/report' + report.path]);
  }
  
  toggleDetails() {
    this.isDetailsOpen = !this.isDetailsOpen;
  }
}
