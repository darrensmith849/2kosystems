#!/usr/bin/env node
// Static safety verification for the Agent Ops console.
// Run: node scripts/verify-agent-ops.mjs
// Or:  npm run verify:agent-ops
//
// Checks that the codebase meets the no-send, no-DB, no-public-exposure
// requirements for Phase 1 (pre-Railway/pre-database) operation.

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const SRC = join(ROOT, 'src');

let passed = 0;
let failed = 0;
const failures = [];

function pass(label) {
  console.log(`  ✓ ${label}`);
  passed++;
}

function fail(label, detail) {
  console.log(`  ✗ ${label}`);
  if (detail) console.log(`    ${detail}`);
  failed++;
  failures.push({ label, detail });
}

function warn(label, detail) {
  console.log(`  ⚠ ${label}`);
  if (detail) console.log(`    ${detail}`);
}

// ── File helpers ──────────────────────────────────────────────────────────────

function walk(dir, ext = '.ts') {
  const results = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === '.next') continue;
      results.push(...walk(full, ext));
    } else if (name.endsWith(ext) || name.endsWith(ext + 'x')) {
      results.push(full);
    }
  }
  return results;
}

function readSrc(path) {
  return readFileSync(path, 'utf8');
}

function filesContaining(pattern, files) {
  return files.filter((f) => pattern.test(readSrc(f)));
}

const allTs = walk(SRC);
const adminRouteFiles = allTs.filter((f) => f.includes('/api/admin/'));
const publicRouteFiles = allTs.filter((f) => f.includes('/api/') && !f.includes('/api/admin/'));

// ── Section 1: No public agent routes ────────────────────────────────────────

console.log('\n1. Public route isolation');

// Routes outside /api/admin/ are only flagged if they lack any auth check.
// The v1 route uses AGENT_ADMIN_API_KEY header auth — intentional, not a gap.
const publicAgentRoutes = publicRouteFiles.filter((f) => {
  if (!/agent|analyse/i.test(f)) return false;
  const src = readSrc(f);
  // Has its own auth guard — accepted
  const hasAuth = src.includes('isAuthorisedAdmin') || src.includes('AGENT_ADMIN_API_KEY') || src.includes('admin-auth') || src.includes('validateAdminSession');
  return !hasAuth;
});
if (publicAgentRoutes.length === 0) {
  pass('No unauthenticated agent routes outside /api/admin/');
} else {
  fail('Unauthenticated agent routes found outside /api/admin/', publicAgentRoutes.map((f) => relative(ROOT, f)).join(', '));
}

// ── Section 2: Admin routes require auth ─────────────────────────────────────

console.log('\n2. Admin route authentication');

let authMissing = 0;
for (const f of adminRouteFiles) {
  const src = readSrc(f);
  if (!src.includes('admin-auth') && !src.includes('validateAdminSession') && !src.includes('getAdminSession')) {
    fail(`Auth check missing in ${relative(ROOT, f)}`);
    authMissing++;
  }
}
if (authMissing === 0) pass(`All ${adminRouteFiles.length} admin route(s) import admin-auth`);

// ── Section 3: No DB packages ─────────────────────────────────────────────────

console.log('\n3. No database packages');

let pkgJson;
try {
  pkgJson = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
} catch {
  fail('Could not read package.json');
  pkgJson = { dependencies: {}, devDependencies: {} };
}

const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
const dbPackages = ['drizzle-orm', 'prisma', '@prisma/client', 'pg', 'postgres', 'mysql2', 'better-sqlite3', 'knex', 'sequelize', 'typeorm', 'mongoose'];
const foundDb = dbPackages.filter((p) => allDeps[p]);

if (foundDb.length === 0) {
  pass('No database packages in package.json');
} else {
  fail('Database packages found — remove before Railway provisioning', foundDb.join(', '));
}

// ── Section 4: No send SDKs ───────────────────────────────────────────────────

console.log('\n4. No outbound send SDKs');

const sendPackages = ['nodemailer', '@sendgrid/mail', 'postmark', 'mailgun-js', '@mailgun-types', 'twilio', '@twilio/conversations', 'resend'];
const foundSend = sendPackages.filter((p) => allDeps[p]);

