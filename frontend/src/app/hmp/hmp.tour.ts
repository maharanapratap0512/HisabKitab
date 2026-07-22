import { ComponentTourGroup } from '../tours/tour.model';

export const HMP_TOUR_CONFIG: ComponentTourGroup = {
  id: 'hmp_page_tour',
  pageTitle: 'HMP Module Guidance / एचएमपी मॉड्यूल मार्गदर्शन',
  masterSteps: [
    {
      element: '#tour-add-hmp-btn',
      popover: {
        title: '➕ Add HMP Batch / एचएमपी बैच जोड़ें',
        description: 'Click here to create a new HMP batch record. / नया एचएमपी प्रोसेसिंग बैच बनाने के लिए यहाँ क्लिक करें।',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-view-mode',
      popover: {
        title: '⚙️ View Mode & Settings / व्यू मोड व सेटिंग्स',
        description: 'Toggle between Individual row mode and Voucher Wise accordion mode. / सिंगल रो और वाउचर-वाइज़ एकॉर्डियन व्यू मोड के बीच स्विच करें।',
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#tour-popover-filter',
      popover: {
        title: '🎯 Multi-Field Popover Filter / फ़िल्टर पॉप-ओवर',
        description: 'Filter HMP batches by Date Range, Recipe, & MM. / तिथि सीमा, रेसिपी और स्थान (MM) द्वारा फ़िल्टर करें।',
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
        title: '📤 Export To Excel & PDF / एक्सेल व पीडीएफ एक्सपोर्ट',
        description: 'Export options: Excel (With Distribution), Normal PDF, & Advance Layout PDF. / डिस्ट्रीब्यूशन एक्सेल, सामान्य पीडीएफ या एडवांस लेआउट पीडीएफ डाउनलोड करें।',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '#tour-hmp-inputs',
      popover: {
        title: '⬇️ Input Materials (Left Half) / इनपुट कच्चा माल',
        description: 'Left side of table shows consumed input materials. Glowing border indicates auto-jawak stock deduction. / बायाँ हिस्सा खपत हुए कच्चे माल की सूची दिखाता है।',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '#tour-hmp-outputs',
      popover: {
        title: '⬆️ Output Materials (Right Half) / आउटपुट तैयार माल',
        description: 'Right side of table shows produced output items. Glowing border indicates auto-aawak stock addition. / दायाँ हिस्सा तैयार उत्पाद और स्टॉक प्राप्ति दिखाता है।',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '#tour-hmp-manage',
      popover: {
        title: '🛠️ Batch Status, Edit & Delete / संपादन व विलोपन',
        description: 'Edit (✏️) or Delete (🗑️) HMP batches on the right side of batch header. / एचएमपी बैच को संपादित करें या हटाएं।',
        side: 'left',
        align: 'center'
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
      id: 'table_data',
      title: '📊 Export & Table Features / टेबल व पीडीएफ फ़ीचर्स',
      stepIndexes: [4, 5, 6, 7]
    }
  ]
};
