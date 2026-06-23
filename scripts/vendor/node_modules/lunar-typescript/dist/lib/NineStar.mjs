import { LunarUtil } from "./LunarUtil.mjs";
import { NineStarUtil } from "./NineStarUtil.mjs";
const _NineStar = class {
  static fromIndex(index) {
    return new _NineStar(index);
  }
  constructor(index) {
    this._index = index;
  }
  getNumber() {
    return NineStarUtil.NUMBER[this._index];
  }
  getColor() {
    return NineStarUtil.COLOR[this._index];
  }
  getWuXing() {
    return NineStarUtil.WU_XING[this._index];
  }
  getPosition() {
    return NineStarUtil.POSITION[this._index];
  }
  getPositionDesc() {
    const v = LunarUtil.POSITION_DESC[this.getPosition()];
    return v ? v : "";
  }
  getNameInXuanKong() {
    return _NineStar.NAME_XUAN_KONG[this._index];
  }
  getNameInBeiDou() {
    return _NineStar.NAME_BEI_DOU[this._index];
  }
  getNameInQiMen() {
    return _NineStar.NAME_QI_MEN[this._index];
  }
  getNameInTaiYi() {
    return _NineStar.NAME_TAI_YI[this._index];
  }
  getLuckInQiMen() {
    return _NineStar.LUCK_QI_MEN[this._index];
  }
  getLuckInXuanKong() {
    return NineStarUtil.LUCK_XUAN_KONG[this._index];
  }
  getYinYangInQiMen() {
    return NineStarUtil.YIN_YANG_QI_MEN[this._index];
  }
  getTypeInTaiYi() {
    return _NineStar.TYPE_TAI_YI[this._index];
  }
  getBaMenInQiMen() {
    return _NineStar.BA_MEN_QI_MEN[this._index];
  }
  getSongInTaiYi() {
    return _NineStar.SONG_TAI_YI[this._index];
  }
  getIndex() {
    return this._index;
  }
  toString() {
    return this.getNumber() + this.getColor() + this.getWuXing() + this.getNameInBeiDou();
  }
  toFullString() {
    let s = this.getNumber();
    s += this.getColor();
    s += this.getWuXing();
    s += " ";
    s += this.getPosition();
    s += "(";
    s += this.getPositionDesc();
    s += ") ";
    s += this.getNameInBeiDou();
    s += " \u7384\u7A7A[";
    s += this.getNameInXuanKong();
    s += " ";
    s += this.getLuckInXuanKong();
    s += "] \u5947\u95E8[";
    s += this.getNameInQiMen();
    s += " ";
    s += this.getLuckInQiMen();
    if (this.getBaMenInQiMen().length > 0) {
      s += " ";
      s += this.getBaMenInQiMen();
      s += "\u95E8";
    }
    s += " ";
    s += this.getYinYangInQiMen();
    s += "] \u592A\u4E59[";
    s += this.getNameInTaiYi();
    s += " ";
    s += this.getTypeInTaiYi();
    s += "]";
    return s;
  }
};
export let NineStar = _NineStar;
NineStar.NAME_BEI_DOU = ["\u5929\u67A2", "\u5929\u7487", "\u5929\u7391", "\u5929\u6743", "\u7389\u8861", "\u5F00\u9633", "\u6447\u5149", "\u6D1E\u660E", "\u9690\u5143"];
NineStar.NAME_XUAN_KONG = ["\u8D2A\u72FC", "\u5DE8\u95E8", "\u7984\u5B58", "\u6587\u66F2", "\u5EC9\u8D1E", "\u6B66\u66F2", "\u7834\u519B", "\u5DE6\u8F85", "\u53F3\u5F3C"];
NineStar.NAME_QI_MEN = ["\u5929\u84EC", "\u5929\u82AE", "\u5929\u51B2", "\u5929\u8F85", "\u5929\u79BD", "\u5929\u5FC3", "\u5929\u67F1", "\u5929\u4EFB", "\u5929\u82F1"];
NineStar.BA_MEN_QI_MEN = ["\u4F11", "\u6B7B", "\u4F24", "\u675C", "", "\u5F00", "\u60CA", "\u751F", "\u666F"];
NineStar.NAME_TAI_YI = ["\u592A\u4E59", "\u6444\u63D0", "\u8F69\u8F95", "\u62DB\u6447", "\u5929\u7B26", "\u9752\u9F99", "\u54B8\u6C60", "\u592A\u9634", "\u5929\u4E59"];
NineStar.TYPE_TAI_YI = ["\u5409\u795E", "\u51F6\u795E", "\u5B89\u795E", "\u5B89\u795E", "\u51F6\u795E", "\u5409\u795E", "\u51F6\u795E", "\u5409\u795E", "\u5409\u795E"];
NineStar.SONG_TAI_YI = ["\u95E8\u4E2D\u592A\u4E59\u660E\uFF0C\u661F\u5B98\u53F7\u8D2A\u72FC\uFF0C\u8D4C\u5F69\u8D22\u559C\u65FA\uFF0C\u5A5A\u59FB\u5927\u5409\u660C\uFF0C\u51FA\u5165\u65E0\u963B\u6321\uFF0C\u53C2\u8C12\u89C1\u8D24\u826F\uFF0C\u6B64\u884C\u4E09\u4E94\u91CC\uFF0C\u9ED1\u8863\u522B\u9634\u9633\u3002", "\u95E8\u524D\u89C1\u6444\u63D0\uFF0C\u767E\u4E8B\u5FC5\u5FE7\u7591\uFF0C\u76F8\u751F\u72B9\u81EA\u53EF\uFF0C\u76F8\u514B\u7978\u5FC5\u4E34\uFF0C\u6B7B\u95E8\u5E76\u76F8\u4F1A\uFF0C\u8001\u5987\u54ED\u60B2\u557C\uFF0C\u6C42\u8C0B\u5E76\u5409\u4E8B\uFF0C\u5C3D\u7686\u4E0D\u76F8\u5B9C\uFF0C\u53EA\u53EF\u85CF\u9690\u9041\uFF0C\u82E5\u52A8\u4F24\u8EAB\u75BE\u3002", "\u51FA\u5165\u4F1A\u8F69\u8F95\uFF0C\u51E1\u4E8B\u5FC5\u7F20\u7275\uFF0C\u76F8\u751F\u5168\u4E0D\u7F8E\uFF0C\u76F8\u514B\u66F4\u5FE7\u714E\uFF0C\u8FDC\u884C\u591A\u4E0D\u5229\uFF0C\u535A\u5F69\u5C3D\u8F93\u94B1\uFF0C\u4E5D\u5929\u7384\u5973\u6CD5\uFF0C\u53E5\u53E5\u4E0D\u865A\u8A00\u3002", "\u62DB\u6447\u53F7\u6728\u661F\uFF0C\u5F53\u4E4B\u4E8B\u83AB\u884C\uFF0C\u76F8\u514B\u884C\u4EBA\u963B\uFF0C\u9634\u4EBA\u53E3\u820C\u8FCE\uFF0C\u68A6\u5BD0\u591A\u60CA\u60E7\uFF0C\u5C4B\u54CD\u65A7\u81EA\u9E23\uFF0C\u9634\u9633\u6D88\u606F\u7406\uFF0C\u4E07\u6CD5\u5F17\u8FDD\u60C5\u3002", "\u4E94\u9B3C\u4E3A\u5929\u7B26\uFF0C\u5F53\u95E8\u9634\u5973\u8C0B\uFF0C\u76F8\u514B\u65E0\u597D\u4E8B\uFF0C\u884C\u8DEF\u963B\u4E2D\u9014\uFF0C\u8D70\u5931\u96BE\u5BFB\u89C5\uFF0C\u9053\u9022\u6709\u5C3C\u59D1\uFF0C\u6B64\u661F\u5F53\u95E8\u503C\uFF0C\u4E07\u4E8B\u6709\u707E\u9664\u3002", "\u795E\u5149\u8DC3\u9752\u9F99\uFF0C\u8D22\u6C14\u559C\u91CD\u91CD\uFF0C\u6295\u5165\u6709\u9152\u98DF\uFF0C\u8D4C\u5F69\u6700\u5174\u9686\uFF0C\u66F4\u9022\u76F8\u751F\u65FA\uFF0C\u4F11\u8A00\u514B\u7834\u51F6\uFF0C\u89C1\u8D35\u5B89\u8425\u5BE8\uFF0C\u4E07\u4E8B\u603B\u5409\u540C\u3002", "\u543E\u5C06\u4E3A\u54B8\u6C60\uFF0C\u5F53\u4E4B\u5C3D\u4E0D\u5B9C\uFF0C\u51FA\u5165\u591A\u4E0D\u5229\uFF0C\u76F8\u514B\u6709\u707E\u60C5\uFF0C\u8D4C\u5F69\u5168\u8F93\u5C3D\uFF0C\u6C42\u8D22\u7A7A\u624B\u56DE\uFF0C\u4ED9\u4EBA\u771F\u5999\u8BED\uFF0C\u611A\u4EBA\u83AB\u4E0E\u77E5\uFF0C\u52A8\u7528\u865A\u60CA\u9000\uFF0C\u53CD\u590D\u9006\u98CE\u5439\u3002", "\u5750\u4E34\u592A\u9634\u661F\uFF0C\u767E\u7978\u4E0D\u76F8\u4FB5\uFF0C\u6C42\u8C0B\u6089\u6210\u5C31\uFF0C\u77E5\u4EA4\u6709\u89C5\u5BFB\uFF0C\u56DE\u98CE\u5F52\u6765\u8DEF\uFF0C\u6050\u6709\u6B83\u4F0F\u8D77\uFF0C\u5BC6\u8BED\u4E2D\u8BB0\u53D6\uFF0C\u614E\u4E4E\u83AB\u8F7B\u884C\u3002", "\u8FCE\u6765\u5929\u4E59\u661F\uFF0C\u76F8\u9022\u767E\u4E8B\u5174\uFF0C\u8FD0\u7528\u548C\u5408\u5E86\uFF0C\u8336\u9152\u559C\u76F8\u8FCE\uFF0C\u6C42\u8C0B\u5E76\u5AC1\u5A36\uFF0C\u597D\u5408\u6709\u5929\u6210\uFF0C\u7978\u798F\u5982\u795E\u9A8C\uFF0C\u5409\u51F6\u751A\u5206\u660E\u3002"];
NineStar.LUCK_QI_MEN = ["\u5927\u51F6", "\u5927\u51F6", "\u5C0F\u5409", "\u5927\u5409", "\u5927\u5409", "\u5927\u5409", "\u5C0F\u51F6", "\u5C0F\u5409", "\u5C0F\u51F6"];
