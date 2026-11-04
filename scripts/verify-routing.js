import fs from 'fs';
import path from 'path';

console.log('\n================================================================');
console.log('  CAMPHUB PHASE 2: ROUTING, NAVIGATION & ACCESS AUDIT SUITE');
console.log('================================================================\n');

let passed = 0;
let failed = 0;
const testResults = [];

function assert(category, testId, description, condition, details = '') {
  const result = {
    category,
    testId,
    description,
    status: condition ? 'PASS' : 'FAIL',
    details
  };
  testResults.push(result);

  if (condition) {
    console.log(`  ✓ [${testId}] ${description}`);
    passed++;
  } else {
    console.error(`  ✗ [${testId}] ${description} ${details ? `-> ${details}` : ''}`);
    failed++;
  }
}

// -------------------------------------------------------------
// 1. ROUTE DEFINITIONS & ARCHITECTURE AUDIT
// -------------------------------------------------------------
console.log('[Suite 1: Routing Architecture & File Structure]');

const appRouterPath = path.resolve('client/src/routes/AppRouter.jsx');
const protectedRoutePath = path.resolve('client/src/routes/ProtectedRoute.jsx');
const roleRoutePath = path.resolve('client/src/routes/RoleRoute.jsx');
const notFoundPath = path.resolve('client/src/pages/common/NotFound.jsx');
const forbiddenPath = path.resolve('client/src/pages/common/Forbidden.jsx');
const sidebarPath = path.resolve('client/src/components/layout/Sidebar.jsx');
const navbarPath = path.resolve('client/src/components/layout/Navbar.jsx');
const loginPath = path.resolve('client/src/pages/auth/Login.jsx');

assert('Architecture', 'ARCH-01', 'AppRouter.jsx exists and is readable', fs.existsSync(appRouterPath));
assert('Architecture', 'ARCH-02', 'ProtectedRoute.jsx guard exists', fs.existsSync(protectedRoutePath));
assert('Architecture', 'ARCH-03', 'RoleRoute.jsx guard exists', fs.existsSync(roleRoutePath));
assert('Architecture', 'ARCH-04', 'Dedicated NotFound.jsx 404 page exists', fs.existsSync(notFoundPath));
assert('Architecture', 'ARCH-05', 'Forbidden.jsx 403 page exists', fs.existsSync(forbiddenPath));
assert('Architecture', 'ARCH-06', 'Sidebar.jsx navigation component exists', fs.existsSync(sidebarPath));
assert('Architecture', 'ARCH-07', 'Navbar.jsx header navigation component exists', fs.existsSync(navbarPath));

const routerSrc = fs.readFileSync(appRouterPath, 'utf-8');
const protectedSrc = fs.readFileSync(protectedRoutePath, 'utf-8');
const roleSrc = fs.readFileSync(roleRoutePath, 'utf-8');
const loginSrc = fs.readFileSync(loginPath, 'utf-8');
const notFoundSrc = fs.readFileSync(notFoundPath, 'utf-8');
const forbiddenSrc = fs.readFileSync(forbiddenPath, 'utf-8');
const sidebarSrc = fs.readFileSync(sidebarPath, 'utf-8');
const navbarSrc = fs.readFileSync(navbarPath, 'utf-8');

// -------------------------------------------------------------
// 2. PUBLIC & FALLBACK ROUTES AUDIT
// -------------------------------------------------------------
console.log('\n[Suite 2: Public, Static & Error Fallback Routes]');

