import fs from 'fs';
import path from 'path';

const SRC_DIR = 'd:\\DEBA IBST\\client\\src';

const HOOKS = [
  'useState',
  'useEffect',
  'useContext',
  'useReducer',
  'useCallback',
  'useMemo',
  'useRef',
  'useImperativeHandle',
  'useLayoutEffect',
  'useId'
];

function getAllFiles(dir, exts = ['.jsx', '.js']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getAllFiles(SRC_DIR);
console.log(`Scanning ${files.length} client files for missing React hook imports...\n`);

const issues = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check each hook
  for (const hook of HOOKS) {
    // Regex to match hook called directly as an identifier (e.g. `useEffect(`) not `React.useEffect(`
    const hookUsageRegex = new RegExp(`(?<![.\\w])${hook}\\s*\\(`, 'g');
    
    if (hookUsageRegex.test(content)) {
      // It is used directly. Check if it is imported from 'react' or defined
      // Check import from 'react'
      const reactImportMatch = content.match(/import\s+(?:(?:\*\s+as\s+\w+)|(?:\{([^}]+)\})|(?:\w+))\s*(?:,\s*\{([^}]+)\})?\s*from\s*['"]react['"]/);
      
      let isImported = false;
      if (reactImportMatch) {
        const namedImports = (reactImportMatch[1] || '') + ',' + (reactImportMatch[2] || '');
        if (namedImports.includes(hook)) {
          isImported = true;
        }
      }
      
      // Also check if destructured from React: const { useEffect } = React;
      const destructureRegex = new RegExp(`const\\s*\\{[^}]*\\b${hook}\\b[^}]*\\}\\s*=\\s*React`);
      if (destructureRegex.test(content)) {
        isImported = true;
      }

      if (!isImported) {
        issues.push({
          file: path.relative('d:\\DEBA IBST', file),
          hook
        });
      }
    }
  }
}

if (issues.length === 0) {
  console.log('✓ All React hook usages are correctly imported!');
} else {
  console.log(`Found ${issues.length} potential missing hook import(s):`);
  issues.forEach(iss => console.log(`  - File: ${iss.file} | Missing hook: ${iss.hook}`));
}
