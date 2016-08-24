"use strict";

require('./column.less');

var moduleName = "app.column";

var echarts = require('echarts');
require('echarts/theme/macarons.js');

var app = angular.module(moduleName,[]);

app.directive("column",[
  function(){
    return {
      scope:{
        legend:"=",
        item:"=",
        data:"=",
        title:'=',
        stack:"="
      },
      restrict: "AE",
      replace: true,
      controller: [
      "$scope",
      function($scope){

      }],
      controllerAs: "column",
      link: function($scope,element,attrs,controller){
        var echartElement=$(element)[0];
        var gridRightElement=$('div.grid-right')[0];
        echartElement.style.width = gridRightElement.offsetWidth-20+"px"; 
        echartElement.style.height = gridRightElement.offsetHeight-80+"px";
        let stringLength = $scope.item.toString().length;
        var conversionAngle = 0;
        if(stringLength>50){
          conversionAngle = -90;
        }else{
          conversionAngle = 0;
        } 
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
                    magicType:{show:true,type:['line','bar']},
                    restore:{show:true},
                    saveAsImage:{show:true}
                  },
                  orient:'vertical',
                  x:'right',
                  y:'top'
                },
                calculable:true,
                grid:{
                  y2:'20%'
                },
                xAxis: [{  
                  type: 'category',
                  axisLabel:{
                    interval:0,
                    rotate:conversionAngle
                  },
                  data: $scope.item
                }],
                yAxis: [{  
                  type: 'value'  
                }],
                series: $scope.legend.map(function(itemTemp,index){
                    return {  
                      name : itemTemp,  
                      type: 'bar',
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
                      },
                      markLine:{
                        data:[
                          {type:'average',name:'平均值'}
                        ]
                      }
                    }
                  })
              };  
              var myChart = echarts.init($(element)[0],'macarons');
              myChart.setOption(option);

      },
      template: require('./column.html')
    }
  }
])


module.exports = moduleName;