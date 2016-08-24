"use strict";
/**
 * forked from https://github.com/angular-ui/bootstrap/tree/master/src/modal
 * 文档参考：http://angular-ui.github.io/bootstrap/#/modal
 * 不同点：不支持 backdrop， backdropClass，windowClass， windowTemplateUrl， size 几个配置选项
 * 添加了 closable 的支持，默认为  true
 * 添加了 enterTriggerEl 的支持，传一个 selector , 当按下回车时，会自动触发该节点的 click 事件
 */

require("./modal.less");

var moduleName = 'app.unPopModal.modal';

angular.module(moduleName, [])

/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
.factory('$$unPopStackedMap', function() {
  return {
    createNew: function() {
      var stack = [];

      return {
        add: function(key, value) {
          stack.push({
            key: key,
            value: value
          });
        },
        get: function(key) {
          for (var i = 0; i < stack.length; i++) {
            if (key == stack[i].key) {
              return stack[i];
            }
          }
        },
        keys: function() {
          var keys = [];
          for (var i = 0; i < stack.length; i++) {
            keys.push(stack[i].key);
          }
          return keys;
        },
        top: function() {
          return stack[stack.length - 1];
        },
        remove: function(key) {
          var idx = -1;
          for (var i = 0; i < stack.length; i++) {
            if (key == stack[i].key) {
              idx = i;
              break;
            }
          }
          return stack.splice(idx, 1)[0];
        },
        removeAll: function() {
          stack = [];
          return stack;
        },
        removeTop: function() {
          return stack.splice(stack.length - 1, 1)[0];
        },
        length: function() {
          return stack.length;
        }
      };
    }
  };
})

.directive('unPopModalTransclude', function() {
  return {
    link: function($scope, $element, $attrs, controller, $transclude) {
      $transclude($scope.$parent, function(clone) {
        $element.empty();
        $element.append(clone);
      });
    }
  };
})

.factory('$unPopModalStack', ['$timeout', '$document', '$compile', '$rootScope', '$$unPopStackedMap',
  function($timeout, $document, $compile, $rootScope, $$unPopStackedMap) {

    var OPENED_MODAL_CLASS = 'modal-open';

    var openedWindows = $$unPopStackedMap.createNew();
    var $unPopModalStack = {};

    function findMaxZIndex(target) {
      var maxIndex = 0;

      function find(dom) {
        dom = $(dom);
        var index = dom.css("z-index");
        if (index !== "auto") {
          maxIndex = maxIndex > parseInt(index) ? maxIndex : parseInt(index);
        }
        var parent = dom.parent();
        if (parent.is("body") || parent.length === 0) {
          return;
        } else {
          find(parent);
        }
      }
      find(target);
      return maxIndex;
    }

    function _initEvents(modal, upPopModalIndex) {
      $document.on("click.unPopModal", function(event) {
        if (findMaxZIndex(event.target) < upPopModalIndex) {
          $unPopModalStack.dismissWithAnimation(false);
        }
      });
    }

    function _removeEvents() {
      $document.off("click.unPopModal");
    }

    function _removeAllUnPopModal() {
      var _keys = openedWindows.keys();
      _keys.forEach(function(key) {
        var _modalWindow = openedWindows.remove(key).value;
        _modalWindow.modalDomEl.remove();
      });
    }

    $unPopModalStack.open = function(modalInstance, modal) {
      if (openedWindows.get(modalInstance.key)) {
        return;
      }
      $unPopModalStack.dismissAll();
      openedWindows.add(modalInstance.key, {
        deferred: modal.deferred,
        modalScope: modal.scope,
        keyboard: modal.keyboard,
        enterTriggerEl: modal.enterTriggerEl
      });
      var modalDomEl = $compile(modal.content.trim())(modal.scope);
      openedWindows.top().value.modalDomEl = modalDomEl;
      _initEvents(modalDomEl, modalInstance.zIndex);
      $(modalDomEl).css("z-index", modalInstance.zIndex)
        .find(".unpop-modal-close-btn")
        .click($unPopModalStack.close);
      modalInstance.element = modalDomEl;
      //append进#main
      $("#right-box").append(modalDomEl);
      modalDomEl.on("$destroy", function() {
        modal.scope.$destroy();
      })
    };

    //以后这里需要支持打开多个unPopModal
    $unPopModalStack.close = function(modalInstance, result) {
      var modalWindow = openedWindows.top();
      if (modalWindow) {
        modalWindow.value.deferred.resolve(result);
        var modalDomEl = modalWindow.value.modalDomEl;
        modalDomEl.animate({ "right": "-600px" }, 500, function() {
          $unPopModalStack.dismissAll();
        });
      }
    };

    $unPopModalStack.dismiss = function(modalInstance, reason) {
      var modalWindow = openedWindows.top();
      if (modalWindow) {
        modalWindow.value.deferred.reject(reason);
        $unPopModalStack.dismissAll();
      }
    };

    $unPopModalStack.dismissAll = function(reason) {
      var modalWindow = openedWindows.top();
      if (modalWindow) {
        modalWindow.value.deferred.reject(reason);
        _removeAllUnPopModal();
        _removeEvents();
      }
    };

    $unPopModalStack.dismissWithAnimation = function(reason) {
      var modalWindow = $unPopModalStack.getTop();
      if (modalWindow) {
        modalWindow.value.deferred.reject(reason);
        var modalDomEl = modalWindow.value.modalDomEl;
        modalDomEl.animate({ "right": "-600px" }, 500, function() {
          $unPopModalStack.dismissAll();
        });
      }
    }

    $unPopModalStack.getTop = function() {
      return openedWindows.top();
    };

    return $unPopModalStack;
  }
])

