#!/usr/bin/env node
/**
 * Проверка перед публикацией: ищет неподтверждённые заполнители в конфигурации.
 * Запускается в GitHub Actions перед сборкой — сайт с заполнителями не опубликуется.
 * Локально: npm run check:launch
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(root + p, 'utf8');

const siteTs = read('src/config/site.ts');
const pricingTs = read('src/config/pricing.ts');
const problems = [];

// Отложены владельцем: данные оператора (legal) — заполняются вместе с приёмом заявок.
const deferred = new Set(['operatorName', 'operatorStatus', 'policyDate']);

for (const m of siteTs.matchAll(/(\w+):\s*\{\s*value:\s*'([^']*)',\s*confirmed:\s*false\s*\}/g)) {
  if (deferred.has(m[1])) continue;
  problems.push(`src/config/site.ts → ${m[1]} («${m[2]}») не подтверждено`);
}
// forms.formspreeId: приём заявок отложен владельцем, пустой ID не блокирует запуск —
// форма на сайте честно показывает, что не подключена, и предлагает написать напрямую.
if (/portfolioConfirmed:\s*false/.test(siteTs)) problems.push('src/config/site.ts → portfolioConfirmed: false');
if (/pricingConfirmed\s*=\s*false/.test(pricingTs)) problems.push('src/config/pricing.ts → pricingConfirmed = false: цены предварительные');

if (problems.length) {
  console.error('\nСайт ещё не готов к публикации:\n');
  for (const p of problems) console.error('  • ' + p);
  console.error('\nПодтвердите данные (confirmed: true) и запустите проверку снова.\n');
  process.exit(1);
}
console.log('Проверка перед запуском пройдена: все данные подтверждены.');
