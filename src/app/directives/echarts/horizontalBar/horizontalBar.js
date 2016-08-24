"use strict";

require('./horizontalBar.less');

var moduleName = "app.horizontalBar";
var echarts = require('echarts');
require('echarts/theme/macarons.js');
var app = angular.module(moduleName,[]);

app.directive("horizontalBar",[
  function(){
    return {
      restrict: "AE",
      replace: true,
      controller: [
      "$scope",
      function($scope){

      }],
      scope: {   
        legend: "=",  
        item: "=", 
        title: "=",  
        data: "=",
        stack: "="  
      },
      controllerAs: "horizontalBar",
      link: function($scope,element,attrs,controller){
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
            trigger: "axis"  
          },  
          legend: {
            data:$scope.legend,
            x:'left'
          },  
          toolbox:{
            show:true,
            feature:{
              mark:{show:true},
              dataView:{show:true,readOnly:false},
              magicType:{show:true,type:['line','bar','pie']},
              restore:{show:true},
              saveAsImage:{show:true}
            },
            orient:'vertical',
            x:'right',
            y:'top'
          },
          grid:{
            x:'12%'
          },
          xAxis: [{  
            type: 'value'  
          }],  
          yAxis: [{  
            type: 'category',  
            data: $scope.item,
            axisLabel:{
              interval:0
            }, 
          }],  
          series: $scope.legend.map(function(itemTemp,index){
              return {  
                name: itemTemp,  
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
                }
              }
            })
        };
          var myChart = echarts.init($(element)[0],'macarons');
          myChart.setOption(option); 
        },
        template: require('./horizontalBar.html')
      }
    }
    ])


module.exports = moduleName;