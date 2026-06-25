/**
 * 八字核心引擎 —— 排盘 + 旺衰 + 喜用 + 流年逐年断（可复用模块）
 * 被 bazi_liunian.js(命令行JSON) 与 gen_liunian_html.js(HTML生成) 共用，避免重复。
 *
 * 依赖: vendor/tyme4ts + vendor/bazi(关系层)，均离线
 * 旺衰用简化三得模型；从格/调候/特殊格局须人工复核
 */
const path = require('path');
const T = require(path.join(__dirname, 'vendor/tyme4ts/dist/lib/index.cjs'));
const { SolarTime, ChildLimit, Gender } = T;
const { analyzeZhiRelations } = require(path.join(__dirname, 'vendor/bazi/bazi_relations.js'));
const { liunianShensha } = require(path.join(__dirname, 'vendor/bazi/shensha.js'));

// === 流派配置（默认对齐问真八字）===
// 起运流派：LunarSect1 交运时刻最接近问真(命主差2天,其余流派差6-7天;虚岁5/大运分段一致)
// 可由环境变量 BAZI_QI_SCHOOL 切换: default | china95 | lunarSect1 | lunarSect2
const QI_PROVIDERS = {
  default: T.DefaultChildLimitProvider,
  china95: T.China95ChildLimitProvider,
  lunarSect1: T.LunarSect1ChildLimitProvider,
  lunarSect2: T.LunarSect2ChildLimitProvider,
};
const QI_SCHOOL = process.env.BAZI_QI_SCHOOL || 'lunarSect1';
ChildLimit.provider = new (QI_PROVIDERS[QI_SCHOOL] || T.LunarSect1ChildLimitProvider)();

