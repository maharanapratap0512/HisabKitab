import { ComponentTourGroup } from '../tours/tour.model';

export const JAWAK_NEW_TOUR_CONFIG: ComponentTourGroup = {
  id: 'jawak_new_page_tour',
  pageTitle: 'Jawak New Guidance / जावक सूची मार्गदर्शिका',
  masterSteps: [
    {
      element: '#tour-add-jawak-btn',
      popover: {
        title: '➕ Add Jawak Entry / जावक जोड़ें',
        description: 'Click here to create a new single or bunch Jawak record. / नई जावक प्रविष्टि (सिंगल या बंच) बनाने के लिए यहाँ क्लिक करें।',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-view-mode',
      popover: {
        title: '⚙️ View Mode & Settings / व्यू मोड व सेटिंग्स',
        description: 'Toggle between Single mode and Voucher Wise mode, or same-page entry form. / सिंगल और वाउचर-वाइज़ व्यू मोड के बीच स्विच करें।',
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#tour-popover-filter',
      popover: {
        title: '🎯 Multi-Field Popover Filter / फ़िल्टर पॉप-ओवर',
        description: 'Multi-field filter for Date Range, Category, Item, Sewadhari & MM in Voucher Mode. / तिथि सीमा, श्रेणी, सामान और सेवाधारी द्वारा फ़िल्टर करें।',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '#tour-search-input',
      popover: {
        title: '🔍 Quick Search / त्वरित खोज',
        description: 'Type any item, party name, or voucher number here to search. / किसी भी सामान, सेवाधारी का नाम या वाउचर नंबर से तुरंत खोजें।',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-import-btn',
      popover: {
        title: '📥 Import Excel Data / एक्सेल इम्पोर्ट',
        description: 'Upload Excel/CSV file to bulk import new Jawak records. / नए रिकॉर्ड्स को एक साथ अपलोड करने के लिए एक्सेल/CSV फ़ाइल चुनें।',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-export-container',
      popover: {
        title: '📤 Export To Excel / एक्सेल एक्सपोर्ट',
        description: 'Export Jawak records to Excel report file. / जावक रिकॉर्ड्स को एक्सेल रिपोर्ट में डाउनलोड करें।',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '#tour-total-count',
      popover: {
        title: '📊 Total Count / कुल प्रविष्टियां',
        description: 'Shows total count of filtered Jawak records. / कुल जावक प्रविष्टियों की संख्या।',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-year-badge',
      popover: {
        title: '📅 Fiscal Year Filter / वर्ष फ़िल्टर',
        description: 'Click to change active fiscal year filter. / चालू वित्तीय वर्ष फ़िल्टर बदलने के लिए यहाँ क्लिक करें।',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '.smart-selection-header',
      popover: {
        title: '☑️ Select All Checkbox / सभी चुनें',
        description: 'Click to select or deselect all table rows. / सभी पंक्तियों को एक साथ चुनने या हटाने के लिए क्लिक करें।',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '.smart-selection-row',
      popover: {
        title: '☑️ Row Selection / पंक्ति चयन',
        description: 'Check individual rows for bulk delete or edit. / बल्क डिलीट या एडिट के लिए व्यक्तिगत पंक्तियों को चुनें।',
        side: 'right',
        align: 'center'
      },
      beforeShowAction: {
        type: 'select_row',
        delayMs: 200
      }
    }
  ],
  miniTours: [
    {
      id: 'add_filter',
      title: '➕ Settings & Filters / सेटिंग्स व फ़िल्टर',
      stepIndexes: [0, 1, 2, 3]
    },
    {
      id: 'import_export',
      title: '📥 Excel Import & Export / एक्सेल कार्य',
      stepIndexes: [4, 5]
    },
    {
      id: 'table_data',
      title: '📊 Table Data & Bulk Operations / सारणी कार्य',
      stepIndexes: [6, 7, 8, 9]
    }
  ]
};