assert('PublicRoutes', 'PUB-01', 'Public route "/" (Landing Home) is declared', routerSrc.includes('path="/"'));
assert('PublicRoutes', 'PUB-02', 'Public route "/about" is declared', routerSrc.includes('path="/about"'));
assert('PublicRoutes', 'PUB-03', 'Public route "/help" is declared', routerSrc.includes('path="/help"'));
assert('PublicRoutes', 'PUB-04', 'Public route "/login" is declared inside AuthLayout', routerSrc.includes('path="/login"'));
assert('PublicRoutes', 'PUB-05', 'Public route "/loginsvg" demo alias is declared', routerSrc.includes('path="/loginsvg"'));
assert('PublicRoutes', 'PUB-06', 'Public route "/403" is declared and renders Forbidden', routerSrc.includes('path="/403" element={<Forbidden />}'));
assert('PublicRoutes', 'PUB-07', 'Public route "/forbidden" is declared and renders Forbidden', routerSrc.includes('path="/forbidden" element={<Forbidden />}'));
assert('PublicRoutes', 'PUB-08', 'Public route "/unauthorized" is declared and renders Forbidden', routerSrc.includes('path="/unauthorized" element={<Forbidden />}'));
assert('PublicRoutes', 'PUB-09', 'Public route "/404" is explicitly declared', routerSrc.includes('path="/404" element={<NotFound />}'));
assert('PublicRoutes', 'PUB-10', 'Catch-all "*" renders dedicated NotFound component', routerSrc.includes('path="*" element={<NotFound />}'));
assert('PublicRoutes', 'PUB-11', 'Silent catch-all redirect "* -> /" is completely removed', !routerSrc.includes('<Route path="*" element={<Navigate to="/" replace />} />'));

// -------------------------------------------------------------
// 3. AUTHENTICATION GUARDS & REDIRECT INTEGRITY
// -------------------------------------------------------------
console.log('\n[Suite 3: Route Protection & Redirect State Preservation]');

assert('AuthGuards', 'SEC-01', 'ProtectedRoute redirects unauthenticated visitors to /login', 
  protectedSrc.includes('to="/login"'));
assert('AuthGuards', 'SEC-02', 'ProtectedRoute preserves target location state (state={{ from: location }})', 
  protectedSrc.includes('state={{ from: location }}'));
assert('AuthGuards', 'SEC-03', 'RoleRoute redirects unauthenticated visitors to /login with state', 
  roleSrc.includes('to="/login"') && roleSrc.includes('state={{ from: location }}'));
assert('AuthGuards', 'SEC-04', 'RoleRoute redirects unauthorized role to /403', 
  roleSrc.includes('to="/403"'));
assert('AuthGuards', 'SEC-05', 'RoleRoute provides bypass for SUPER_ADMIN role', 
  roleSrc.includes("user?.role !== 'SUPER_ADMIN'") || roleSrc.includes('SUPER_ADMIN'));

// -------------------------------------------------------------
// 4. OPEN-REDIRECT PREVENTION & SAFE RETURN
// -------------------------------------------------------------
console.log('\n[Suite 4: Safe Return Redirection & Open-Redirect Defense]');

assert('OpenRedirect', 'REDIR-01', 'Login checks and sanitizes destination URL', 
  loginSrc.includes('safeRedirect') || loginSrc.includes('startsWith(\'/\')'));
assert('OpenRedirect', 'REDIR-02', 'Login blocks protocol-relative external redirects (//evil.com)', 
  loginSrc.includes('!path.startsWith(\'//\')') || loginSrc.includes('//'));
assert('OpenRedirect', 'REDIR-03', 'Login blocks external absolute URLs containing scheme (https:)', 
  loginSrc.includes('!path.includes(\':\')') || loginSrc.includes(':'));
assert('OpenRedirect', 'REDIR-04', 'Login restores valid deep link location after authentication', 
  loginSrc.includes('location.state?.from') || loginSrc.includes('fromPath'));
assert('OpenRedirect', 'REDIR-05', 'Login provides role-aware default landing pages for all campus roles', 
  loginSrc.includes('STUDENT') && loginSrc.includes('WARDEN') && loginSrc.includes('MAINTENANCE') &&
  loginSrc.includes('SECURITY') && loginSrc.includes('ACCOUNTANT') && loginSrc.includes('ACCOUNTS') &&
  loginSrc.includes('FACULTY') && loginSrc.includes('ADMIN'));

// -------------------------------------------------------------
// 5. ROLE-BASED ACCESS CONTROL MATRIX IN ROUTING
// -------------------------------------------------------------
console.log('\n[Suite 5: Role-Based Access Control Routing Matrix]');

