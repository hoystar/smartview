var moduleName = "app.widget.hoverTip";

require("../../../libs/jquery.fs.tipper/jquery.fs.tipper.min.js");
require("../../../libs/jquery.fs.tipper/jquery.fs.tipper.min.css");

angular.module(moduleName, [])
    .directive('htitle', [function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var htitleshow = attrs.htitileshow;
                var config = {
                    formatter: function(data) {
                        return data.$target.attr("htitle");
                    },
                    horiOffset: attrs["htitleOffset"] ? attrs["htitleOffset"] : "right"
                };
                if (attrs['htitleDirection']) {
                    config.direction = attrs['htitleDirection'];
                }
                $(element).tipper(config);
                var offwatch = scope.$watch(attrs.htitleshow, function(d) {
                    if (d === false) {
                        element.tipper('destroy');
                    }
                    offwatch();
                });


                element.one('$destroy', function() {
                    element.tipper("destroy");
                })

            }
        }
    }]);

module.exports = moduleName;