// ===== 五行基础 =====
const GAN_WX = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
const ZHI_MAIN = {子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'};
const SHENG = (x,y)=>(x==='木'&&y==='火')||(x==='火'&&y==='土')||(x==='土'&&y==='金')||(x==='金'&&y==='水')||(x==='水'&&y==='木');
const KE = (x,y)=>(x==='木'&&y==='土')||(x==='土'&&y==='水')||(x==='水'&&y==='火')||(x==='火'&&y==='金')||(x==='金'&&y==='木');
const wxGan = g => GAN_WX[g];

// ===== 十二长生(流年地支对日主的旺衰状态) =====
// 按五行, 地支序(子丑寅卯辰巳午未申酉戌亥)。火土同长生(寄寅)。
const CS_BY_WX = {
  木: ['沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养','长生'],
  火: ['胎','养','长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝'],
  土: ['胎','养','长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝'],
  金: ['死','墓','绝','胎','养','长生','沐浴','冠带','临官','帝旺','衰','病'],
  水: ['帝旺','衰','病','死','墓','绝','胎','养','长生','沐浴','冠带','临官'],
};
const CS_GOOD = new Set(['长生','冠带','临官','帝旺']);   // 生气旺地 → 吉
const CS_BAD  = new Set(['衰','病','死','墓','绝']);       // 退气死地 → 凶
/** 流年地支对日主的十二长生 → 计分(长生/冠/临/旺 +1; 衰/病/死/墓/绝 -1; 沐浴/胎/养 0) */
function changshengScore(dayGan, zhi) {
  const wx = GAN_WX[dayGan], state = (CS_BY_WX[wx]||[])[ZHI_ORDER.indexOf(zhi)];
  if (!state) return { score: 0, state: '' };
  return { score: CS_GOOD.has(state) ? 1 : CS_BAD.has(state) ? -1 : 0, state };
}

const GAN_ORDER = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI_ORDER = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
/** 旬空(空亡)：由日柱干支查所在旬，返回该旬空亡的两个地支 */
function kongWang(dayGan, dayZhi) {
  let n = -1;
  for (let i = 0; i < 60; i++) if (GAN_ORDER[i%10]===dayGan && ZHI_ORDER[i%12]===dayZhi) { n = i; break; }
  if (n < 0) return [];
  const xun = Math.floor(n/10);           // 旬号 0-5
  const start = ((10 - 2*xun) % 12 + 12) % 12;
  return [ZHI_ORDER[start], ZHI_ORDER[(start+1)%12]];
}

// ===== 流年十维度(八字) =====
// 维度→十神类(子=官杀,传统男命官杀主子;灾=官杀七杀克身;身=日主受流年生克)
const DIM_BAZI = { 妻:'财', 财:'财', 子:'官杀', 禄:'官杀', 父:'财', 身:'身', 友:'比劫', 考:'印', 宅:'财', 灾:'官杀', 艺:'食伤' };
/** 每维度:流年干支十神是否该类+喜忌(身看流年对日主生克) */
function judgeBaziDim(ganTG, zhiTG, yj) {
  const dims = {};
  for (const [dim, cls] of Object.entries(DIM_BAZI)) {
    if (cls === '身') {
      let sc = 0;
      if (yj.yong.includes(ganTG)) sc++; if (yj.ji.includes(ganTG)) sc--;
      if (yj.yong.includes(zhiTG)) sc++; if (yj.ji.includes(zhiTG)) sc--;
      dims[dim] = { verdict: sc>0?'吉':sc<0?'凶':'平', score: sc };
    } else {
      let hit = 0; if (ganTG === cls) hit++; if (zhiTG === cls) hit++;
      if (hit === 0) { dims[dim] = { verdict: '平', score: 0, _: '该年无'+cls+'星' }; continue; }
      const isYong = yj.yong.includes(cls), isJi = yj.ji.includes(cls);
      // 修复: 官杀为忌时, 禄(事业职位)不判纯凶——官星到位主职位变动(升职伴压力), 区别于子/灾的"官杀克身"
      if (cls === '官杀' && isJi && dim === '禄') {
        dims[dim] = { verdict: '平', score: 0, _: '官杀到位·职位/压力变动(升职可能)' };
        continue;
      }
      dims[dim] = { verdict: isJi?'凶':isYong?'吉':'平', score: isJi?-hit:isYong?hit:0 };
    }
  }
  return dims;
}

/** 十神类(五行关系，不分正偏)：比劫/印/食伤/财/官杀 */
function tenGodClass(dayGan, targetGan) {
  const a = wxGan(dayGan), b = wxGan(targetGan);
  if (a === b) return '比劫';
  if (SHENG(b, a)) return '印';
  if (SHENG(a, b)) return '食伤';
  if (KE(a, b)) return '财';
  if (KE(b, a)) return '官杀';
  return '?';
}

/** 日主旺衰(简化三得)：月令主导 + 本气根 + 天干党势 */
function judgeStrength(ec, me) {
  const dayGan = me.getName(), meWx = wxGan(dayGan);
  const zhis = [ec.getYear(),ec.getMonth(),ec.getDay(),ec.getHour()].map(c=>c.getEarthBranch().getName());
  const monthMainWx = wxGan(ZHI_MAIN[zhis[1]]);
  const monthSupports = (monthMainWx===meWx) || SHENG(monthMainWx, meWx);
  let root=0, drain=0;
  zhis.forEach(z=>{const w=wxGan(ZHI_MAIN[z]);(w===meWx||SHENG(w,meWx))?root++:drain++;});
  const gans=[ec.getYear(),ec.getMonth(),ec.getHour()].map(c=>c.getHeavenStem().getName());
  let helpG=0, againstG=0;
  gans.forEach(g=>{const w=wxGan(g);(w===meWx||SHENG(w,meWx))?helpG++:againstG++;});
  let score=0;
  if(monthSupports) score+=2; else score-=2;
  score += (root-drain);
  score += (helpG-againstG)*0.5;
  return { strength: score>0?'旺':'弱', score, monthSupports, root, drain, helpG, againstG };
}

// ===== 四参合定用辅助：五行生克映射 =====
const WOSHENG = {木:'火',火:'土',土:'金',金:'水',水:'木'};   // 我生(食伤五行)
const WOKE    = {木:'土',土:'水',水:'火',火:'金',金:'木'};   // 我克(财五行)
const SHENGWO = {木:'水',火:'木',土:'火',金:'土',水:'金'};   // 生我(印五行)
const KEWO    = {木:'金',火:'水',土:'木',金:'火',水:'土'};   // 克我(官杀五行)
/** 五行 → 十神类(按日主五行 meWx) */
function shishenOfWx(meWx, x) {
  if (x === meWx) return '比劫';
  if (WOSHENG[meWx] === x) return '食伤';
  if (SHENGWO[meWx] === x) return '印';
  if (WOKE[meWx] === x) return '财';
  if (KEWO[meWx] === x) return '官杀';
  return '?';
}
/** 原局五行分布(天干+本气+藏干) 与 缺/近缺判定 */
function wxCount(ec) {
  const cang = require(path.join(__dirname, '..', 'data', 'canggan.json')).data;
  const wx = {木:0,火:0,土:0,金:0,水:0};
  const wxBenqi = {木:0,火:0,土:0,金:0,水:0};   // 透干+本气(判近缺用)
  [ec.getYear(),ec.getMonth(),ec.getDay(),ec.getHour()].forEach(c => {
    const g = c.getHeavenStem().getName(), z = c.getEarthBranch().getName();
    const gWx = GAN_WX[g];
    wx[gWx]++; wxBenqi[gWx]++;
    wxBenqi[GAN_WX[ZHI_MAIN[z]]]++;                      // 本气
    (cang[z]||[]).forEach(h => { wx[GAN_WX[h]]++; });    // 全藏干(本+中+余)
  });
  const missing = [], nearMissing = [];
  for (const k of Object.keys(wx)) {
    if (wx[k] === 0) missing.push(k);                    // 全无(连藏干都无)
    else if (wxBenqi[k] === 0) nearMissing.push(k);      // 藏库不透(本气与透干皆0，如命主火仅藏戌库丁火)
  }
  return { wx, wxBenqi, missing, nearMissing };
}
/** 调候用神(穷通宝鉴简表): 日干 × 月支 → 调候五行列表 */
let _TIAOHOU;
function tiaohou(dayGan, monthZhi) {
  if (!_TIAOHOU) _TIAOHOU = require(path.join(__dirname, '..', 'data', 'tiaohou.json')).data;
  return ((_TIAOHOU[dayGan]||{})[monthZhi]) || [];
}
/** 通关(滴天髓): 身弱 + 财在忌 + 食伤缺/近缺 → 食伤通关(日主→食伤→财) */
function tongguan(strength, meGan, wc, baseYj) {
  if (strength !== '弱' || !baseYj.ji.includes('财')) return [];
  const meWx = GAN_WX[meGan];
  const shishangWx = WOSHENG[meWx];
  if (wc.nearMissing.includes(shishangWx) || wc.missing.includes(shishangWx)) return ['食伤'];
  return [];
}
/** 财印关系检测(避免绝对化·结合古籍): 财坏印程度(印全虚/印透无根/印有根) + 财多压身被动 + 印虚非正途 */
function caiYinRelation(strength, meGan, wc, yj, ec) {
  const notes = [];
  if (strength !== '弱' || !yj.ji.includes('财')) return notes;
  const meWx = GAN_WX[meGan], yinWx = SHENGWO[meWx];
  let yinTou = false, hasYinRoot = false;
  if (ec) [ec.getYear(),ec.getMonth(),ec.getDay(),ec.getHour()].forEach(c=>{
    if (GAN_WX[c.getHeavenStem().getName()] === yinWx) yinTou = true;                          // 天干透印
    if (GAN_WX[ZHI_MAIN[c.getEarthBranch().getName()]] === yinWx) hasYinRoot = true;           // 地支本气印根
  });
  if (wc.wx[yinWx] === 0) {
    notes.push('财坏印(印全虚·无透无根被财克·重): 易因财损名/学业受阻/母亲健康/靠山失力; 须比劫制财护印 [古诀·子平真诠]');
  } else if (!hasYinRoot && yinTou) {
    notes.push('财坏印(印透无根·虚浮·轻-中): 印透母缘在/健康尚可, 但靠山不稳(印无根); 印根/比劫可护 [古诀]');
    notes.push('印虚非正途: 学业/文凭多靠非正途(自费/远程/关系操作), 贵人有但力虚');
  } else if (hasYinRoot) {
    notes.push('财印双美倾向(印有根·财难坏): 身弱但印护有力, 富屋贫人可借印比担财 [子平真诠]');
  }
  notes.push('财多压身(≠个人贪财): 财缘重担不住, 易被动卷入财事/被动破财(被拉合伙/投资), 非主动贪财; 忌断"重财"');
  return notes;
}
/**
 * 喜用/忌神 —— 四参合定用：基础旺衰 + 调候(穷通宝鉴) + 缺补 + 通关(滴天髓) 复核。
 * BAZI_SIHE=off 退回纯旺衰二元(向后兼容/对照)；格局(子平真诠)记 notes 不强改。
 * @returns {yong, ji, notes:{十神:'原因'}, revisions:[{tg,from,to,why}]}
 */
function yongJi(strength, ctx={}) {
  let yong = strength==='弱' ? ['印','比劫'] : ['财','官杀','食伤'];
  let ji   = strength==='弱' ? ['财','官杀','食伤'] : ['印','比劫'];
  const notes = {}, revisions = [];
  const addYong = (tg, why) => {
    if (ji.includes(tg)) { ji = ji.filter(x => x !== tg); revisions.push({tg, from:'忌', to:'喜', why}); }
    if (!yong.includes(tg)) yong.push(tg);
    notes[tg] = (notes[tg] ? notes[tg] + '；' : '') + why;
  };
  const SIHE = (process.env.BAZI_SIHE || 'on') !== 'off';
  if (SIHE && ctx.me && ctx.wc) {
    const meWx = GAN_WX[ctx.me];
    // ① 调候用神(穷通宝鉴)：月令寒暖燥湿所需
    (ctx.tiaohou || []).forEach(wx => addYong(shishenOfWx(meWx, wx), '调候('+wx+'·穷通宝鉴)'));
    // ② 缺五行补缺：缺/近缺五行常为补缺泄秀所需之用(缺五行不即忌)
    [...ctx.wc.missing, ...ctx.wc.nearMissing].forEach(wx =>
      addYong(shishenOfWx(meWx, wx), ctx.wc.missing.includes(wx) ? '补缺('+wx+')' : '补缺('+wx+'·藏库不透)'));
    // ③ 通关(滴天髓)：身弱财多+食伤缺 → 食伤通关(木→火→土)
    tongguan(strength, ctx.me, ctx.wc, {ji}).forEach(tg => addYong(tg, '通关(日主→食伤→财·滴天髓)'));
    // ④ 格局(子平真诠)：月令本气取格，记 notes 提示(不强改 yj，留人工)
    if (ctx.monthZhi) {
      const gejuWx = GAN_WX[ZHI_MAIN[ctx.monthZhi]];
      notes['_格局'] = '月令'+ctx.monthZhi+'本气('+gejuWx+')→'+shishenOfWx(meWx, gejuWx)+'格；格局用神须参看，引擎仅提示不强改';
    }
    // ⑤ 财印关系(避免绝对化): 财坏印程度/财多压身被动/印虚非正途
    const caiYinNotes = caiYinRelation(strength, ctx.me, ctx.wc, {ji}, ctx.ec);
    if (caiYinNotes.length) notes['_财印'] = caiYinNotes.join('；');
  }
  return { yong, ji, notes, revisions };
}

const TG_NOTE = {
  '印':    { yong:'学业/文凭/长辈贵人/安顿', ji:'滞塞/依赖/思虑过重' },
  '比劫':  { yong:'合作/助身担财/朋友助力', ji:'破财/竞争劫夺/口舌' },
  '食伤':  { yong:'才华施展/技艺/表达得利', ji:'泄身劳累/口舌是非' },
  '财':    { yong:'得财/置业/男命姻缘',     ji:'破财/父辈扰/感情波折' },
  '官杀':  { yong:'升职/掌权/地位/女命姻缘', ji:'压力/是非/伤病官非' },
};

/**
 * 完整分析：排盘 + 旺衰 + 喜用 + 流年逐年断
 * @returns {chart:{...}, liunian:[{year,age,dayun,taiSui,gan,zhi,score,verdict,zhiRelations}]}
 */
function analyze(Y, Mo, D, H, MIN, gender, startYear, endYear) {
  const G = (gender==='男'||gender==='man'||gender==='M') ? Gender.MAN : Gender.WOMAN;
  const st = SolarTime.fromYmdHms(Y, Mo, D, H, MIN, 0);
  const ec = st.getLunarHour().getEightChar();
  const me = ec.getDay().getHeavenStem();
  const strength = judgeStrength(ec, me);
  const wc = wxCount(ec);
  const monthZhi = ec.getMonth().getEarthBranch().getName();
  const yj = yongJi(strength.strength, { me: me.getName(), monthZhi, wc, tiaohou: tiaohou(me.getName(), monthZhi), ec });

  const cl = ChildLimit.fromSolarTime(st, G);
  const df0 = cl.getStartDecadeFortune();
  const dayuns = Array.from({length:9}, (_,i)=>{const d=df0.next(i);return{name:d.getName(),s:d.getStartSixtyCycleYear().getYear(),e:d.getEndSixtyCycleYear().getYear(),sa:d.getStartAge(),ea:d.getEndAge()};});
  const dayunOf = y => (dayuns.find(d=>y>=d.s&&y<=d.e)||{}).name || '-';

  const mingZhi = [['年',ec.getYear().getEarthBranch().getName()],['月',ec.getMonth().getEarthBranch().getName()],['日',ec.getDay().getEarthBranch().getName()],['时',ec.getHour().getEarthBranch().getName()]];
  const pillar = [ec.getYear(),ec.getMonth(),ec.getDay(),ec.getHour()].map((c,i) => ({pos:['年','月','日','时'][i], gan:c.getHeavenStem().getName(), zhi:c.getEarthBranch().getName()}));
  const yearNayin = ec.getYear().getSound().getName();   // 年柱纳音(学堂/词馆/天罗地网用)

  const f0 = cl.getStartFortune();
  const liunian = [];
  for (let n=0; n<200; n++) {
    const f = f0.next(n);
    const scYear = f.getSixtyCycleYear();
    const year = scYear.getYear();
    if (year > endYear) break;
    if (year < startYear) continue;
    const tai = scYear.getSixtyCycle();
    const taiGan = tai.getHeavenStem().getName();
    const taiZhi = tai.getEarthBranch().getName();
    const ganTG = tenGodClass(me.getName(), taiGan);
    const zhiTG = tenGodClass(me.getName(), ZHI_MAIN[taiZhi]);
    let sc=0, yongHit=0, jiHit=0;
    if(yj.yong.includes(ganTG)){sc++;yongHit++;} if(yj.ji.includes(ganTG)){sc--;jiHit++;}
    if(yj.yong.includes(zhiTG)){sc++;yongHit++;} if(yj.ji.includes(zhiTG)){sc--;jiHit++;}
    // 修复: 纳入刑冲合害(冲/刑/害/破→凶, 合/会→吉) + 流年十二长生
    const relRaw = analyzeZhiRelations([...mingZhi, ['流', taiZhi]]).filter(r=>r.positions.some(p=>p.startsWith('流')));
    const rels = relRaw.map(r=>`${r.type}:${r.positions.join('↔')}`);
    let relXiong = 0;
    relRaw.forEach(r => { if (/冲|刑|害|破/.test(r.type)) relXiong++; });
    const relScore = relXiong > 0 ? -1 : 0;   // 刑冲害破→凶(只取方向-1, 避免多关系累加失真; 合/会化神不定, 不计)
    const cs = changshengScore(me.getName(), taiZhi);
    sc += relScore + cs.score;
    const verdict = sc>0?'吉' : sc<0?'凶' : (yongHit>0&&jiHit>0?'参半':'平');
    const dy = dayunOf(year);
    const dayunDims = dy ? judgeBaziDim(tenGodClass(me.getName(),dy[0]), tenGodClass(me.getName(),ZHI_MAIN[dy[1]]), yj) : {};
    liunian.push({
      year, age: f.getAge(), dayun: dy, taiSui: tai.getName(),
      gan: { tenGod: ganTG, attr: yj.yong.includes(ganTG)?'喜用':'忌神', note: TG_NOTE[ganTG][yj.yong.includes(ganTG)?'yong':'ji'] },
      zhi: { tenGod: zhiTG, attr: yj.yong.includes(zhiTG)?'喜用':'忌神', note: TG_NOTE[zhiTG][yj.yong.includes(zhiTG)?'yong':'ji'] },
      score: sc, verdict, zhiRelations: rels,
      baziDims: judgeBaziDim(ganTG, zhiTG, yj),   // 八字十维度(流年层)
      dayunDims,   // 大运十维度基调(叠加层)
      shensha: liunianShensha(pillar, taiGan, taiZhi, gender, yearNayin),   // 流年神煞(基础版,多基准查法)
    });
  }

  // 纳音/藏干十神/空亡(对齐问真八字)
  const cycles = [ec.getYear(),ec.getMonth(),ec.getDay(),ec.getHour()];
  const nayin = cycles.map(c => c.getSound().getName());
  const hideTenGod = cycles.map(c => {
    const z = c.getEarthBranch();
    return [z.getHideHeavenStemMain(),z.getHideHeavenStemMiddle(),z.getHideHeavenStemResidual()]
      .filter(Boolean).map(h => `${h.getName()}:${me.getTenStar(h).getName()}`);
  });
  const kongWangVal = kongWang(ec.getDay().getHeavenStem().getName(), ec.getDay().getEarthBranch().getName());

  return {
    chart: {
      fourPillars: [ec.getYear().getName(),ec.getMonth().getName(),ec.getDay().getName(),ec.getHour().getName()],
      nayin,                                   // 每柱纳音
      hideTenGod,                              // 藏干十神 [[本:十神,中:十神,余:十神],...]
      kongWang: kongWangVal,                   // 日柱旬空(空亡)
      dayMaster: me.getName(),
      strength: strength.strength,
      strengthDetail: strength,
      yongShen: yj.yong, jiShen: yj.ji,
      yjNotes: yj.notes, yjRevisions: yj.revisions, wxCount: wc.wx, wxMissing: wc.missing, wxNearMissing: wc.nearMissing,
      childLimit: { years: cl.getYearCount(), months: cl.getMonthCount(), days: cl.getDayCount(), endTime: cl.getEndTime().toString() },
      school: { qi: QI_SCHOOL, qiNote: '默认 lunarSect1 对齐问真;设 BAZI_QI_SCHOOL 切换(default/china95/lunarSect1/lunarSect2)' },
      daYun: dayuns.map(d => {
        const dyGan = d.name[0], dyZhi = d.name[1];
        const dyGanTG = tenGodClass(me.getName(), dyGan);
        const dyZhiTG = tenGodClass(me.getName(), ZHI_MAIN[dyZhi]);
        return { ganzhi: d.name, years: d.s + '-' + d.e, ages: d.sa + '-' + d.ea, dims: judgeBaziDim(dyGanTG, dyZhiTG, yj) };
      }),
    },
    liunian,
  };
}

module.exports = { analyze, SolarTime, ChildLimit, Gender, tenGodClass, judgeStrength, yongJi, wxCount, tiaohou, tongguan, shishenOfWx, TG_NOTE, GAN_WX, ZHI_MAIN, kongWang };