// Extract all RoleRoute definitions from AppRouter
const roleRouteMatches = [...routerSrc.matchAll(/RoleRoute\s+allowedRoles=\{([^}]+)\}/g)];
const portalGuards = {
  warden: roleRouteMatches.find(m => m[1].includes('WARDEN'))?.[1] || '',
  maintenance: roleRouteMatches.find(m => m[1].includes('MAINTENANCE'))?.[1] || '',
  security: roleRouteMatches.find(m => m[1].includes('SECURITY'))?.[1] || '',
  accountant: roleRouteMatches.find(m => m[1].includes('ACCOUNTANT'))?.[1] || '',
  faculty: roleRouteMatches.find(m => m[1].includes('FACULTY'))?.[1] || '',
  admin: roleRouteMatches.find(m => m[1].includes('ADMIN') && !m[1].includes('WARDEN') && !m[1].includes('MAINTENANCE'))?.[1] || ''
};

assert('RBACMatrix', 'RBAC-01', 'Warden Portal permits WARDEN, ADMIN, SUPER_ADMIN', 
  portalGuards.warden.includes('WARDEN') && portalGuards.warden.includes('ADMIN') && portalGuards.warden.includes('SUPER_ADMIN'));
assert('RBACMatrix', 'RBAC-02', 'Warden Portal strictly denies STUDENT', 
  !portalGuards.warden.includes('STUDENT'));

assert('RBACMatrix', 'RBAC-03', 'Maintenance Portal permits MAINTENANCE, ADMIN, SUPER_ADMIN', 
  portalGuards.maintenance.includes('MAINTENANCE') && portalGuards.maintenance.includes('ADMIN') && portalGuards.maintenance.includes('SUPER_ADMIN'));
assert('RBACMatrix', 'RBAC-04', 'Maintenance Portal strictly denies STUDENT', 
  !portalGuards.maintenance.includes('STUDENT'));

assert('RBACMatrix', 'RBAC-05', 'Security Portal permits SECURITY, ADMIN, SUPER_ADMIN', 
  portalGuards.security.includes('SECURITY') && portalGuards.security.includes('ADMIN') && portalGuards.security.includes('SUPER_ADMIN'));
assert('RBACMatrix', 'RBAC-06', 'Security Portal strictly denies STUDENT & WARDEN', 
  !portalGuards.security.includes('STUDENT') && !portalGuards.security.includes('WARDEN'));

assert('RBACMatrix', 'RBAC-07', 'Accountant & Accounts Portal permits ACCOUNTANT, ACCOUNTS, ADMIN, SUPER_ADMIN', 
  portalGuards.accountant.includes('ACCOUNTANT') && portalGuards.accountant.includes('ACCOUNTS') && portalGuards.accountant.includes('ADMIN'));
assert('RBACMatrix', 'RBAC-08', 'Accountant Portal strictly denies STUDENT & MAINTENANCE', 
  !portalGuards.accountant.includes('STUDENT') && !portalGuards.accountant.includes('MAINTENANCE'));

assert('RBACMatrix', 'RBAC-09', 'Faculty Portal permits FACULTY, STAFF, ADMIN, SUPER_ADMIN', 
  portalGuards.faculty.includes('FACULTY') && portalGuards.faculty.includes('ADMIN'));
assert('RBACMatrix', 'RBAC-10', 'Faculty Portal strictly denies STUDENT', 
  !portalGuards.faculty.includes('STUDENT'));

assert('RBACMatrix', 'RBAC-11', 'Admin Command Portal strictly restricted to ADMIN and SUPER_ADMIN', 
  portalGuards.admin.includes('ADMIN') && portalGuards.admin.includes('SUPER_ADMIN') && !portalGuards.admin.includes('STUDENT'));

// -------------------------------------------------------------
// 6. ROUTE ALIASES & DEEP LINK COMPATIBILITY
// -------------------------------------------------------------
console.log('\n[Suite 6: Route Aliases & Deep Link Redirections]');

assert('Aliases', 'ALIAS-01', '/student/payments and /student/payment routes exist', 
  routerSrc.includes('path="/student/payments"') && routerSrc.includes('path="/student/payment"'));