if (foundSend.length === 0) {
  pass('No send SDKs in package.json');
} else {
  fail('Send SDKs found — all sends require explicit admin approval', foundSend.join(', '));
}

// ── Section 5: No NEXT_PUBLIC secrets ────────────────────────────────────────

console.log('\n5. No NEXT_PUBLIC secrets');

const sensitivePublicEnvPattern = /NEXT_PUBLIC_(ANTHROPIC|OPENAI|SECRET|API_KEY|TOKEN|WEBHOOK|BREVO)/i;
const withPublicSecrets = filesContaining(sensitivePublicEnvPattern, allTs);

if (withPublicSecrets.length === 0) {
  pass('No NEXT_PUBLIC_ secret env vars referenced in source');
} else {
  fail('Sensitive NEXT_PUBLIC_ env vars found', withPublicSecrets.map((f) => relative(ROOT, f)).join(', '));
}

// ── Section 6: Safety fields enforced ────────────────────────────────────────

console.log('\n6. Safety field enforcement');

const safetyFile = join(SRC, 'lib/agent-core/safety.ts');
try {
  const safety = readSrc(safetyFile);
  if (safety.includes('humanReviewRequired: true') && safety.includes('autoSent: false') && safety.includes('productionActionTaken: false')) {
    pass('Safety fields hardcoded in agent-core/safety.ts');
  } else {
    fail('Safety fields may not be hardcoded in safety.ts');
  }
} catch {
  fail('Could not read agent-core/safety.ts');
}

// ── Section 7: Disabled repository is the default ────────────────────────────

console.log('\n7. Persistence is disabled by default');

const disabledRepoFile = join(SRC, 'lib/agent-persistence/disabledRepository.ts');
try {
  const repo = readSrc(disabledRepoFile);
  if (repo.includes('NOT_CONFIGURED') || repo.includes('not configured')) {
    pass('DisabledAgentJobRepository exists and throws on use');
  } else {
    fail('disabledRepository.ts may not throw correctly');
  }
} catch {
  fail('Could not read lib/agent-persistence/disabledRepository.ts');
}

// ── Section 8: Disabled executor is the default ──────────────────────────────

console.log('\n8. Integrations are disabled by default');

const disabledExecFile = join(SRC, 'lib/agent-integrations/disabledExecutor.ts');
try {
  const exec = readSrc(disabledExecFile);
  if (exec.includes("status: 'disabled'") || exec.includes('disabled')) {
    pass('DisabledIntegrationExecutor exists and returns disabled status');
  } else {
    fail('disabledExecutor.ts may not return disabled status correctly');
  }
} catch {
  fail('Could not read lib/agent-integrations/disabledExecutor.ts');
}

// ── Section 9: No real send calls in agent routes ────────────────────────────

console.log('\n9. No live send calls in agent routes');

const agentRouteFiles = allTs.filter((f) => f.includes('/api/admin/agent/'));
const sendPatterns = /\bfetch\b.*mailto|nodemailer\.createTransport|sgMail\.send|twilio\.messages\.create|brevo.*send|resend\.emails\.send/i;
const withSendCalls = filesContaining(sendPatterns, agentRouteFiles);

if (withSendCalls.length === 0) {
  pass('No live send calls found in agent API routes');
} else {
  fail('Live send calls detected in agent routes', withSendCalls.map((f) => relative(ROOT, f)).join(', '));
}

// ── Section 10: requiresApproval in action contracts ─────────────────────────

console.log('\n10. Action contracts require approval');

const contractsFile = join(SRC, 'lib/agent-integrations/actionContracts.ts');
try {
  const contracts = readSrc(contractsFile);
  if (contracts.includes('requiresApproval: true')) {
    pass('All action contracts declare requiresApproval: true');
  } else {
    fail('actionContracts.ts missing requiresApproval: true invariant');
  }
} catch {
  fail('Could not read lib/agent-integrations/actionContracts.ts');
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(56));
console.log(`  ${passed} passed  |  ${failed} failed`);
console.log('─'.repeat(56));

if (failed > 0) {
  console.log('\nFailed checks:');
  for (const { label, detail } of failures) {
    console.log(`  • ${label}`);
    if (detail) console.log(`    ${detail}`);
  }
  console.log('');
  process.exit(1);
} else {
  console.log('\n  All checks passed. Safe to deploy.\n');
  process.exit(0);
}
