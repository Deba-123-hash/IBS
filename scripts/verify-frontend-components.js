import fs from 'fs';
import path from 'path';

console.log('\n=============================================================');
console.log('  CAMPHUB FRONTEND OVERHAUL: QUALITY & COMPONENT AUDIT SUITE');
console.log('=============================================================\n');

let passed = 0;
let failed = 0;

function assert(description, condition, extra = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${description} ${extra ? `-> ${extra}` : ''}`);
    failed++;
  }
}

// 1. Component Source Code Inspection
console.log('[Suite 1: WCAG 2.1 AA & Form Control Semantics]');

const modalSrc = fs.readFileSync(path.resolve('client/src/components/ui/Modal.jsx'), 'utf-8');
assert('Modal enforces role="dialog"', modalSrc.includes('role="dialog"'));
assert('Modal enforces aria-modal="true"', modalSrc.includes('aria-modal="true"'));
assert('Modal handles Escape key dismissal', modalSrc.includes("e.key === 'Escape'"));
assert('Modal manages Tab key focus trapping', modalSrc.includes("e.key === 'Tab'") && modalSrc.includes('focusables'));
assert('Modal implements aria-label on close action', modalSrc.includes('aria-label="Close dialog"'));

const inputSrc = fs.readFileSync(path.resolve('client/src/components/ui/Input.jsx'), 'utf-8');
assert('Input uses React 18 useId for deterministic IDs', inputSrc.includes('useId()'));
assert('Input binds aria-invalid for error state', inputSrc.includes('aria-invalid='));
assert('Input binds aria-describedby for assistive tech', inputSrc.includes('aria-describedby='));
assert('Input marks error element with role="alert"', inputSrc.includes('role="alert"'));

const selectSrc = fs.readFileSync(path.resolve('client/src/components/ui/Select.jsx'), 'utf-8');
assert('Select uses React 18 useId for label binding', selectSrc.includes('useId()'));
assert('Select handles aria-invalid and aria-describedby', selectSrc.includes('aria-invalid=') && selectSrc.includes('aria-describedby='));

// 2. Mobile Responsive Architecture
console.log('\n[Suite 2: Mobile Responsive Layout System]');

const dataTableSrc = fs.readFileSync(path.resolve('client/src/components/tables/DataTable.jsx'), 'utf-8');
assert('DataTable provides desktop table container (hidden md:block)', dataTableSrc.includes('hidden md:block'));
assert('DataTable provides mobile card container (block md:hidden)', dataTableSrc.includes('block md:hidden'));
assert('DataTable provides pagination controls', dataTableSrc.includes('enablePagination') && dataTableSrc.includes('ChevronLeft'));

// 3. Performance & Bundle Budget Verification
console.log('\n[Suite 3: Production Bundle & Code Splitting Budget]');

const distDir = path.resolve('client/dist/assets');
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  const indexJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
  assert('Production index.js bundle exists', !!indexJs);

  if (indexJs) {
    const stats = fs.statSync(path.join(distDir, indexJs));
    const sizeKb = stats.size / 1024;
    console.log(`     (Actual index.js bundle size: ${sizeKb.toFixed(2)} KB)`);
    assert('Index bundle meets strict budget (< 150 KB)', sizeKb < 150, `Size was ${sizeKb.toFixed(2)} KB`);
  }

  const vendorReact = files.find(f => f.startsWith('vendor-react-'));
  const vendorQuery = files.find(f => f.startsWith('vendor-query-'));
  const vendorUi = files.find(f => f.startsWith('vendor-ui-'));
  assert('Vendor chunking isolates React runtime', !!vendorReact);
  assert('Vendor chunking isolates TanStack Query', !!vendorQuery);
  assert('Vendor chunking isolates UI icon/animation libraries', !!vendorUi);

  const routeChunks = files.filter(f => f.endsWith('.js') && !f.startsWith('vendor-') && !f.startsWith('index-'));
  assert('Route-level lazy loading emits modular page chunks (> 20 chunks)', routeChunks.length >= 20, `Found ${routeChunks.length} chunks`);
} else {
  assert('Production dist directory exists', false, 'Run npm run build first');
}

// 4. Storybook Configuration & Component Stories
console.log('\n[Suite 4: Storybook 8 Design System & Stories]');

assert('Storybook main configuration exists', fs.existsSync(path.resolve('client/.storybook/main.js')));
assert('Storybook preview configuration exists', fs.existsSync(path.resolve('client/.storybook/preview.jsx')));
assert('Button component story exists', fs.existsSync(path.resolve('client/src/components/ui/Button.stories.jsx')));
assert('Input component story exists', fs.existsSync(path.resolve('client/src/components/ui/Input.stories.jsx')));
assert('Modal component story exists', fs.existsSync(path.resolve('client/src/components/ui/Modal.stories.jsx')));
assert('DataTable component story exists', fs.existsSync(path.resolve('client/src/components/tables/DataTable.stories.jsx')));

console.log('\n-------------------------------------------------------------');
console.log(`  VERIFICATION RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('-------------------------------------------------------------\n');

process.exit(failed > 0 ? 1 : 0);