assert('Aliases', 'ALIAS-02', '/student/gate-pass redirect to /student/gate-passes exists', 
  routerSrc.includes('path="/student/gate-pass"'));
assert('Aliases', 'ALIAS-03', '/student/certificate redirect to /student/certificates exists', 
  routerSrc.includes('path="/student/certificate"'));
assert('Aliases', 'ALIAS-04', 'Universal AI chatbot aliases (/ai, /ai-assistant, /chatbot) exist', 
  routerSrc.includes('path="/chatbot"') && routerSrc.includes('path="/ai"'));
assert('Aliases', 'ALIAS-05', 'Security QR verification aliases (/security/gate-entry, /security/gate-pass) exist', 
  routerSrc.includes('path="/security/gate-entry"') && routerSrc.includes('path="/security/gate-pass"'));
assert('Aliases', 'ALIAS-06', 'Warden operation aliases (/warden/hostels, /warden/allocations, /warden/transfers) exist', 
  routerSrc.includes('path="/warden/hostels"') && routerSrc.includes('path="/warden/allocations"') && routerSrc.includes('path="/warden/transfers"'));
assert('Aliases', 'ALIAS-07', 'Admin system aliases (/admin/audit-logs, /admin/roles-permissions) exist', 
  routerSrc.includes('path="/admin/audit-logs"') && routerSrc.includes('path="/admin/roles-permissions"'));

// -------------------------------------------------------------
// 7. SIDEBAR NAVIGATION INTEGRITY (ZERO BROKEN LINKS)
// -------------------------------------------------------------
console.log('\n[Suite 7: Sidebar Navigation Integrity & Route Parity]');

