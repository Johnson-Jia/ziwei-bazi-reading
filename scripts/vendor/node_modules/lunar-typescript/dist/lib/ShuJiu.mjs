export class ShuJiu {
  constructor(name, index) {
    this._name = name;
    this._index = index;
  }
  getName() {
    return this._name;
  }
  setName(name) {
    this._name = name;
  }
  getIndex() {
    return this._index;
  }
  setIndex(index) {
    this._index = index;
  }
  toString() {
    return this.getName();
  }
  toFullString() {
    return this.getName() + "\u7B2C" + this.getIndex() + "\u5929";
  }
}
