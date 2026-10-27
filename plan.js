// 6~10개월(150일) 이유식 일정 생성기. D1 = 이유식 시작일.
// 브라우저에서는 window.BabyFoodPlan, Node에서는 module.exports 로 사용.
(function (root) {
  // 3일씩 새 재료 1가지 (알레르기 테스트). cat: g 곡물, p 단백질, v 채소, f 과일, d 유제품, a 견과·씨앗, - 복습
  const BLOCKS = [
    // 6개월 (D1~30)
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
    // 7개월 (D31~60)
    ['p', '닭고기', 0, '안심, 삶아서 곱게 다짐, 10g'],
    ['p', '달걀노른자', 1, '완숙 노른자 ¼개 → 3일째 ½개'],
    ['v', '무', 0],
    ['v', '당근', 0],
    ['v', '시금치', 0, '잎만 데쳐서 다짐'],
    ['f', '사과', 0, '익혀서 갈아 1~2작은술, 식후'],
    ['p', '두부', 1, '데쳐서 으깸, 10g'],
    ['f', '배', 0, '익혀서 갈아 1~2작은술, 식후'],
    ['v', '배추', 0, '잎 부분만 데쳐서 다짐'],
    ['v', '콜리플라워', 0],
    // 8개월 (D61~90)
    ['p', '대구살', 1, '흰살생선, 가시 제거 후 쪄서 다짐, 10g'],
    ['p', '달걀흰자', 1, '완숙 흰자 1작은술 → 3일째 ½개 이하 (통과 시 전란 사용)'],
    ['g', '밀', 1, '아기국수를 잘게 잘라 죽에 넣거나 밀가루 소량'],
    ['v', '양파', 0],
    ['v', '표고버섯', 0, '기둥 떼고 다짐'],
    ['f', '바나나', 0, '으깨서 1~2작은술, 식후'],
    ['d', '요거트', 1, '무가당 플레인 요거트 1~2숟가락, 식후'],
    ['v', '가지', 0, '껍질 벗겨 익혀서 다짐'],
    ['d', '아기치즈', 1, '아기치즈 ¼장을 죽에 녹임'],
    ['v', '비트', 0],
    // 9개월 (D91~120)
    ['a', '땅콩', 1, '무첨가 땅콩버터 ¼작은술을 물에 풀어 죽에 섞음 (통땅콩 금지)'],
    ['p', '돼지고기', 0, '안심, 삶아서 다짐, 10g'],
    ['v', '파프리카', 0, '껍질 벗겨 익혀서 다짐'],
    ['p', '새우', 1, '익혀서 곱게 다짐, 5g부터'],
    ['f', '아보카도', 0, '잘 익은 것 으깨서, 식후'],
    ['v', '토마토', 0, '껍질·씨 제거 후 익힘'],
    ['p', '연어', 1, '익혀서 다짐, 10g'],
    ['f', '블루베리', 0, '반드시 으깨서 (통째 질식 위험), 식후'],
    ['g', '현미', 0, '곱게 간 현미를 쌀과 섞어 죽'],
    ['a', '아몬드', 1, '고운 아몬드 가루 ¼작은술을 죽에 섞음'],
    // 10개월 (D121~150)
    ['a', '참깨', 1, '곱게 빻은 깨 ¼작은술을 죽에 섞음'],
    ['v', '미역', 0, '불려서 잘게 다짐'],
    ['v', '콩나물', 0, '머리·꼬리 떼고 잘게 다짐'],
    ['a', '호두', 1, '고운 호두 가루 ¼작은술을 죽에 섞음'],
    ['v', '연근', 0],
    ['f', '딸기', 1, '겉 씨 부분 도려내고 으깸, 식후'],
    ['v', '부추', 0, '잘게 다짐'],
    ['p', '게살', 1, '익힌 게살(맛살 아님) 다져서 5g부터'],
    ['g', '옥수수', 0, '껍질 벗겨 곱게 갈아 죽에 섞음'],
    ['-', '복습', 0, '새 재료 없음. 통과한 재료 조합 연습'],
  ];
  const DAYS = BLOCKS.length * 3; // 150

  const DEFAULT_PREP = {
    v: '익혀서 곱게 갈기(중기 이후 다지기), 첫날 1작은술부터',
    f: '익히거나 갈아서 1~2작은술, 식후',
    g: '쌀과 섞어 죽',
    p: '익혀서 다짐, 10g',
  };

  function phase(d) {
    const month = 6 + Math.floor((d - 1) / 30);
    let p;
    if (d <= 14) p = { stage: '초기', texture: '10배죽', meals: 1, amount: d <= 3 ? '10~20g (1~2숟가락)' : d <= 7 ? '20~30g' : '30~50g' };
    else if (d <= 21) p = { stage: '초기', texture: '8배죽', meals: 1, amount: '50~60g' };
    else if (d <= 31) p = { stage: '초기', texture: '8배죽', meals: 2, amount: '50~80g' };
    else if (d <= 61) p = { stage: '중기', texture: '6배죽', meals: 2, amount: d <= 45 ? '70~90g' : '80~100g' };
    else if (d <= 91) p = { stage: '중기', texture: '5배죽', meals: 2, amount: '100~120g' };
    else if (d <= 121) p = { stage: '후기', texture: '4배죽', meals: 3, amount: d <= 105 ? '100~120g' : '120g' };
    else if (d <= 136) p = { stage: '후기', texture: '3배죽', meals: 3, amount: '120~150g' };
    else p = { stage: '후기', texture: '진밥', meals: 3, amount: '120~150g' };
    p.month = month;
    p.snack = d >= 122 ? '1~2회' : d >= 92 ? '1회' : '';
    p.meat = month === 6 ? '10~20g' : month <= 8 ? '20~30g' : '30~40g';
    p.milk = month === 6 ? '700~900ml' : month <= 8 ? '600~800ml' : '500~700ml';
    // 질감·횟수 변경일 (새 재료 첫날과 겹치지 않게 배치)
    const TRANSITIONS = {
      15: '8배죽으로 전환 (1회 30~50g 거부 없이 먹으면)',
      22: '하루 2회로 늘림 (2회차는 통과한 재료만)',
      32: '중기 시작: 6배죽 (전환 기준 충족 시, 미충족이면 8배죽 1주 더)',
      62: '5배죽으로 전환 (6배죽 알갱이 구역질 없으면)',
      92: '후기 시작: 4배죽·하루 3회·간식 1회 (전환 기준 충족 시)',
      122: '3배죽으로 전환',
      137: '진밥으로 전환 (3배죽 잘 먹으면)',
    };
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

  function day(d) {
    const b = Math.floor((d - 1) / 3);
    const [cat, name, risky, prep] = BLOCKS[b];
    const known = { g: [], p: [], v: [], f: [], d: [], a: [] };
    for (let i = 0; i < b; i++) known[BLOCKS[i][0]].push(BLOCKS[i][1]);
    // 흰자까지 통과하면 노른자 → 달걀(전란)
    const eggOk = known.p.includes('달걀흰자');
    const proteins = known.p
      .filter((x) => x !== '달걀흰자' && x !== '소고기')
      .map((x) => (x === '달걀노른자' && eggOk ? '달걀' : x));
    const ph = phase(d);
    const nVeg = ph.stage === '초기' ? 1 : 2;
    const NEW = '★' + name;

    const meals = [];
    if (cat === 'g' && name === '쌀') meals.push(['★쌀미음']);
    else {
      let grain = cat === 'g' ? '쌀·' + NEW : '쌀';
      let protein = cat === 'p' ? NEW : '소고기';
      let vegs = cat === 'v' ? [NEW].concat(ph.stage === '초기' ? [] : rot(known.v, d, 1)) : rot(known.v, d, nVeg);
      const m1 = [grain, protein].concat(vegs);
      if (cat === 'a') m1.push(NEW);
      if (cat === 'd' && name === '아기치즈') m1.push(NEW);
      if (cat === 'f' || (cat === 'd' && name === '요거트')) m1.push('식후 ' + NEW);
      meals.push(m1);
    }
    const grains = ['쌀'].concat(known.g.filter((x) => x !== '쌀'));
    for (let k = 1; k < ph.meals; k++) {
      const g = grains.length > 1 && (d + k) % 3 === 0 ? '쌀·' + grains[1 + ((d + k) % (grains.length - 1))] : '쌀';
      // 하루에 소고기 최소 1회 (철분)
      const beefInMeal1 = meals[0].includes('소고기');
      let protein;
      if (!beefInMeal1 && k === 1) protein = '소고기';
      else protein = proteins.length ? rot(proteins, d + k, 1)[0] : '소고기';
      if (ph.meals === 3 && k === 2 && protein === '소고기' && proteins.length) protein = rot(proteins, d + 5, 1)[0];
      meals.push([g, protein].concat(rot(known.v, d + 2 * k + 1, nVeg)));
    }
    let snack = '';
    if (ph.snack) {
      const pool = known.f.concat(known.d);
      snack = rot(pool, d, d >= 122 ? 2 : 1).join(', ');
    }

    const di = ((d - 1) % 3) + 1;
    const test = cat === '-' ? null : {
      name, risky: !!risky, dayIndex: di,
      prep: prep || DEFAULT_PREP[cat] || '',
      note: di === 1 ? '오전 첫 끼에 소량으로 시작' : di === 2 ? '이상 없으면 양 늘림' : '이상 없으면 통과',
    };
    return {
      d, ...ph,
      meals: meals.map((m) => m.join(' + ')),
      snack, test,
      review: cat === '-' ? prep : '',
    };
  }

  function plan() {
    const out = [];
    for (let d = 1; d <= DAYS; d++) out.push(day(d));
    return out;
  }

  const api = { BLOCKS, DAYS, phase, day, plan };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BabyFoodPlan = api;
})(this);
