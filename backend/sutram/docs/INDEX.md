# Sutram Eco-System: Master Documentation Index

Welcome to the comprehensive documentation index for the **Sutram Eco-System**. All backend and frontend packages, API contracts, guides, and architectural blueprints are organized below.

---

## 📚 1. Ecosystem Overview

| Layer | Package | Description | Status | Documentation |
| :--- | :--- | :--- | :--- | :--- |
| **Backend ORM** | `sutramcore` | Metadata-driven synchronous SQLite ORM | Complete | [sutramcore-docs.html](sutramcore-docs.html) |
| **Backend Adapter** | `sutramcore-mysql` | Async MySQL adapter with connection pooling | Complete | [sutramcore-mysql-docs.html](sutramcore-mysql-docs.html) |
| **Backend Adapter** | `sutramcore-sequelize`| Multi-dialect async ORM adapter | Complete | [sutramcore-sequelize-docs.html](sutramcore-sequelize-docs.html) |
| **Backend Engine** | `sutramEngine` | Business logic, triggers, reports, auto-router | Complete | [sutramEngine-docs-final.html](sutramEngine-docs-final.html) |
| **Backend Excel** | `sutramExcel` | Schema-driven Excel import, RefMatcher, dictionary | Complete | [sutramexcel-docs.html](sutramexcel-docs.html) |
| **Frontend UI** | `ng-sutramui` | Schema-driven Angular components (PrimeNG/Bootstrap) | Complete | [ng-sutramui-docs.html](ng-sutramui-docs.html), [FRONTEND-PACKAGES.md](FRONTEND-PACKAGES.md) |
| **Frontend Excel**| `ng-sutramui-excel` | Enterprise PrimeNG Virtual Table Excel Studio | Complete | [Master Plan](NG_SUTRAMUI_EXCEL_MASTER_PLAN.md), [Functions Index](ARCHITECTURE_AND_FUNCTIONS_INDEX.md), [Setup Guide](SETUP_AND_TESTING_GUIDE.md) |

---

## 📑 2. General Guides & Contracts

1. **API Contract Specification:**
   - [API-CONTRACT.md](API-CONTRACT.md) — Comprehensive API contract between backend packages and frontend consumers.
2. **Development & Contributing Guide:**
   - [DEVELOPMENT-GUIDE.md](DEVELOPMENT-GUIDE.md) — Local development, prerequisites, testing, and debugging guide.
3. **Backend Packages Documentation:**
   - [backend-packages.md](backend-packages.md) — Overview of all backend packages and usage examples.
4. **Frontend Packages Documentation:**
   - [FRONTEND-PACKAGES.md](FRONTEND-PACKAGES.md) — Overview of frontend component packages and providers.

---

## 📊 3. `ng-sutramui-excel` (Excel Studio) Documentation

All architectural specifications, functions reference, and testing setup guides for the PrimeNG Excel package:

1. **[NG_SUTRAMUI_EXCEL_MASTER_PLAN.md](NG_SUTRAMUI_EXCEL_MASTER_PLAN.md)**
   - Complete technical blueprint, PrimeNG component mapping, dual-correction UX (in-cell + collapsible sidebar), streaming import pipeline, and error reporting.
2. **[ARCHITECTURE_AND_FUNCTIONS_INDEX.md](ARCHITECTURE_AND_FUNCTIONS_INDEX.md)**
   - Granular, structured function-by-function and file-by-file index covering utils, models, services, components, and styles.
3. **[SETUP_AND_TESTING_GUIDE.md](SETUP_AND_TESTING_GUIDE.md)**
   - Step-by-step instructions to mount `sutramExcel` in Express, import `SutramExcelModule`, and execute the 8 end-to-end testing scenarios.

---

## 📂 4. Package Locations in Repository

```
HisabKitab/backend/sutram/
├── docs/                     # ← You are here (All Sutram documentation)
├── sutramcore/               # SQLite ORM package
├── sutramcore-mysql/         # MySQL adapter package
├── sutramEngine/             # Core business engine package
├── sutramExcel/              # Backend Excel import/export engine
└── ng-sutramui-excel/        # PrimeNG frontend Excel Studio package
    ├── package.json
    ├── README.md
    ├── SETUP-GUIDE.md
    ├── docs/                 # Package-local mirrored documentation
    └── src/
```
