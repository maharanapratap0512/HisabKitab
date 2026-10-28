# ng-sutramui-excel: Testing & Setup Quick Guide

This is the mirrored setup and testing guide for `ng-sutramui-excel`.
The full setup documentation is maintained in the package at:
[ng-sutramui-excel/SETUP-GUIDE.md](file:///Volumes/data/MD/MD%20Softwares/HisabKitab-2022%20/HisabKitab/backend/sutram/ng-sutramui-excel/SETUP-GUIDE.md)

---

## ⚡ Quick Testing Setup Checklist

### 1. Backend Mounting (`sutramExcel` with Express)
In `HisabKitab/backend`:
```javascript
// 1. In backend/api/database/excel.js
const { SutramExcel } = require('../sutram/sutramExcel');
const { sutramEngine } = require('./db.model');

const excel = new SutramExcel(sutramEngine);
excel.register(sutramEngine.table('category'));
excel.register(sutramEngine.table('product'), {
  headers: {
    category_id: { alt_names: ['cat', 'श्रेणी'] },
    unit_id: { alt_names: ['unit', 'यूनिट'] }
  },
  duplicateOn: ['name'],
  canUpdate: true
});
excel.register(sutramEngine.table('pbk'), {
  headers: {
    roll_no: { alt_names: ['roll no', 'रोल नं'] },
    gender: { alt_names: ['लिंग', 'gender'] }
  },
  duplicateOn: ['roll_no']
});

module.exports = { excel };
```

In `backend/app.js`:
```javascript
const { excel } = require('./api/database/excel');
app.use('/_sutram/excel', excel.router());
```

---

### 2. Frontend Integration
Install PrimeNG:
```bash
npm install primeng primeicons
```

In `styles.scss`:
```scss
@import "primeng/resources/themes/lara-light-blue/theme.css";
@import "primeng/resources/primeng.min.css";
@import "primeicons/primeicons.css";
```

In any Angular component:
```html
<sutram-excel-studio [apiBase]="'http://localhost:3000/_sutram/excel'">
</sutram-excel-studio>
```

---

### 3. Key Scenarios to Test
1. **Dynamic Config:** Dropdown changes columns automatically based on selected table.
2. **Scanner Modal:** Drag-and-drop Excel file, headers are auto-matched with confidence scores.
3. **Virtual Grid:** 10,000+ rows scroll at 60 FPS without lag.
4. **Solve All Same Mistake:** In-cell typo correction shows *"⚡ N other cells have 'X' - Solve all?"* + *"Save to Dictionary"* option.
5. **Sidebar:** Toggle button opens batch card review.
6. **Streaming Progress:** Real-time counters during import.
7. **Error Report:** One-click ExcelJS download of rejected rows with red error column.
