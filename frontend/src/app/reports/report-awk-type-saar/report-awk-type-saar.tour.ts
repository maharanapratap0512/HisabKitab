import { ComponentTourGroup } from '../../tours/tour.model';

export const REPORT_TYPE_SAAR_TOUR_CONFIG: ComponentTourGroup = {
  id: 'report_type_saar_tour',
  pageTitle: 'AJ Type Saar Guidance / आवक जावक प्रकार सार गाइड',
  masterSteps: [
    {
      element: '#tour-dimension-toggle',
      popover: {
        title: '🔄 Aawak / Jawak Saar Switch / आवक व जावक प्रकार सार स्विच',
        description: 'Switch between Aawak Type Saar (आवक प्रकार सार) and Jawak Type Saar (जावक प्रकार सार) with a single click. / एक क्लिक में आवक व जावक प्रकार सार के बीच बदलें।',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-filter-year',
      popover: {
        title: '📅 Year Filter / वर्ष का चयन',
        description: 'Select the fiscal year for the report. / रिपोर्ट के लिए वित्तीय वर्ष चुनें।',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-filter-month',
      popover: {
        title: '📆 Month(s) Filter / महीना चयन',
        description: 'Select single or multiple months to generate matrix summary columns. / मैट्रिक्स सारांश कॉलम जनरेट करने के लिए एक या अधिक महीने चुनें।',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-filter-category',
      popover: {
        title: '🏷️ Category Filter / श्रेणी फ़िल्टर',
        description: 'Optionally filter report items by category. / श्रेणी द्वारा रिपोर्ट वस्तुओं को फ़िल्टर करें।',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-filter-item',
      popover: {
        title: '📦 Item / Subitem Dropdown / आइटम व सबआइटम फ़िल्टर',
        description: 'Select specific items or subitems to narrow down the report view. / विशिष्ट आइटम या सबआइटम चुनकर सार रिपोर्ट देखें।',
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '#tour-filter-type',
      popover: {
        title: '🔖 Type Filter / प्रकार फ़िल्टर',
        description: 'Filter entries by specific Aawak or Jawak support types. / विशिष्ट आवक या जावक प्रकार द्वारा प्रविष्टियों को फ़िल्टर करें।',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '#tour-btn-generate',
      popover: {
        title: '🔍 Generate Report / रिपोर्ट जनरेट करें',
        description: 'Click here to execute search and load report matrix data. / खोज निष्पादित करने और रिपोर्ट लोड करने के लिए यहाँ क्लिक करें।',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '#tour-btn-excel',
      popover: {
        title: '📊 Export Excel Options / एक्सेल एक्सपोर्ट',
        description: 'Export General Combo Excel (Hindi + English) or Multi-Sheet Detailed Excel (Saar + Monthly sheets). / सामान्य या बहु-शीट विस्तृत एक्सेल रिपोर्ट डाउनलोड करें।',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '#tour-btn-pdf',
      popover: {
        title: '📄 Export PDF Options / PDF एक्सपोर्ट',
        description: 'Export Instant Standard PDF, Puppeteer Saar PDF, or Puppeteer Advance Detailed PDF with clickable item links! / इंस्टेंट स्टैंडर्ड, पपेटियर सार या इंटरएक्टिव एडवांस PDF एक्सपोर्ट करें।',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '#tour-hide-zero-switch',
      popover: {
        title: '👁️ Hide 0 Rows Switch / 0 पंक्तियाँ छिपाएँ',
        description: 'Toggle this switch to instantly hide rows with 0 total quantity. / कुल मात्रा 0 वाली पंक्तियों को तुरंत छिपाने के लिए इसे स्विच करें।',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-view-toggle',
      popover: {
        title: '🔀 Grouped vs Flat View / समूहीकृत व सपाट सूची',
        description: 'Switch between Grouped View (left common columns merged with item subtotals) and Flat View. / समूहीकृत व सपाट सूची के बीच बदलें।',
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#tour-table-matrix',
      popover: {
        title: '🖱️ Click Quantity Cell for Details / प्रविष्टि विवरण व संपादन',
        description: 'Click on any month quantity cell or row total to open full transaction vouchers with inline Edit & Delete features! / विस्तृत वाउचर प्रविष्टियाँ देखने व Edit/Delete करने के लिए मात्रा सेल पर क्लिक करें।',
        side: 'top',
        align: 'center'
      }
    }
  ]
};
