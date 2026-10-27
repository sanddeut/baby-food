// 6~10개월(150일) 이유식 일정 생성기. D1 = 이유식 시작일.
// 브라우저에서는 window.BabyFoodPlan, Node에서는 module.exports 로 사용.
//
// 알레르기 테스트 기준 (보수적 적용)
// - 질병관리청: 한 번에 한 가지, 새 음식 시작 후 약 3~7일 관찰
// - 일반 재료 3일, 고위험 알레르기 식품 5일 (소량에서 2배씩 늘림)
// - 고위험 식품끼리 연달아 두지 않음 (사이에 일반 재료 1가지)
// - 고위험 테스트 기간에는 질감·횟수 변경 없음
// - 시기는 늦추지 않음 (알레르기 우려로 미리 제한하는 것은 권장되지 않음)
// - 통과한 고위험 식품은 주 2회 이상 계속 먹임 (내성 유지)
(function (root) {
  // [cat, 이름, 고위험 여부, 손질·양]  cat: g 곡물, p 단백질, v 채소, f 과일, d 유제품, a 견과·씨앗, - 복습
  const BLOCKS = [
    ['g', '쌀', 0, '불린 쌀 또는 쌀가루로 10배죽 미음'],
    ['p', '소고기', 0, '안심·홍두깨 삶아 곱게 갈아 체에 거름, 첫날 5g → 10g'],
    ['v', '애호박', 0],
    ['v', '브로콜리', 0, '꽃 부분만 익혀서 곱게 갈기'],
    ['v', '감자', 0],
    ['v', '단호박', 0],
    ['v', '양배추', 0, '잎 부분만 익혀서 곱게 갈기'],
    ['v', '청경채', 0, '잎 부분만 익혀서 곱게 갈기'],
    ['v', '고구마', 0],
    ['g', '오트밀', 0, '곱게 간 오트밀을 쌀과 섞어 죽'],
    ['p', '닭고기', 0, '안심, 삶아서 곱게 다짐, 10g'],
    ['p', '달걀노른자', 1, '완숙(10분 이상 삶은) 노른자. 1일차 ¼작은술 → 2배씩 → 5일차 노른자 ½개'],
    ['v', '무', 0],
    ['v', '당근', 0],
    ['p', '두부', 1, '데쳐서 으깸. 1일차 1작은술(약 3g) → 2배씩 → 5일차 15g'],
    ['v', '시금치', 0, '잎만 데쳐서 다짐'],
    ['f', '사과', 0, '익혀서 갈아 1~2작은술, 식후'],
    ['p', '대구살', 1, '흰살생선, 가시 제거 후 푹 쪄서 다짐. 1일차 1작은술 → 2배씩 → 5일차 15g'],
    ['v', '배추', 0, '잎 부분만 데쳐서 다짐'],
    ['p', '달걀흰자', 1, '완숙 흰자만. 1일차 ¼작은술 → 2배씩 → 5일차 흰자 ½개 (통과 시 완숙 전란 사용)'],
    ['v', '양파', 0],
    ['g', '밀', 1, '아기국수를 잘게 잘라 푹 익힘. 1일차 1작은술 → 2배씩 → 5일차 국수 10g'],
    ['f', '바나나', 0, '으깨서 1~2작은술, 식후'],
    ['d', '요거트', 1, '무가당 플레인 요거트, 식후. 1일차 1작은술 → 2배씩 → 5일차 2~3숟가락'],
    ['v', '표고버섯', 0, '기둥 떼고 다짐'],
    ['d', '아기치즈', 0, '요거트로 우유 단백질 통과 후 진행. 아기치즈 ¼장을 죽에 녹임'],
    ['a', '땅콩', 1, '무첨가 100% 땅콩버터를 따뜻한 물에 묽게 풀어 죽에 섞음 (통땅콩·덩어리 금지). 1일차 ⅛작은술 → 2배씩 → 5일차 1작은술'],
    ['p', '돼지고기', 0, '안심, 삶아서 다짐, 10g'],
    ['p', '연어', 1, '푹 익혀서 가시 제거 후 다짐. 1일차 1작은술 → 2배씩 → 5일차 15g'],
    ['v', '파프리카', 0, '껍질 벗겨 익혀서 다짐'],
    ['p', '새우', 1, '푹 익혀서 곱게 다짐. 1일차 ¼작은술 → 2배씩 → 5일차 10g'],
    ['f', '아보카도', 0, '잘 익은 것 으깨서, 식후'],
    ['a', '호두', 1, '곱게 간 호두 가루를 죽에 섞음 (조각 금지). 1일차 ⅛작은술 → 2배씩 → 5일차 1작은술'],
    ['v', '토마토', 0, '껍질·씨 제거 후 익힘'],
    ['a', '참깨', 1, '곱게 빻은 깨를 죽에 섞음. 1일차 ⅛작은술 → 2배씩 → 5일차 1작은술'],
    ['f', '블루베리', 0, '반드시 으깨서 (통째 질식 위험), 식후'],
    ['g', '현미', 0, '곱게 간 현미를 쌀과 섞어 죽'],
    ['p', '게살', 1, '익힌 게살(맛살 아님) 곱게 다짐. 새우 통과 후 진행. 1일차 ¼작은술 → 2배씩 → 5일차 10g'],
    ['v', '미역', 0, '불려서 잘게 다짐'],
    ['a', '아몬드', 1, '곱게 간 아몬드 가루를 죽에 섞음. 1일차 ⅛작은술 → 2배씩 → 5일차 1작은술'],
    ['v', '콩나물', 0, '머리·꼬리 떼고 잘게 다짐'],
    ['-', '복습', 0, '새 재료 없음. 통과한 재료 조합 연습'],
  ];
  const DAYS = 150;
  const RISKY_DAYS = 5;
  const NORMAL_DAYS = 3;

  // 블록별 시작일·기간 (마지막 복습 블록은 남은 날 전부)
  const SPANS = [];
  (function () {
    let s = 1;
    BLOCKS.forEach((b, i) => {
      const len = i === BLOCKS.length - 1 ? DAYS - s + 1 : b[2] ? RISKY_DAYS : NORMAL_DAYS;
      SPANS.push({ start: s, len });
      s += len;
    });
  })();
  function blockOf(d) {
    for (let i = SPANS.length - 1; i >= 0; i--) if (d >= SPANS[i].start) return i;
    return 0;
  }

  // 질감·횟수 변경일: 목표일에서 시작해, 새 재료 첫날이거나 고위험 테스트 기간이면 뒤로 미룸
  function safeDay(target) {
    for (let d = target; d <= DAYS; d++) {
      const b = blockOf(d);
      if (SPANS[b].start !== d && !BLOCKS[b][2]) return d;
    }
    return target;
  }
  const T = {
    eight: safeDay(15),
    twoMeals: safeDay(22),
    mid: safeDay(32),
    five: safeDay(62),
    late: safeDay(92),
    three: safeDay(122),
    jin: safeDay(137),
  };
  const TRANSITIONS = {
    [T.eight]: '8배죽으로 전환 (1회 30~50g 거부 없이 먹으면)',
    [T.twoMeals]: '하루 2회로 늘림 (2회차는 통과한 재료만)',
    [T.mid]: '중기 시작: 6배죽 (전환 기준 충족 시, 미충족이면 8배죽 1주 더)',
    [T.five]: '5배죽으로 전환 (6배죽 알갱이 구역질 없으면)',
    [T.late]: '후기 시작: 4배죽·하루 3회·간식 1회 (전환 기준 충족 시)',
    [T.three]: '3배죽으로 전환',
    [T.jin]: '진밥으로 전환 (3배죽 잘 먹으면)',
  };

  const DEFAULT_PREP = {
    v: '익혀서 곱게 갈기(중기 이후 다지기), 첫날 1작은술부터',
    f: '익히거나 갈아서 1~2작은술, 식후',
    g: '쌀과 섞어 죽',
    p: '익혀서 다짐, 10g',
  };

  function phase(d) {
    const month = 6 + Math.floor((d - 1) / 30);
    let p;
    if (d < T.eight) p = { stage: '초기', texture: '10배죽', meals: 1, amount: d <= 3 ? '10~20g (1~2숟가락)' : d <= 7 ? '20~30g' : '30~50g' };
    else if (d < T.twoMeals) p = { stage: '초기', texture: '8배죽', meals: 1, amount: '50~60g' };
    else if (d < T.mid) p = { stage: '초기', texture: '8배죽', meals: 2, amount: '50~80g' };
    else if (d < T.five) p = { stage: '중기', texture: '6배죽', meals: 2, amount: d <= 45 ? '70~90g' : '80~100g' };
    else if (d < T.late) p = { stage: '중기', texture: '5배죽', meals: 2, amount: '100~120g' };
    else if (d < T.three) p = { stage: '후기', texture: '4배죽', meals: 3, amount: d <= 105 ? '100~120g' : '120g' };
    else if (d < T.jin) p = { stage: '후기', texture: '3배죽', meals: 3, amount: '120~150g' };
    else p = { stage: '후기', texture: '진밥', meals: 3, amount: '120~150g' };
    p.month = month;
    p.snack = d >= T.three ? '1~2회' : d >= T.late ? '1회' : '';
    p.meat = month === 6 ? '10~20g' : month <= 8 ? '20~30g' : '30~40g';
    p.milk = month === 6 ? '700~900ml' : month <= 8 ? '600~800ml' : '500~700ml';
    p.transition = TRANSITIONS[d] || '';
    return p;
  }

  function rot(list, start, n) {
    if (!list.length) return [];
    const out = [];
    for (let i = 0; out.length < Math.min(n, list.length); i++) {
      const x = list[(start + i) % list.length];
      if (!out.includes(x)) out.push(x);
    }
    return out;
  }

  // 통과한 고위험 식품 → 유지용 이름 (노른자·흰자 → 달걀, 요거트 → 요거트·치즈 중 하나)
  function keepName(name, eggOk) {
    if (name === '달걀노른자') return eggOk ? '달걀' : '달걀노른자';
    if (name === '달걀흰자') return null;
    return name;
  }

  const FAMILY = { 달걀흰자: ['달걀노른자'], 게살: ['새우'] };

  const TEST_NOTES = {
    risky: [
      '평일 오전 첫 끼에 아주 소량으로 시작, 먹인 뒤 2시간은 집에서 관찰',
      '이상 없으면 1일차의 2배',
      '이상 없으면 다시 2배',
      '목표량 유지',
      '이상 없으면 통과 → 이후 주 2회 이상 계속 먹이기',
    ],
    normal: ['오전 첫 끼에 소량으로 시작', '이상 없으면 양 늘림', '이상 없으면 통과'],
  };

  function day(d) {
    const b = blockOf(d);
    const [cat, name, risky, prep] = BLOCKS[b];
    const known = { g: [], p: [], v: [], f: [], d: [], a: [] };
    const passedRisky = [];
    for (let i = 0; i < b; i++) {
      known[BLOCKS[i][0]].push(BLOCKS[i][1]);
      if (BLOCKS[i][2]) passedRisky.push(BLOCKS[i][1]);
    }
    const eggOk = known.p.includes('달걀흰자');
    // 고위험 테스트 중에는 같은 계열 식품을 다른 끼니에 쓰지 않음 (반응 원인 구분)
    const family = risky ? FAMILY[name] || [] : [];
    const proteins = known.p
      .filter((x) => x !== '달걀흰자' && x !== '소고기' && !family.includes(x))
      .map((x) => (x === '달걀노른자' && eggOk ? '달걀' : x));
    const ph = phase(d);
    const nVeg = ph.stage === '초기' ? 1 : 2;
    const NEW = '★' + name;

    const meals = [];
    if (cat === 'g' && name === '쌀') meals.push(['★쌀미음']);
    else {
      const grain = cat === 'g' ? '쌀·' + NEW : '쌀';
      const protein = cat === 'p' ? NEW : '소고기';
      const vegs = cat === 'v' ? [NEW].concat(ph.stage === '초기' ? [] : rot(known.v, d, 1)) : rot(known.v, d, nVeg);
      const m1 = [grain, protein].concat(vegs);
      if (cat === 'a' || (cat === 'd' && name === '아기치즈')) m1.push(NEW);
      if (cat === 'f' || (cat === 'd' && name === '요거트')) m1.push('식후 ' + NEW);
      meals.push(m1);
    }
    const grains = ['쌀'].concat(known.g.filter((x) => x !== '쌀'));
    for (let k = 1; k < ph.meals; k++) {
      const g = grains.length > 1 && (d + k) % 3 === 0 ? '쌀·' + grains[1 + ((d + k) % (grains.length - 1))] : '쌀';
      const beefInMeal1 = meals[0].includes('소고기');
      let protein;
      if (!beefInMeal1 && k === 1) protein = '소고기';
      else protein = proteins.length ? rot(proteins, d + k, 1)[0] : '소고기';
      if (ph.meals === 3 && k === 2 && protein === '소고기' && proteins.length) protein = rot(proteins, d + 5, 1)[0];
      meals.push([g, protein].concat(rot(known.v, d + 2 * k + 1, nVeg)));
    }
    let snack = '';
    if (ph.snack) snack = rot(known.f.concat(known.d), d, d >= T.three ? 2 : 1).join(', ');

    // 유지: 통과한 고위험 식품을 주 2회 이상. 오늘 식단·간식에 이미 있는 것은 제외하고 순서대로 채움
    const keepAll = [...new Set(passedRisky.filter((x) => !family.includes(x)).map((x) => keepName(x, eggOk)).filter(Boolean))];
    const today = meals.map((m) => m.join(' ')).join(' ') + ' ' + snack;
    const perDay = Math.ceil((keepAll.length * 2) / 7);
    const keep = rot(keepAll, d * perDay, perDay).filter((x) => !today.includes(x));

    const span = SPANS[b];
    const di = d - span.start + 1;
    const test = cat === '-' ? null : {
      name, risky: !!risky, dayIndex: di, days: span.len,
      prep: prep || DEFAULT_PREP[cat] || '',
      note: TEST_NOTES[risky ? 'risky' : 'normal'][di - 1],
    };
    return {
      d, ...ph,
      meals: meals.map((m) => m.join(' + ')),
      snack, keep, test,
      review: cat === '-' ? prep : '',
    };
  }

  function plan() {
    const out = [];
    for (let d = 1; d <= DAYS; d++) out.push(day(d));
    return out;
  }

  const api = { BLOCKS, SPANS, DAYS, T, phase, day, plan };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BabyFoodPlan = api;
})(this);
