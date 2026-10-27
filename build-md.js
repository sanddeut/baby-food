// plan.js 일정을 03_이유식달력.md (일차 기준 표)로 출력. 사용: node build-md.js
const fs = require('fs');
const P = require('./plan.js');

const md = (s) => s.replace(/★([^ +]+)/g, '**$1**');
const out = [
  '# 3. 6~10개월 이유식 달력 (일차 기준)',
  '',
  '> 실제 날짜로 보려면 `index.html`에서 시작일 선택. 이 표는 D1 = 이유식 시작일 기준.',
  '> **굵은 글씨** = 테스트 중인 새 재료(1회차에만), ⚠ = 고위험 알레르기 식품, ▶ = 질감·횟수 바뀌는 날',
  '',
];
for (let m = 6; m <= 10; m++) {
  const days = P.plan().filter((p) => p.month === m);
  const f = days[0];
  out.push(`## ${m}개월 (D${f.d}~D${days[days.length - 1].d}) · ${f.stage}`, '');
  out.push(`- 고기 하루 ${f.meat} · 수유 하루 ${f.milk}`, '');
  out.push('| 일차 | 질감 | 횟수 × 1회 양 | 1회차(오전) | 2회차 | 3회차 | 간식 | 알레르기 테스트 |');
  out.push('|---|---|---|---|---|---|---|---|');
  for (const p of days) {
    const t = p.test;
    const test = t ? `${t.risky ? '⚠' : ''}${t.name} ${t.dayIndex}/3${t.dayIndex === 1 ? ` (${t.prep})` : ''}` : '복습';
    out.push(`| D${p.d} | ${p.texture}${p.transition ? ' ▶' : ''} | ${p.meals.length}회 × ${p.amount} | ${md(p.meals[0])} | ${md(p.meals[1] || '')} | ${md(p.meals[2] || '')} | ${p.snack} | ${test} |`);
  }
  const trs = days.filter((p) => p.transition);
  if (trs.length) { out.push(''); trs.forEach((p) => out.push(`- ▶ D${p.d}: ${p.transition}`)); }
  out.push('');
}
fs.writeFileSync(__dirname + '/03_이유식달력.md', out.join('\n'));
console.log('wrote 03_이유식달력.md');
