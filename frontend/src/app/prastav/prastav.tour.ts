import { ComponentTourGroup } from '../tours/tour.model';

export const PRASTAV_TOUR_CONFIG: ComponentTourGroup = {
  id: 'prastav_page_tour',
  pageTitle: 'Prastav Module Guidance / प्रस्ताव मॉड्यूल मार्गदर्शन',
  masterSteps: [
    {
      element: '#tour-add-prastav-btn',
      popover: {
        title: '➕ Add Prastav / प्रस्ताव जोड़ें',
        description: 'Click here to create a new proposal (Prastav). / नया प्रस्ताव प्रविष्टि बनाने के लिए यहाँ क्लिक करें।',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-view-mode',
      popover: {
        title: '⚙️ View Mode & Settings / व्यू मोड व सेटिंग्स',
        description: 'Toggle between Single mode and Voucher Wise accordion mode. / सिंगल और वाउचर-वाइज़ व्यू मोड के बीच स्विच करें।',
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#tour-col-filter-date',
      popover: {
        title: '📅 Date Column Filter / दिनांक फ़िल्टर',
        description: 'Column filter to view proposals for a specific date. / किसी विशेष तिथि के आधार पर प्रस्ताव फ़िल्टर करें।',
        side: 'right',
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
      element: '#tour-col-filter-mm',
      popover: {
        title: '🏢 MM Column Filter / स्थान (MM) फ़िल्टर',
        description: 'Filter proposals by specific origin/destination MM. / स्थान (MM) के आधार पर प्रस्ताव फ़िल्टर करें।',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '#tour-col-filter-pbk',
      popover: {
        title: '👤 PBK Column Filter / सेवाधारी फ़िल्टर',
        description: 'Filter proposals by requesting Sewadhari / PBK. / सेवाधारी के आधार पर प्रस्ताव फ़िल्टर करें।',
        side: 'right',
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
      element: '#tour-export-container',
      popover: {
        title: '📤 Export To Excel / एक्सेल एक्सपोर्ट',
        description: 'Export proposals list to Excel report file. / प्रस्तावों की सूची को एक्सेल रिपोर्ट में डाउनलोड करें।',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '#tour-row-manage',
      popover: {
        title: '🛠️ Voucher Actions / प्रस्ताव कार्य',
        description: 'Edit (✏️), Jawak for all items (🚛), or Delete (🗑️) proposals. / प्रस्ताव को संपादित करें, सभी वस्तुओं के लिए जावक बनाएं या हटाएं।',
        side: 'right',
        align: 'center'
      }
    }
  ],
  miniTours: [
    {
      id: 'add_filter',
      title: '➕ Settings & Filters / सेटिंग्स व फ़िल्टर',
      stepIndexes: [0, 1, 2, 3, 4]
    },
    {
      id: 'table_data',
      title: '📊 Export & Table Actions / सारणी कार्य',
      stepIndexes: [5, 6, 7]
    }
  ]
};
