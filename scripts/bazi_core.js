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
const DIM_BAZI = { 妻:'财', 财:'财', 子:'官杀', 禄:'官杀', 父:'财', 身:'身', 友:'比劫', 考:'印', 宅:'财', 灾:'官杀' };
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

/** 喜用/忌神类：身弱喜印比忌财官食伤；身旺反之 */
function yongJi(strength) {
  return strength==='弱'
    ? { yong:['印','比劫'], ji:['财','官杀','食伤'] }
    : { yong:['财','官杀','食伤'], ji:['印','比劫'] };
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
  const yj = yongJi(strength.strength);

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
    let sc=0;
    if(yj.yong.includes(ganTG)) sc++; if(yj.ji.includes(ganTG)) sc--;
    if(yj.yong.includes(zhiTG)) sc++; if(yj.ji.includes(zhiTG)) sc--;
    const verdict = sc>0?'吉' : sc<0?'凶' : '平';
    const rels = analyzeZhiRelations([...mingZhi, ['流', taiZhi]])
      .filter(r=>r.positions.some(p=>p.startsWith('流')))
      .map(r=>`${r.type}:${r.positions.join('↔')}`);
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

module.exports = { analyze, SolarTime, ChildLimit, Gender, tenGodClass, judgeStrength, yongJi, TG_NOTE, GAN_WX, ZHI_MAIN, kongWang };
