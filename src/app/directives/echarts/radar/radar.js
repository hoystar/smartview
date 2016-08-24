"use strict";

require('./radar.less');

var moduleName = "app.radar";
var echarts = require('echarts');
require('echarts/theme/macarons.js');
var app = angular.module(moduleName,[]);

app.directive("radar",[
  function(){
    return {
      restrict: "E",
      replace: true,
      controller: [
      "$scope",
      function($scope){
      }],
      scope: { 
        legend: "=",  
        item: "=",  
        max: "=",  
        data: "=",
        title:'='  
      }, 
      controllerAs: "radar",
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
                    trigger: 'item'
                  },  
                  legend: {  
                    orient: 'vertical',   
                    x:'left',  
                    data: $scope.legend  
                  },  
                  toolbox:{
                    show:true,
                    feature:{
                      mark:{show:true},
                      dataView:{show:true,readOnly:false},
                      restore:{show:true},
                      saveAsImage:{show:true}
                    },
                    orient:'vertical',
                    x:'right',
                    y:'top'
                  },
                  polar: [{
                    name:{
                      show:true,
                      textStyle:{
                        color:'#333'
                      }
                    },
                    indicator: function(){  
                      var indicator = [];  
                                  return $scope.item.map(function(item){
                                      return {text:item};
                                  })
                            }()  
                      }],  
                      calculable:true,
                      series: [{  
                            type: 'radar',  
                            data: $scope.legend.map(function(itemTemp,index){
                                 return {
                                   name: itemTemp,  
                                   value: $scope.data[index]  
                                 };
                            }) 
                        }]  
                      }; 
                      var myChart = echarts.init($(element)[0],'macarons');
                      myChart.setOption(option);  
                    },
                    template: require('./radar.html')
                  }
                }
          ])


module.exports = moduleName;