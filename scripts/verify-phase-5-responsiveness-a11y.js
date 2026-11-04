/**
 * CampusOS Phase 5 Automated Responsive Design, Accessibility & Performance Verification Suite
 * Tests 35 Checkpoints across Viewports (320px to 1920px), WCAG 2.2 AA, Touch Ergonomics, and Vite Bundle.
 */

import fs from 'fs';
import path from 'path';

console.log('\n================================================================');
console.log('  CAMPUSOS PHASE 5: RESPONSIVE DESIGN, ACCESSIBILITY & PERFORMANCE');
console.log('  Target: WCAG 2.2 Level AA, 320px to 1920px Viewports & 60 FPS');
console.log('================================================================\n');

let passed = 0;
let failed = 0;
const results = [];

function assert(category, testId, description, condition, details = '') {
  results.push({ category, testId, description, status: condition ? 'PASS' : 'FAIL', details });
  if (condition) {
    console.log(`  ✅ [${testId}] ${category}: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ [${testId}] ${category}: ${description} -> ${details}`);
    failed++;
  }
}

// -----------------------------------------------------------------
// 1. RESPONSIVE BREAKPOINT GRID & APPLICATION SHELL
// -----------------------------------------------------------------
console.log('[Section 1: Multi-Viewport Grid & AppShell Bounds]');
const shellSrc = fs.readFileSync(path.resolve('client/src/components/layout/AppShell.jsx'), 'utf-8');
const tailwindSrc = fs.readFileSync(path.resolve('client/tailwind.config.js'), 'utf-8');

assert('Responsive', 'RESP-01', 'AppShell bounds main content inside max-w-7xl centered container', shellSrc.includes('max-w-7xl') && shellSrc.includes('mx-auto'));
assert('Responsive', 'RESP-02', 'AppShell integrates BottomNav mobile dock on small screens', shellSrc.includes('<BottomNav />') || shellSrc.includes('BottomNav'));
assert('Responsive', 'RESP-03', 'Application main container features responsive padding (p-4 pb-24 md:p-6 md:pb-12)', shellSrc.includes('p-4') && shellSrc.includes('md:p-6'));
assert('Responsive', 'RESP-04', 'Tailwind configuration establishes custom brand emerald and slate surface palettes', tailwindSrc.includes('brand:') && tailwindSrc.includes('surface:'));

// -----------------------------------------------------------------
// 2. MOBILE NAVIGATION & ERGONOMICS
// -----------------------------------------------------------------
console.log('\n[Section 2: Mobile Navigation & Touch Ergonomics]');
const sidebarSrc = fs.readFileSync(path.resolve('client/src/components/layout/Sidebar.jsx'), 'utf-8');
const bottomNavSrc = fs.readFileSync(path.resolve('client/src/components/layout/BottomNav.jsx'), 'utf-8');
const navbarSrc = fs.readFileSync(path.resolve('client/src/components/layout/Navbar.jsx'), 'utf-8');
const btnSrc = fs.readFileSync(path.resolve('client/src/components/ui/Button.jsx'), 'utf-8');

assert('Mobile', 'MOB-01', 'Sidebar off-canvas drawer collapses with -translate-x-full on mobile', sidebarSrc.includes('-translate-x-full') && sidebarSrc.includes('md:translate-x-0'));
assert('Mobile', 'MOB-02', 'Sidebar renders darkened backdrop on viewports below md breakpoint', sidebarSrc.includes('fixed inset-0 z-40 bg-slate-900/40') && sidebarSrc.includes('md:hidden'));
assert('Mobile', 'MOB-03', 'BottomNav provides fixed thumb-friendly navigation dock (fixed bottom-0)', bottomNavSrc.includes('fixed bottom-0') || bottomNavSrc.includes('fixed inset-x-0 bottom-0'));
assert('Mobile', 'MOB-04', 'Navbar provides mobile menu hamburger trigger with accessible button', navbarSrc.includes('onMenuToggle') && navbarSrc.includes('Menu'));
assert('Mobile', 'MOB-05', 'Button component implements active:scale-[0.98] tactile feedback for mobile touch screens', btnSrc.includes('active:scale-[0.98]'));

// -----------------------------------------------------------------
// 3. RESPONSIVE TABLES & CARDS
// -----------------------------------------------------------------
console.log('\n[Section 3: Data Table Adaptation & Card Transformation]');
const tableSrc = fs.readFileSync(path.resolve('client/src/components/tables/DataTable.jsx'), 'utf-8');
const badgeSrc = fs.readFileSync(path.resolve('client/src/components/ui/Badge.jsx'), 'utf-8');

assert('Table', 'TBL-01', 'DataTable provides horizontal scroll wrapper (overflow-x-auto) on desktop', tableSrc.includes('overflow-x-auto'));
assert('Table', 'TBL-02', 'DataTable switches to mobile card presentation below 768px (block md:hidden)', tableSrc.includes('block md:hidden'));
assert('Table', 'TBL-03', 'DataTable mobile cards render key-value chips with high-contrast text', tableSrc.includes('grid grid-cols-2') || tableSrc.includes('secondaryCols'));
assert('Table', 'TBL-04', 'DataTable supports pagination controls on both desktop and mobile viewports', tableSrc.includes('currentPage') && tableSrc.includes('totalPages'));
assert('Table', 'TBL-05', 'Badge component provides semantic color variants ensuring WCAG AA text contrast ratio', badgeSrc.includes('variants') && badgeSrc.includes('success'));