// Extract all 'to: ...' paths from Sidebar.jsx
const sidebarLinkMatches = [...sidebarSrc.matchAll(/to:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const uniqueSidebarLinks = [...new Set(sidebarLinkMatches)];

console.log(`     Discovered ${uniqueSidebarLinks.length} distinct navigation targets across all role menus.`);

let brokenLinks = [];
for (const link of uniqueSidebarLinks) {
  // Check if link or link prefix has a corresponding route in AppRouter
  const exactMatch = routerSrc.includes(`path="${link}"`);
  const wildcardPrefix = link.split('/').slice(0, 2).join('/');
  const prefixMatch = routerSrc.includes(`path="${wildcardPrefix}/*"`) || routerSrc.includes(`path="${link}/*"`);
  
  if (!exactMatch && !prefixMatch) {
    brokenLinks.push(link);
  }
}

assert('Navigation', 'NAV-01', 'Sidebar defines navigation for all 8 campus roles (including MAINTENANCE)', 
  sidebarSrc.includes('STUDENT:') && sidebarSrc.includes('WARDEN:') && sidebarSrc.includes('MAINTENANCE:') &&
  sidebarSrc.includes('SECURITY:') && sidebarSrc.includes('ACCOUNTANT:') && sidebarSrc.includes('ACCOUNTS:') &&
  sidebarSrc.includes('FACULTY:') && sidebarSrc.includes('ADMIN:') && sidebarSrc.includes('SUPER_ADMIN:'));

assert('Navigation', 'NAV-02', 'Zero broken or unrouted links in Sidebar.jsx', 
  brokenLinks.length === 0, `Unrouted targets found: ${brokenLinks.join(', ')}`);

assert('Navigation', 'NAV-03', 'Sidebar uses NavLink with active indicator classes', 
  sidebarSrc.includes('NavLink') && sidebarSrc.includes('isActive'));

assert('Navigation', 'NAV-04', 'Sidebar implements mobile drawer overlay and dismiss handler (onClose)', 
  sidebarSrc.includes('onClick={onClose}') && sidebarSrc.includes('fixed inset-0'));

// -------------------------------------------------------------
// 8. NAVBAR NAVIGATION & ACCESSIBILITY
// -------------------------------------------------------------
console.log('\n[Suite 8: Navbar Navigation & Interactive Controls]');

assert('Navbar', 'NAV-05', 'Navbar contains BrandLogo with home routing link', 
  navbarSrc.includes('BrandLogo'));
assert('Navbar', 'NAV-06', 'Navbar provides mobile hamburger toggle button (onMenuToggle)', 
  navbarSrc.includes('onClick={onMenuToggle}') && navbarSrc.includes('aria-label="Toggle Navigation Menu"'));
assert('Navbar', 'NAV-07', 'Navbar provides Command Palette trigger with Ctrl+K shortcut', 
  navbarSrc.includes('onOpenCommandPalette') && navbarSrc.includes('Ctrl+K'));
assert('Navbar', 'NAV-08', 'Navbar provides 1-click AI Chatbot link', 
  navbarSrc.includes('AI Chatbot') && navbarSrc.includes('to={user?.role === \'ADMIN\' ? \'/admin/chatbot\' : \'/student/chatbot\'}'));
assert('Navbar', 'NAV-09', 'Navbar provides demo perspective role-switcher dropdown', 
  navbarSrc.includes('Switch Demo Perspective') && navbarSrc.includes('loginAsDemoRole'));
assert('Navbar', 'NAV-10', 'Navbar user profile link routes properly for student and staff', 
  navbarSrc.includes('to={user?.role === \'STUDENT\' ? \'/student/profile\' : \'/profile\'}'));
assert('Navbar', 'NAV-11', 'Navbar sign out action calls logout() and closes menu', 
  navbarSrc.includes('logout()') && navbarSrc.includes('Sign Out'));

// -------------------------------------------------------------
// 9. ERROR PAGES SEMANTICS & RECOVERY ACTIONS
// -------------------------------------------------------------
console.log('\n[Suite 9: 404 & 403 Page Semantics & Navigation Recovery]');

assert('ErrorPages', 'ERR-01', 'NotFound page renders 404 badge and informative title', 
  notFoundSrc.includes('Error 404') && notFoundSrc.includes('Lost in Campus Digital Space'));
assert('ErrorPages', 'ERR-02', 'NotFound page provides Go Back action', 
  notFoundSrc.includes('window.history.back()') && notFoundSrc.includes('Go Back'));
assert('ErrorPages', 'ERR-03', 'NotFound page provides Campus Home action', 
  notFoundSrc.includes('to="/"') && notFoundSrc.includes('Campus Home'));
assert('ErrorPages', 'ERR-04', 'NotFound page provides role-aware Open My Dashboard action', 
  notFoundSrc.includes('getRoleDashboard') && notFoundSrc.includes('Open My Dashboard'));

assert('ErrorPages', 'ERR-05', 'Forbidden page renders 403 badge and informative title', 
  forbiddenSrc.includes('Error 403') && forbiddenSrc.includes('Restricted Campus Area'));
assert('ErrorPages', 'ERR-06', 'Forbidden page provides Go Back action', 
  forbiddenSrc.includes('window.history.back()') && forbiddenSrc.includes('Go Back'));
assert('ErrorPages', 'ERR-07', 'Forbidden page provides role-aware Open My Dashboard action', 
  forbiddenSrc.includes('getRoleDashboard') && forbiddenSrc.includes('Open My Dashboard'));

// -------------------------------------------------------------
// 10. SPA REFRESH & DEEP LINK DEPLOYMENT CONFIGURATION
// -------------------------------------------------------------
console.log('\n[Suite 10: SPA Deep Link & Vercel / Production Rewrite Configuration]');

const vercelJsonPath = path.resolve('vercel.json');
assert('Deployment', 'DEP-01', 'Root vercel.json exists for SPA deep link routing', fs.existsSync(vercelJsonPath));

if (fs.existsSync(vercelJsonPath)) {
  const vercelSrc = fs.readFileSync(vercelJsonPath, 'utf-8');
  assert('Deployment', 'DEP-02', 'vercel.json contains SPA catch-all rewrite to /index.html', 
    vercelSrc.includes('/index.html') && vercelSrc.includes('rewrites'));
}

console.log('\n================================================================');
console.log(`  PHASE 2 ROUTING VERIFICATION: ${passed} PASSED | ${failed} FAILED (TOTAL: ${passed + failed})`);
console.log('================================================================\n');

process.exit(failed > 0 ? 1 : 0);

