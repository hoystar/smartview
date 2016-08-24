"use strict";
let type = require("../process/type");
let moment = require("moment");

function InstanceUtil() {

}

InstanceUtil.prototype.toStatusDesc = function(statusCode) {
  statusCode = parseInt(statusCode);
  switch (statusCode) {
    case type.NOSTART:
      return "未开始";
      break;
    case type.WAITING:
      return "等待";
      break;
    case type.RUNNING:
      return "运行中";
      break;
    case type.PAUSE:
      return "暂停";
      break;
    case type.STOP:
      return "停止";
      break;
    case type.SUCCESS:
      return "成功";
      break;
    case type.FAILURE:
      return "失败";
      break;
    case type.TIMEOUT:
      return "超时";
      break;
  }
}

module.exports = new InstanceUtil();