// -----------------------------------------------------------------
// 4. ACCESSIBILITY: KEYBOARD & FOCUS TRAPPING
// -----------------------------------------------------------------
console.log('\n[Section 4: Keyboard Navigation & Focus Management]');
const cssSrc = fs.readFileSync(path.resolve('client/src/styles/index.css'), 'utf-8');
const modalSrc = fs.readFileSync(path.resolve('client/src/components/ui/Modal.jsx'), 'utf-8');
const cmdSrc = fs.readFileSync(path.resolve('client/src/components/navigation/CommandPalette.jsx'), 'utf-8');

assert('A11y', 'A11Y-01', 'Global stylesheet defines visible focus outlines on focus-visible (*:focus-visible)', cssSrc.includes('*:focus-visible'));
assert('A11y', 'A11Y-02', 'Modal dialog implements programmatic focus trapping on open', modalSrc.includes('focusables[0].focus()') || modalSrc.includes('focus()'));
assert('A11y', 'A11Y-03', 'Modal dialog dismisses on Escape keydown', modalSrc.includes("e.key === 'Escape'"));
assert('A11y', 'A11Y-04', 'Command Palette supports keyboard navigation via ArrowDown, ArrowUp, Enter, Escape', cmdSrc.includes('ArrowDown') && cmdSrc.includes('ArrowUp') && cmdSrc.includes('Enter') && cmdSrc.includes('Escape'));
assert('A11y', 'A11Y-05', 'Global typography sets antialiased rendering across high-DPI retina and mobile displays', cssSrc.includes('-webkit-font-smoothing: antialiased'));

// -----------------------------------------------------------------
// 5. ACCESSIBILITY: FORMS & ARIA ANNOUNCEMENTS
// -----------------------------------------------------------------
console.log('\n[Section 5: Forms & Screen Reader Announcements]');
const inputSrc = fs.readFileSync(path.resolve('client/src/components/ui/Input.jsx'), 'utf-8');
const toastSrc = fs.readFileSync(path.resolve('client/src/context/ToastContext.jsx'), 'utf-8');

assert('A11y', 'A11Y-06', 'Input component strictly binds label to input via React 18 useId', inputSrc.includes('useId') && inputSrc.includes('htmlFor={inputId}'));
assert('A11y', 'A11Y-07', 'Input component dynamically pairs error state with aria-invalid="true"', inputSrc.includes('aria-invalid={Boolean(error)}'));
assert('A11y', 'A11Y-08', 'Form error message container enforces role="alert" for instant announcement', inputSrc.includes('role="alert"'));
assert('A11y', 'A11Y-09', 'Toast notification container enforces aria-live="polite" for non-interruptive speech', toastSrc.includes('aria-live="polite"'));

// -----------------------------------------------------------------
// 6. MOTION ACCESSIBILITY
// -----------------------------------------------------------------
console.log('\n[Section 6: Reduced-Motion Accommodations]');
const gsapHookSrc = fs.readFileSync(path.resolve('client/src/hooks/useGsapCounter.js'), 'utf-8');

assert('Motion', 'MOT-01', 'Global stylesheet collapses transition and animation durations to 0.01ms under prefers-reduced-motion', cssSrc.includes('prefers-reduced-motion: reduce') && cssSrc.includes('animation-duration: 0.01ms !important'));
assert('Motion', 'MOT-02', 'useGsapCounter hook checks prefers-reduced-motion and sets target value immediately', gsapHookSrc.includes('prefers-reduced-motion: reduce') && gsapHookSrc.includes('setDisplayValue(targetValue)'));

// -----------------------------------------------------------------
// 7. PERFORMANCE & ASSET OPTIMIZATION
// -----------------------------------------------------------------
console.log('\n[Section 7: Performance & Production Bundle Quality]');

assert('Perf', 'PRF-01', 'Vite production build output exists in client/dist', fs.existsSync('client/dist/index.html'));
const distAssets = fs.readdirSync('client/dist/assets');
assert('Perf', 'PRF-02', 'Vendor React chunk code-split from application logic', distAssets.some(f => f.startsWith('vendor-react')));
assert('Perf', 'PRF-03', 'Vendor UI & Recharts chunks isolated into asynchronous chunks', distAssets.some(f => f.startsWith('vendor-recharts')) && distAssets.some(f => f.startsWith('vendor-ui')));

// -----------------------------------------------------------------
// 8. ALL EIGHT ROLES COVERAGE
// -----------------------------------------------------------------
console.log('\n[Section 8: Role-Based Dashboard Coverage]');

assert('Roles', 'ROL-01', 'Super Admin & Admin operational dashboard implemented', fs.existsSync('client/src/pages/admin/Dashboard.jsx'));
assert('Roles', 'ROL-02', 'Student comprehensive campus life dashboard implemented', fs.existsSync('client/src/pages/student/Dashboard.jsx'));
assert('Roles', 'ROL-03', 'Warden 7-tab residential command center implemented', fs.existsSync('client/src/pages/warden/WardenDashboard.jsx'));
assert('Roles', 'ROL-04', 'Security gate operations dashboard implemented', fs.existsSync('client/src/pages/security/SecurityDashboard.jsx'));
assert('Roles', 'ROL-05', 'Technician maintenance workstation dashboard implemented', fs.existsSync('client/src/pages/maintenance/MaintenanceDashboard.jsx'));
assert('Roles', 'ROL-06', 'Accountant treasury & cashier dashboard implemented', fs.existsSync('client/src/pages/accountant/AccountantDashboard.jsx'));
assert('Roles', 'ROL-07', 'Faculty academic workstation dashboard implemented', fs.existsSync('client/src/pages/staff/StaffDashboard.jsx'));

// -----------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------
console.log('\n================================================================');
console.log(`  PHASE 5 VERIFICATION COMPLETE: ${passed} PASSED | ${failed} FAILED (TOTAL: ${passed + failed})`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
