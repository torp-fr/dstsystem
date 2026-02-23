/**
 * Build-Time Planning Invariant Checker
 *
 * Scans codebase for violations of Planning architectural rules:
 * ❌ No direct supabase.from() in UI layer
 * ❌ No createClient() outside infra/
 * ❌ No window.SupabaseAdapter usage
 *
 * Runs as pre-build hook to catch violations early
 *
 * Usage:
 *   node scripts/check-planning-violations.js
 *
 * Exit codes:
 *   0 = All clear
 *   1 = Violations found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../src');

/**
 * Forbidden patterns and their locations
 */
const RULES = [
  {
    pattern: 'supabase.from(',
    forbidden_in: ['pages/', 'components/'],
    allowed_in: ['infra/', 'domain/'],
    reason: 'Direct Supabase queries must go through planning domain',
  },
  {
    pattern: 'createClient(',
    forbidden_in: ['pages/', 'components/', 'services/'],
    allowed_in: ['infra/supabase.adapter.ts'],
    reason: 'Client instantiation must be in infra/supabase.adapter.ts only',
  },
  {
    pattern: 'window.SupabaseAdapter',
    forbidden_in: ['pages/', 'components/', 'services/'],
    allowed_in: [],
    reason: 'Global adapter access forbidden — use bridge service',
  },
  {
    pattern: 'new SupabaseClient',
    forbidden_in: ['pages/', 'components/', 'services/', 'domain/'],
    allowed_in: ['infra/supabase.adapter.ts'],
    reason: 'Client instantiation must be in infra/supabase.adapter.ts only',
  },
];

let violations_found = 0;

/**
 * Recursively scan directory for violations
 */
function scanDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        checkFile(fullPath);
      }
    });
  } catch (error) {
    console.error(`[ERROR] Failed to scan directory ${dir}:`, error.message);
    process.exit(1);
  }
}

/**
 * Check single file for violations
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(ROOT, filePath);

    RULES.forEach((rule) => {
      if (!content.includes(rule.pattern)) {
        return; // Pattern not in file
      }

      // Check if file location is forbidden
      const isForbidden = rule.forbidden_in.some((loc) => relativePath.includes(loc));
      const isAllowed = rule.allowed_in.length === 0 || rule.allowed_in.some((loc) => relativePath.includes(loc));

      if (isForbidden && !isAllowed) {
        console.error(
          `[⛔ PLANNING HARD LOCK VIOLATION]\n` +
          `  File: ${relativePath}\n` +
          `  Pattern: ${rule.pattern}\n` +
          `  Reason: ${rule.reason}\n` +
          `  Allowed locations: ${rule.allowed_in.length > 0 ? rule.allowed_in.join(', ') : 'NONE'}\n`
        );
        violations_found++;
      }
    });
  } catch (error) {
    console.error(`[ERROR] Failed to read file ${filePath}:`, error.message);
    process.exit(1);
  }
}

/**
 * Main execution
 */
console.log('[Planning Invariant Guard] Scanning codebase...');
console.log(`Root directory: ${ROOT}\n`);

scanDirectory(ROOT);

if (violations_found === 0) {
  console.log('✓ Planning invariant respected — No violations found\n');
  process.exit(0);
} else {
  console.error(`\n✗ Found ${violations_found} violation(s)\n`);
  console.error('Planning architecture locked. Fix violations before proceeding.');
  console.error('Single source rule: Components → planningBridge → planningState → supabase.adapter\n');
  process.exit(1);
}