.provider('$unPopModal', function() {

  var $modalProvider = {
    options: {
      keyboard: true,
      closable: true,
      enterTriggerEl: ''
    },
    $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$unPopModalStack',
      function($injector, $rootScope, $q, $http, $templateCache, $controller, $unPopModalStack) {

        var $modal = {};

        function getTemplatePromise(options) {
          return options.template ? $q.when(options.template) :
            $http.get(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl, { cache: $templateCache }).then(function(result) {
              return result.data;
            });
        }

        function getResolvePromises(resolves) {
          var promisesArr = [];
          angular.forEach(resolves, function(value) {
            if (angular.isFunction(value) || angular.isArray(value)) {
              promisesArr.push($q.when($injector.invoke(value)));
            }
          });
          return promisesArr;
        }

        $modal.dismissAll = $unPopModalStack.dismissAll;
        $modal.dismissWithAnimation = $unPopModalStack.dismissWithAnimation;

        $modal.open = function(modalOptions) {

          var modalResultDeferred = $q.defer();
          var modalOpenedDeferred = $q.defer();

          //prepare an instance of a modal to be injected into controllers and returned to a caller
          var modalInstance = {
            result: modalResultDeferred.promise,
            opened: modalOpenedDeferred.promise,
            key: modalOptions.key,
            close: function(result) {
              $unPopModalStack.close(modalInstance, result);
            },
            dismiss: function(reason) {
              $unPopModalStack.dismiss(modalInstance, reason);
            },
            zIndex: modalOptions.zIndex || 100
          };

          //merge and clean up options
          modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
          modalOptions.resolve = modalOptions.resolve || {};

          //verify options
          if (!modalOptions.template && !modalOptions.templateUrl) {
            throw new Error('One of template or templateUrl options is required.');
          }

          var templateAndResolvePromise =
            $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));


          templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

            var modalScope = (modalOptions.scope || $rootScope).$new();
            modalScope.$close = modalInstance.close;
            modalScope.$dismiss = modalInstance.dismiss;

            var ctrlInstance, ctrlLocals = {};
            var resolveIter = 1;

            //controllers
            if (modalOptions.controller) {
              ctrlLocals.$scope = modalScope;
              ctrlLocals.$modalInstance = modalInstance;
              angular.forEach(modalOptions.resolve, function(value, key) {
                ctrlLocals[key] = tplAndVars[resolveIter++];
              });

              ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
              if (modalOptions.controllerAs) {
                modalScope[modalOptions.controllerAs] = ctrlInstance;
              }
            }

            $unPopModalStack.open(modalInstance, {
              scope: modalScope,
              deferred: modalResultDeferred,
              content: tplAndVars[0],
              keyboard: modalOptions.keyboard,
              closable: modalOptions.closable,
              enterTriggerEl: modalOptions.enterTriggerEl,
              size: modalOptions.size
            });

          }, function resolveError(reason) {
            modalResultDeferred.reject(reason);
          });

          templateAndResolvePromise.then(function() {
            modalOpenedDeferred.resolve(true);
          }, function() {
            modalOpenedDeferred.reject(false);
          });

          return modalInstance;
        };

        return $modal;
      }
    ]
  };

  return $modalProvider;
});

module.exports = moduleName;
