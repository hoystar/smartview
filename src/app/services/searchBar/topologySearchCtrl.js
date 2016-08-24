"use strict";

class topologySearchCtrl {
  constructor() {
    this.cache = [];
  }
  setData(data) {
    this.cache = data;
  }
  search(keyword) {
    keyword = keyword.toLocaleLowerCase();
    let result = [];
    for (let i = 0; i < this.cache.length && result.length < 20; i++) {
      if (this.cache[i].n.toLocaleLowerCase().indexOf(keyword) !== -1) {
        result.push(this.cache[i]);
      }
      if (this.cache[i].d && this.cache[i].d.toLocaleLowerCase().indexOf(keyword) !== -1) {
        result.push(this.cache[i]);
      }
    }
    return result;
  }
}

module.exports = new topologySearchCtrl();
