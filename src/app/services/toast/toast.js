var noty = require("noty");
/*
 *type:alert,success,error,warning,infomation,confirm
 *callback:点击关闭后的回调执行
 */
function toast(type, message, callback) {
  var n = noty({
    layout: 'topCenter',
    theme: 'relax',
    text: message,
    type: type,
    animation: {
      open: {
        height: 'toggle'
      }, // jQuery animate function property object
      close: {
        height: 'toggle'
      }, // jQuery animate function property object
      easing: 'swing', // easing
      speed: 500 // opening & closing animation speed
    },
    callback: {
      onShow: function() {},
      afterShow: function() {
        setTimeout(function() {
          n.close();
        }, 3000);
      },
      onClose: function() {},
      afterClose: function() {},
      onCloseClick: function() {
        callback && callback();
      },
    }
  });
}
module.exports = toast;
