var moduleName = "app.widget.searchbarHoverTip";

require("../../../libs/jquery.fs.tipper/jquery.fs.tipper.min.js");
require("../../../libs/jquery.fs.tipper/jquery.fs.tipper.min.css");
require("./searchbarHoverTip.less");

angular.module(moduleName, [])
    .directive('sHtitle', [function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var htitleshow = attrs.shtitileshow;
                let keyword = attrs.skeyword;
                var config = {
                    formatter: function(data) {
                        let htmlStr = "";
                        try {
                            var obj = JSON.parse(data.$target.attr("s-htitle"));
                        } catch (e) {
                            console.log(e);
                        }
                        if (obj.name) {
                            let name = obj.name.replace(keyword, function(match) {
                                return "<span class='red'>" + match + "</span>";
                            });
                            htmlStr += "<p class='title-row'>名字: " + name + "</p>";
                        }
                        if (obj.description) {
                            let description = obj.description.replace(keyword, function(match) {
                                return "<span class='red'>" + match + "</span>";
                            });
                            htmlStr += "<p class='title-row'>描述: " + description + "</p>";
                        }
                        return htmlStr;
                    },
                    horiOffset: attrs["shtitleOffset"] ? attrs["shtitleOffset"] : "right"
                };
                if (attrs['shtitleDirection']) {
                    config.direction = attrs['shtitleDirection'];
                }
                $(element).tipper(config);
                var offwatch = scope.$watch(attrs.shtitileshow, function(d) {
                    if (d === false) {
                        element.tipper('destroy');
                    }
                    offwatch();
                });
                //测试使用代码
                // setTimeout(function() {
                //     var e = $.Event('mouseenter');
                //     e.pageX = 50;
                //     e.pageY = 50;
                //     $(element).trigger(e);
                // }, 2000);

                element.one('$destroy', function() {
                    $(element).tipper("destroy");
                })

            }
        }
    }]);

module.exports = moduleName;
