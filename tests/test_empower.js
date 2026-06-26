const assert = require('assert');
const E = require('../scripts/_empower');
const lib = E.loadEmpower();
for (const c of ['interpret','geju','palace_sihua','bazi_trait','dayun','liunian','heming']) {
  assert.ok(lib[c], '缺类别 ' + c);
}
const r = E.lookup('bazi_trait','身弱财多');
assert.ok(r && r.transform, 'lookup 未返回 transform');
const g = E.lookup('geju','不存在的格局');
assert.ok(g && g.mindset, '兜底未返回 mindset');
console.log('✅ _empower 测试通过');
