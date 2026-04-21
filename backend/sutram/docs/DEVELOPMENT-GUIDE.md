# Development Guide

## Quick Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Clone Repository

git clone https://github.com/maharanapratap0512/Sutram-Eco-System.git
cd Sutram-Eco-System

### Install Dependencies

Root:
npm install

Backend:
cd packages/backend/sutramserver
npm install

Frontend:
cd apps/frontend
npm install

---

## Running Locally

### Start Backend

cd packages/backend/sutramserver
npm start

Runs on: http://localhost:3000
API: http://localhost:3000/api

### Start Frontend

cd apps/frontend
ng serve

Runs on: http://localhost:4200
Connects to: http://localhost:3000/api

---

## Project Structure

Sutram-Eco-System/
├─ packages/
│  ├─ backend/
│  │  ├─ sutramcore/ - SQLite ORM (sync)
│  │  ├─ sutramcore-mysql/ - MySQL adapter (async)
│  │  ├─ sutramcore-sequelize/ - Multi-dialect adapter (async)
│  │  ├─ sutramEngine/ - Business logic engine
│  │  ├─ sutramExcel/ - Excel import/export
│  │  └─ sutramserver/ - Express server (main entry)
│  └─ frontend/
│     ├─ ng-sutramui/ - Angular component library
│     ├─ sutramUI/ - Main app
│     └─ sutramAdmin/ - Admin variant
├─ apps/
│  ├─ frontend/ - Demo app folder
│  └─ backend/ - Demo backend folder
├─ docs/ - Documentation
└─ README.md

---

## Testing

### Backend Tests

cd packages/backend/sutramcore
npm test

cd packages/backend/sutramengine
npm test

### Frontend Tests

cd apps/frontend
ng test

### Integration Tests

cd apps/frontend
ng e2e

---

## Debugging

### Backend (Node.js)

Run with inspect:
node --inspect packages/backend/sutramserver/server.js

Chrome DevTools:
chrome://inspect

### Frontend (Angular)

Angular DevTools Chrome Extension
Console logs
VS Code debugger with breakpoints

---

## Package Development

### Creating New Backend Package

1. Create folder: packages/backend/mypackage

2. Create package.json:
{
  "name": "mypackage",
  "version": "1.0.0-beta.1",
  "main": "src/index.ts"
}

3. Create src/index.ts:
export class MyPackage {
  // Implementation
}

4. Install dependencies:
cd packages/backend/mypackage
npm install

5. Test:
npm test

### Creating New Frontend Component

1. Generate:
ng generate component my-component

2. Make standalone:
@Component({
  standalone: true,
  imports: [CommonModule]
})

3. Export from index.ts

4. Import in app.config.ts

---

## Git Workflow

### Create Feature Branch

git checkout -b feature/my-feature

### Make Changes

git add .
git commit -m "Add feature: description"

### Push Changes

git push origin feature/my-feature

### Create Pull Request

1. Go to GitHub
2. Click "New Pull Request"
3. Select your branch
4. Add description
5. Submit PR

### Code Review

Wait for feedback
Make requested changes
Push updates
PR auto-updates

### Merge

Once approved:
Click "Merge Pull Request"

---

## Documentation

### Add to README

For new packages:
1. Update packages/*/README.md
2. Update docs/BACKEND-PACKAGES.md or docs/FRONTEND-PACKAGES.md
3. Commit documentation changes

### Update API Contract

If adding new endpoints:
1. Document in docs/API-CONTRACT.md
2. Include request/response examples
3. List parameters and data types

---

## Troubleshooting

### Port Already in Use

Backend (3000):
npx kill-port 3000
npm start

Frontend (4200):
ng serve --port 4201

### Module Not Found

Clear node_modules:
rm -rf node_modules
npm install

### Database Lock Error

SQLite locked:
rm data.db
npm start (recreates)

### CORS Errors

Check app.config.ts apiBase matches backend port
Ensure backend CORS enabled

### TypeScript Errors

npm run build
npm run lint

---

## Performance Profiling

### Backend
Use Node.js profiler:
node --prof server.js
node --prof-process data.log

### Frontend
Use Angular DevTools
Chrome DevTools Performance tab

---

## Environment Variables

Create .env in root:

PORT=3000
NODE_ENV=development
DB_PATH=./data.db
DB_HOST=localhost
DB_USER=root
DB_PASS=password
VITE_API_BASE=http://localhost:3000/api

---

## Useful Commands

npm start → Start application
npm test → Run tests
npm run build → Build for production
npm run lint → Check code style
npm run format → Auto-format code
npm run docs → Generate documentation

---

## Build for Production

### Backend

cd packages/backend/sutramserver
npm run build

Output: dist/

### Frontend

cd apps/frontend
ng build --configuration production

Output: dist/apps/frontend/

---

## Deployment

### Docker (Optional)

docker build -t sutram:latest .
docker run -p 3000:3000 sutram:latest

### Manual Deploy

1. Push to production branch
2. SSH into server
3. git pull origin production
4. npm install
5. npm run build
6. npm start (or use PM2)

---

## Contributing Checklist

Before submitting PR:

1. ✓ Code follows style guide
2. ✓ Tests pass locally
3. ✓ Documentation updated
4. ✓ No console errors/warnings
5. ✓ Commit message clear
6. ✓ Branch based on main
7. ✓ PR description complete
8. ✓ No merge conflicts

---

## Code Style

### JavaScript/TypeScript

- Use const/let (no var)
- Use arrow functions
- Use async/await
- Use template literals
- Use destructuring

### Naming Conventions

- Functions: camelCase
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE
- Private: _leadingUnderscore

### Comments

- Use JSDoc for functions
- Explain "why", not "what"
- Keep comments updated

---

## Resources

- Angular Docs: https://angular.io
- PrimeNG Docs: https://primeng.org
- Bootstrap Docs: https://getbootstrap.com
- Node.js Docs: https://nodejs.org
- Express Docs: https://expressjs.com
- TypeScript Docs: https://www.typescriptlang.org
- Sequelize Docs: https://sequelize.org
- better-sqlite3 Docs: https://github.com/WiseLibs/better-sqlite3

---

## Support

Questions?
1. Check docs/
2. Search existing issues
3. Create new issue
4. Contact maintainers

---

## License

MIT