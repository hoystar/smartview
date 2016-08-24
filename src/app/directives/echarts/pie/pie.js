"use strict";

require('./pie.less');

var moduleName = "app.pie";
var echarts = require('echarts');
require('echarts/theme/macarons.js');
var app = angular.module(moduleName,[]);

app.directive("pie",[
  function(){
    return {
      scope:{
        legend:"=",
        item:"=",
        data:"=",
        pieData:"=",
        title:"="
      },
      restrict: "E",
      replace: true,
      controller: [
      "$scope",
      function($scope){

      }],
      controllerAs: "pie",
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
            trigger: 'item',
            formatter:"{a}<br/>{b}:{c}({d}%)"
          },  
          legend: {  
            orient:'vertical',
            x:'left',
            data: $scope.item
          },  
          toolbox:{
            show:true,
            feature:{
              mark:{show:true},
              dataView:{show:true,readOnly:false},
              magicType:{
                show:true,
                type:['pie','funnel'],
                option:{
                  funnel:{
                    x:'25%',
                    funnelAlign:'left'
                  }
                }
              },
              restore:{show:true},
              saveAsImage:{show:true},
            },
            orient:'vertical',
            x:'right',
            y:'top'
          },
          calculable:true, 
          series:  $scope.legend.map(function(itemTemp,index){
                     return {
                        name: itemTemp,
                        type: 'pie',  
                        radius:'55%',
                        center:['50%','60%'],
                        data: $scope.pieData
                     };
                }) 
        };  
        var myChart = echarts.init($(element)[0],'macarons');
        myChart.setOption(option);
      },
      template: require('./pie.html')
    }
  }
  ])


module.exports = moduleName;