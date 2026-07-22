import { ComponentTourGroup } from '../tours/tour.model';

export const AAWAK_TOUR_CONFIG: ComponentTourGroup = {
  id: 'aawak_page_tour',
  pageTitle: 'Aawak Module Guidance / आवक मॉड्यूल मार्गदर्शन',
  masterSteps: [
    {
      element: '#tour-add-aawak-btn',
      popover: {
        title: '➕ Add Aawak Entry / आवक जोड़ें',
        description: 'Click here to create a new single or bunch Aawak record. / नई आवक प्रविष्टि (सिंगल या बंच) बनाने के लिए यहाँ क्लिक करें।',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-bunch-chk',
      popover: {
        title: '📦 Bunch Entry Mode / बंच मोड',
        description: 'Toggle this checkbox to switch between Single entry and Bunch entry mode. / सिंगल और बंच प्रविष्टि मोड के बीच स्विच करने के लिए इसे चेक करें।',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-search-input',
      popover: {
        title: '🔍 Quick Search / त्वरित खोज',
        description: 'Type any item, party name, or packet number here to search. / किसी भी सामान, सेवाधारी का नाम या पैकेट नंबर से तुरंत खोजें।',
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
        description: 'Filter entries by Month, Year, Sewadhari (PBK), Date, Pkt No, Nimitt, & Zone. / माह, वर्ष, सेवाधारी, दिनांक, पैकेट नंबर, निमित्त और ज़ोन द्वारा फ़िल्टर करें।',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '#tour-item-only-chk',
      popover: {
        title: '🏷️ Item Only Filter / केवल आइटम फ़िल्टर',
        description: 'Check to filter records where Item is present but Subitem is Null. / केवल उन्हीं रिकॉर्ड्स को देखने के लिए चेक करें जहाँ सब-आइटम खाली है।',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '#tour-filter-action-btns',
      popover: {
        title: '⚡ Filter Aawak & Jawak / फ़िल्टर बटन',
        description: 'Click "Filter Aawak" or "Filter Jawak" to fetch filtered data. / फ़िल्टर किए गए डेटा को लोड करने के लिए यहाँ क्लिक करें।',
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
        description: 'Upload Excel/CSV file to bulk import new Aawak records. / नए रिकॉर्ड्स को एक साथ अपलोड करने के लिए एक्सेल/CSV फ़ाइल चुनें।',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-export-container',
      popover: {
        title: '📤 Export To Excel / एक्सेल एक्सपोर्ट',
        description: 'Export options: Distribution, Aawak Only, Jawak Only, & Pending. / डिस्ट्रीब्यूशन, आवक, या जावक रिकॉर्ड्स को एक्सेल में डाउनलोड करें।',
        side: 'left',
        align: 'start'
      },
      beforeShowAction: {
        type: 'click',
        target: '#tour-export-btn',
        delayMs: 200
      },
      afterHideAction: {
        type: 'click',
        target: '#tour-export-btn',
        delayMs: 200
      }
    },
    {
      element: '#tour-merge-sort-container',
      popover: {
        title: '🔗 Merge & Sorting / मर्ज और सॉर्टिंग',
        description: 'Merge Item & Subitem columns or sort by MM & Category. / आइटम और सब-आइटम कॉलम को मर्ज करें या श्रेणी अनुसार क्रमित करें।',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '#tour-year-badge',
      popover: {
        title: '📅 Year Filter Badge / वर्ष फ़िल्टर',
        description: 'Click to quickly change active fiscal year. / चालू वित्तीय वर्ष फ़िल्टर बदलने के लिए यहाँ क्लिक करें।',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '#tour-hl-switch',
      popover: {
        title: '⭐ Highlight Row Filter / हाइलाइट फ़िल्टर',
        description: 'Use the header switch to show only highlighted rows. / केवल हाइलाइट की गई पंक्तियों को देखने के लिए यह स्विच चालू करें।',
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
        title: '🗑️ Bulk Delete & Edit / बल्क कार्य',
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
      element: '#tour-row-hl-switch',
      popover: {
        title: '🌟 Row Highlight Switch / पंक्ति हाइलाइट',
        description: 'Toggle to mark any row as highlighted with glowing border. / किसी भी पंक्ति को विशेष रूप से हाइलाइट करने के लिए इसे स्विच करें।',
        side: 'right',
        align: 'center'
      },
      beforeShowAction: {
        type: 'toggle_hl',
        delayMs: 200
      },
      afterHideAction: {
        type: 'toggle_hl',
        delayMs: 100
      }
    },
    {
      element: '#tour-row-manage',
      popover: {
        title: '🛠️ Row Actions / पंक्ति कार्य',
        description: 'Edit (✏️), Delete (🗑️), Add Jawak (+), & Show Jawak (📋). / संपादित करें, हटाएं, जावक जोड़ें, या जावक सूची देखें।',
        side: 'right',
        align: 'center'
      }
    }
  ],
  miniTours: [
    {
      id: 'add_filter',
      title: '➕ Add & Advance Filters / आवक व फ़िल्टर',
      stepIndexes: [0, 1, 2, 3, 4, 5, 6]
    },
    {
      id: 'import_export',
      title: '📥 Excel Import & Export / एक्सेल कार्य',
      stepIndexes: [7, 8, 9]
    },
    {
      id: 'table_data',
      title: '📊 Table Data & Bulk Operations / सारणी कार्य',
      stepIndexes: [10, 11, 12, 13, 14, 15, 16]
    }
  ]
};
