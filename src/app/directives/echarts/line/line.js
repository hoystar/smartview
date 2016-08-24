"use strict";

require('./line.less');

var moduleName = "app.line";
var echarts = require('echarts');
require('echarts/theme/macarons.js');
var app = angular.module(moduleName,[]);

app.directive("line",[function(){
  return {
    scope:{
      legend:"=",
      item:"=",
      data:"=",
      title:"=",
      stack:"="
    },
    restrict: "AE",
    replace: true,
    controller: [
    "$scope",
    function($scope){

    }],
    controllerAs: "line",
    link: function($scope,element,attrs,controller){
      let stringLength = $scope.item.toString().length;
      var conversionAngle = 0;
      if(stringLength>50){
        conversionAngle = -90;
      }else{
        conversionAngle = 0;
      }
      var echartElement=$(element)[0];
      var gridRightElement=$('div.grid-right')[0];
      echartElement.style.width = gridRightElement.offsetWidth-20+"px"; 
      echartElement.style.height = gridRightElement.offsetHeight-80+"px";
      var option = { 
                title:{
                  text:$scope.title,
                  x:'center',
                  y:'bottom'
                },
                tooltip: {  
                  show: true,  
                    trigger: 'axis'
                  },  
                legend: {  
                  data: $scope.legend,
                  x:'left'
                },  
                toolbox:{
                  show:true,
                  feature:{
                    mark:{show:true},
                    dataView:{show:true,readOnly:false},
                    magicType:{show:true,type:['line','bar','stack','pie']},
                    restore:{show:true},
                    saveAsImage:{show:true}
                  },
                  orient:'vertical',
                  x:'right',
                  y:'top'
                },
                grid:{
                  y2:'20%'
                },
                xAxis: [{  
                  type: 'category',  
                  data: $scope.item,
                  axisLabel:{
                    interval:0,
                    rotate:conversionAngle
                  },
                }],
                yAxis: [{  
                  type: 'value'  
                }], 
                series: $scope.legend.map(function(itemTemp,index){
                     return {  
                      name : itemTemp,  
                      type: 'line', 
                      stack:$scope.stack, 
                      data: $scope.data[index],
                      markPoint:{
                        data:[
                          {type:'max',name:'最大值'},
                          {type:'min',name:'最小值'}
                        ],
                        itemStyle:{ 
                          normal: {
                            label :{
                              textStyle:{color:'#208d8e'}
                            }
                          }
                        }
                      }
                    };
                  })
              };  
              var myChart = echarts.init($(element)[0],'macarons');
              myChart.setOption(option);
            },
            template: require('./line.html')
          }
        }
        ])


module.exports = moduleName;