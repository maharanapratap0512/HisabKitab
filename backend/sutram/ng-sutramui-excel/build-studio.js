/**
 * build-studio.js
 * ─────────────────────────────────────────────────────────────
 * Autonomous build script for ng-sutramui-excel Playground Studio.
 * Compiles TypeScript/Angular components via ngc (AOT Ivy)
 * and bundles all styles, fonts, and scripts via esbuild
 * directly into backend/sutram/sutramExcel/public for instant live testing.
 * ─────────────────────────────────────────────────────────────
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const workspaceDir = path.resolve(rootDir, '../../../');
const publicDir = path.resolve(rootDir, '../sutramExcel/public');
const ngcBin = path.resolve(workspaceDir, 'frontend/node_modules/.bin/ngc');
const esbuildBin = path.resolve(workspaceDir, 'frontend/node_modules/.bin/esbuild');

console.log('🚀 [SutramStudio] Starting build...');

// 1. Run Angular Compiler (ngc AOT)
console.log('📦 1/3 Compiling Angular components (ngc)...');
execSync(`"${ngcBin}" -p "${path.join(rootDir, 'playground/tsconfig.json')}"`, {
  cwd: workspaceDir,
  stdio: 'inherit'
});

// 2. Bundle CSS, Fonts, and Assets via esbuild
console.log('🎨 2/3 Bundling styles & fonts (esbuild)...');
execSync(`"${esbuildBin}" "${path.join(rootDir, 'playground/styles.css')}" --bundle --outdir="${publicDir}" --loader:.woff2=file --loader:.woff=file --loader:.ttf=file --loader:.svg=file --loader:.eot=file --loader:.png=dataurl`, {
  cwd: workspaceDir,
  stdio: 'inherit'
});

// 3. Bundle Main ES Module via esbuild
console.log('⚡ 3/3 Bundling JavaScript application (esbuild)...');
execSync(`"${esbuildBin}" "${path.join(rootDir, 'playground/out-tsc/playground/main.js')}" --bundle --outfile="${path.join(publicDir, 'main.js')}" --format=esm`, {
  cwd: workspaceDir,
  stdio: 'inherit'
});

// 4. Deploy HTML with automatic cache-busting
const htmlContent = fs.readFileSync(path.join(rootDir, 'playground/index.html'), 'utf8');
const versionedHtml = htmlContent
  .replace('href="styles.css"', `href="styles.css?v=${Date.now()}"`)
  .replace('src="main.js"', `src="main.js?v=${Date.now()}"`);
fs.writeFileSync(path.join(publicDir, 'index.html'), versionedHtml, 'utf8');

console.log('✅ [SutramStudio] Studio built successfully into sutramExcel/public!');
