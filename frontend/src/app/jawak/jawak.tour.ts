import { ComponentTourGroup } from '../tours/tour.model';

export const JAWAK_TOUR_CONFIG: ComponentTourGroup = {
  id: 'jawak_page_tour',
  pageTitle: 'Jawak Module Guidance / जावक मॉड्यूल मार्गदर्शन',
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
      element: '#tour-search-input',
      popover: {
        title: '🔍 Quick Search / त्वरित खोज',
        description: 'Type any item, party name, or voucher number here to search. / किसी भी सामान, सेवाधारी का नाम या वाउचर नंबर से तुरंत खोजें।',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-adv-search-btn',
      popover: {
        title: '⚙️ Advance Search Toggle / एडवांस फ़िल्टर',
        description: 'Clicking Next will automatically expand the advance filter panel. / अगला क्लिक करने पर एडवांस फ़िल्टर पैनल अपने आप खुल जाएगा।',
        side: 'bottom',
        align: 'center'
      },
      beforeShowAction: {
        type: 'click',
        target: '#tour-adv-search-btn',
        delayMs: 300
      }
    },
    {
      element: '#collapseExample',
      popover: {
        title: '🎯 Advance Filter Fields / फ़िल्टर फ़ील्ड्स',
        description: 'Filter entries by Month, Year, Sewadhari (PBK), Date, Nimitt, & Zone. / माह, वर्ष, सेवाधारी, दिनांक, निमित्त और ज़ोन द्वारा फ़िल्टर करें।',
        side: 'top',
        align: 'center'
      },
      afterHideAction: {
        type: 'click',
        target: '#tour-adv-search-btn',
        delayMs: 300
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
      element: '#tour-export-btn',
      popover: {
        title: '📤 Export To Excel / एक्सेल एक्सपोर्ट',
        description: 'Click to export current filtered Jawak records to Excel file. / जावक रिकॉर्ड्स को एक्सेल में डाउनलोड करने के लिए यहाँ क्लिक करें।',
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
    },
    {
      element: '#tour-bulk-actions',
      popover: {
        title: '🗑️ Bulk Actions Bar / बल्क कार्य',
        description: 'Shows Delete & Bulk Edit buttons when rows are selected. / पंक्तियां चुनने पर बल्क डिलीट और एडिट बटन यहाँ दिखाई देते हैं।',
        side: 'bottom',
        align: 'start'
      },
      afterHideAction: {
        type: 'select_row',
        delayMs: 100
      }
    },
    {
      element: '#tour-ref-aawak-col-filter',
      popover: {
        title: '🔗 Ref Aawak Filter Switch / संदर्भ आवक फ़िल्टर',
        description: 'Check header switch to show only unlinked jawaks. / केवल अनलिंक्ड जावक रिकॉर्ड्स को देखने के लिए यह स्विच चालू करें।',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '#tour-ref-aawak-cell',
      popover: {
        title: '🔗 Ref Aawak Link / संदर्भ आवक लिंक',
        description: 'Auto-opens Aawak lot dropdown! / ऑटो-क्लिक से आवक स्टॉक लॉट लिस्ट खुलती है!<br><br>• 🔗 / 🟢 <b>Link Icon</b>: Click lot to link this Jawak entry to an Aawak stock lot. / आवक लॉट से लिंक करने पर ग्रीन टिक/लिंक आइकन दिखाई देता है।<br>• 🔗 <b>Unlink Icon</b>: Click clear to unlink & restore item back to stock. / लिंक हटाने पर सामान पुनः स्टॉक में लौट जाता है।',
        side: 'right',
        align: 'center'
      },
      beforeShowAction: [
        { type: 'add_class', target: '#tour-ref-aawak-cell', className: 'tour-focus-combined-cell' },
        { type: 'click', target: '#tour-ref-aawak-cell .tiny-overlay', delayMs: 300 }
      ],
      afterHideAction: [
        { type: 'remove_class', target: '#tour-ref-aawak-cell', className: 'tour-focus-combined-cell' },
        { type: 'close_hover', target: '#tour-ref-aawak-cell app-aawak-ref-dropdown', delayMs: 100 }
      ]
    },
    {
      element: '#tour-recieved-col-filter',
      popover: {
        title: '📦 Received Filter Switch / प्राप्त फ़िल्टर',
        description: 'Check header switch to filter unreceived jawaks. / बिना प्राप्त हुए जावक रिकॉर्ड्स को देखने के लिए स्विच चालू करें।',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '#tour-recieved-switch',
      popover: {
        title: '📦 Received Status Switch / प्राप्त जावक स्विच',
        description: 'Toggle row switch when item is received at destination. / स्थान पर सामान प्राप्त होने पर यह स्विच ऑन करें।',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '#tour-col-filter-date',
      popover: {
        title: '📅 Date Column Filter / दिनांक फ़िल्टर',
        description: 'Auto-opens date filter box! Spotlight encompasses both Date header & popover box together. / फ़िल्टर पॉप-ओवर बॉक्स साथ में हाइलाइट होता है! किसी तिथि से जावक फ़िल्टर करें।',
        side: 'left',
        align: 'center'
      },
      beforeShowAction: [
        { type: 'add_class', target: '#tour-col-filter-date', className: 'tour-focus-combined' },
        { type: 'click', target: '#tour-col-filter-date app-popover-filter button', delayMs: 300 }
      ],
      afterHideAction: [
        { type: 'remove_class', target: '#tour-col-filter-date', className: 'tour-focus-combined' },
        { type: 'close_hover', target: '#tour-col-filter-date app-popover-filter button', delayMs: 100 }
      ]
    },
    {
      element: '#tour-row-manage',
      popover: {
        title: '🛠️ Row Actions / पंक्ति कार्य',
        description: 'Edit (✏️) and Delete (🗑️) Jawak records. / जावक प्रविष्टि को संपादित या हटाएं।',
        side: 'right',
        align: 'center'
      }
    }
  ],
  miniTours: [
    {
      id: 'add_filter',
      title: '➕ Add & Advance Filters / जावक व फ़िल्टर',
      stepIndexes: [0, 1, 2, 3]
    },
    {
      id: 'import_export',
      title: '📥 Excel Import & Export / एक्सेल कार्य',
      stepIndexes: [4, 5]
    },
    {
      id: 'table_data',
      title: '📊 Table Data & Row Features / सारणी व रो फ़ीचर्स',
      stepIndexes: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    }
  ]
};
