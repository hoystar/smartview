"use strict";

require('./scatter.less');

var moduleName = "app.scatter";
var echarts = require('echarts');
require('echarts/theme/macarons.js');
var app = angular.module(moduleName,[]);

app.directive("scatter",[
  function(){
    return {
      scope:{
        legend:"=",
        data:"=",
        title:'='
      },
      restrict: "AE",
      replace: true,
      controller: [
      "$scope",
      function($scope){

      }],
      controllerAs: "scatter",
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
                    trigger: 'axis',
                    showDelay:0,
                    formatter:function(params){
                      if(params.value.length>1){
                        return params.seriesName+':<br/>'
                              +$scope.title[0]+":"+params.value[0]+","
                              +$scope.title[1]+":"+params.value[1];
                      }else{
                        return params.seriesName+':<br/>'
                              +params.name+':'
                              +params.value;
                      }
                    },
                    axisPointer:{
                      show:true,
                      type:'cross',
                      lineStyle:{
                        type:'dashed',
                        width:1
                      }
                    }
                  }, 
                legend: {  
                  data: $scope.legend,
                  x:'left'
                },  
                toolbox:{
                  show:true,
                  feature:{
                    mark:{show:true},
                    dataZoom:{show:true},
                    dataView:{show:true,readOnly:false},
                    restore:{show:true},
                    saveAsImage:{show:true}
                  },
                  orient:'vertical',
                  x:'right',
                  y:'top'
                },
                xAxis: [{  
                  type: 'value',  
                  scale:true,
                  axisLable:{
                    formatter:'{value}'
                  }
                }],
                yAxis: [{  
                  type: 'value',
                  scale:true,
                  axisLable:{
                    formatter:'{value}'
                  }  
                }], 
                series: $scope.legend.map(function(itemTemp,index){
                    return {  
                        name : itemTemp,  
                        type: 'scatter',  
                        data: [$scope.data[index]],
                        symbolSize:20
                      }
                  })
              };  
              var myChart = echarts.init($(element)[0],'macarons');
              myChart.setOption(option);
      },
      template: require('./scatter.html')
    }
  }
])


module.exports = moduleName;