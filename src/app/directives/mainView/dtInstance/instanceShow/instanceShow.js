"use strict";
require('./instanceShow.less');
var echartsDataService = require("../../../../services/echartsDataService");
var HttpRequest = require("../../../../services/httpCenter/request");
let toast = require("../../../../services/toast/toast");
var ngTable = require('ng-table');
var _ = require("lodash");
var moduleName = "app.instanceShow";
var app = angular.module(moduleName, ["ngTable",
  require("../../../../directives/echarts/line/line"),
  require("../../../../directives/echarts/radar/radar"),
  require("../../../../directives/echarts/horizontalBar/horizontalBar"),
  require("../../../../directives/echarts/column/column"),
  require("../../../../directives/echarts/pie/pie"),
  require("../../../../directives/echarts/area/area"),
  require("../../../../directives/echarts/scatter/scatter")
]);
app.directive("instanceShow", [
  function() {
    return {
      restrict: "AE",
      replace: true,
      scope: {
        schedulerData: "="
      },
      controller: [
        "$scope",
        'NgTableParams',
        '$timeout',
        '$stateParams',
        function($scope, NgTableParams,$timeout,$stateParams) {
          let self = this;
          self.loading = true;
          var schedulerId = Number($scope.schedulerData.id);
          HttpRequest.GetDtInstanceResult({
            schedulerId: schedulerId
          }).then(function(data) {
            if(data){
              self.loading = false;
              if(!data.result){
                data.result = [];
              }
              self.dataTable = data.result;
              self.structure = data.structure;
              $scope.tableParams = new NgTableParams({
                page: 1,
                count: 11,
              }, {
                total: self.dataTable.length,
                getData: function($defer, params) {
                  $defer.resolve(self.dataTable.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                  params.total(self.dataTable.length);
                } 
              });
              self.MyStruct = self.structure.map(function(item) {
                return {
                  "name": item.name,
                  "column": item.column,
                  "isWd": false,
                  "isValue": false,
                  "type": 0,
                  "isFirst": false
                }
              });
              $scope.$digest();
            }else{
              toast('warning', '无执行结果！');
              self.loading = false;
              self.layout = false;
              return;
            }
          });
          var isFirstLength = 0;
          /**互斥事件**/
          $scope.$watch("show.MyStruct", function(newValue, oldValue) {
            if (newValue === null || newValue === undefined) return;
            if (oldValue === null || oldValue === undefined) return;
            newValue.forEach(function(item) {
              var olds = oldValue.filter((oldItem) => {
                return oldItem.name === item.name;
              });
              if (!olds || olds.length <= 0) return;
              var old = olds[0];
              var isChanged = false;
              if (item.isWd !== old.isWd || item.isValue !== old.isValue) {
                isChanged = true;
              }
              if (isChanged) {
                if (item.isWd !== old.isWd) {
                  if (old.isValue) {
                    item.isValue = item.isWd ? false : item.isValue;
                  }
                }
                if (item.isValue !== old.isValue) {
                  if (old.isWd) {
                    item.isWd = item.isValue ? false : item.isWd;
                  }
                }      
                if (item.isWd) {
                  item.type = 1;
                  if(isFirstLength===0){
                    item.isFirst = true;
                    isFirstLength++;
                  }
                }
                if (item.isFirst&&!item.isWd) {
                  if(isFirstLength!=0){
                    item.isFirst = false;
                    isFirstLength--;
                  }
                }
                if (item.isValue) {
                  item.type = 2;
                  delete item.dimType;
                }
                if (!item.isWd && !item.isValue) {
                  item.type = 0;
                  delete item.dimType;
                }
              }
            });
            /****计算维度和数值的长度****/
            this.dimensionLength = 0;
            this.measureLength = 0;
            newValue.forEach(function(item) {
              if (item.isWd) {
                this.dimensionLength++;
                if (item.isWd&&item.isFirst) {
                  item.dimType = "category";
                }else if(item.isWd&&isFirstLength===0){
                      item.dimType = "category";
                      item.isFirst = true;
                      isFirstLength++;
                    }else if(item.isWd&&!item.isFirst){
                    item.dimType = "series";
                  }
              }
              if (item.isValue) {
                this.measureLength++;
              }
            }.bind(this));
          }.bind(this), true);
          /*****处理源数据***/
          function handleDate() {
            var initDataObject = {};
            var struct = [];
            var dataArr = [];
            let _categoryArray  = self.MyStruct.filter((item)=>{
              return item.dimType === "category" && item.type === 1;
            });
            let _seriesArray  = self.MyStruct.filter((item)=>{
              return item.dimType === "series" && item.type === 1;
            });
            let _valueArray  = self.MyStruct.filter((item)=>{
              return item.isValue;
            });
            struct = struct.concat(_categoryArray).concat(_seriesArray).concat(_valueArray);
            if (!struct || struct.length > 0) {
              self.dataTable.map((item) => {
                var tempArr = [];
                struct.forEach(function(data, i) {
                  tempArr[i] = item[data.column];
                })
                dataArr.push(tempArr);
              });
            }
            initDataObject.struct = struct;
            initDataObject.data = dataArr;
            /****echarts数据渲染***/
            var _echartsDataService = new echartsDataService();
            var handleResultData = _echartsDataService._resolveInitData(initDataObject);
            var categoryName = [];
            var categoryArray = [];
            var seriesName = [[],[]];
            var seriesArray = [[],[]];
            var valueName = [[],[]];
            var valueArray = [[],[]];
            handleResultData.forEach((handleResultDataItem) => {
              let seriesLength = 0;
              let valueLength = 0;
              struct.forEach((structItem, structIndex) => { 
                if(structItem.dimType==="category" && structItem.type === 1){
                  categoryName.push(handleResultDataItem[structIndex].name);
                  categoryArray.push(handleResultDataItem[structIndex].values);
                }
                if(structItem.dimType==="series" && structItem.type === 1){
                  seriesName[seriesLength].push(handleResultDataItem[structIndex].name);
                  seriesArray[seriesLength].push(handleResultDataItem[structIndex].values);
                  seriesLength++;
                }
                if(structItem.type===2){
                  valueName[valueLength].push(handleResultDataItem[structIndex].name);
                  valueArray[valueLength].push(handleResultDataItem[structIndex].values);
                  valueLength++;
                }
              });
            });
            var legend = _.uniq([].concat(valueName[0]).concat(valueName[1]));
            /**对X轴数据进行去重处理**/
            var catagory = [];
            categoryArray.forEach((category) => {
              category.forEach((c) => {
                catagory.push(c);
              });
            });
            var categoryName = _.uniq(categoryName);
            var itemCategory = _.uniq(catagory);
            self.title = legend;
            self.item = itemCategory;  
            if(self.measureLength===0){
              let itemTemp = [];
              let dataTemp = [];
              let tempT = [];
              itemCategory.forEach((cName, iIdenx) => {
                itemTemp.push(cName.name);
                dataTemp.push(cName.value);
              });
              tempT.push(dataTemp);
              self.title = categoryName;
              self.item = itemTemp;
              self.data = tempT;
              self.legend = [categoryName];
              self.dataP = itemCategory;
            }
            if(self.measureLength===1){
              categoryArray.forEach((category, index) => {
                  itemCategory.forEach((c, iIdenx) => {
                    let i = category.indexOf(c);
                    if(i<0){
                      valueArray[0][index].splice(iIdenx,0,0);
                    }
                  });
              });
              self.categoryArray = categoryArray;
              self.data = valueArray[0];
              if (self.dimensionLength === 2) {
                self.stack = "";
                self.legend = seriesArray[0];
              }
              if (self.dimensionLength === 3) {
                self.legend = _.uniq(seriesArray[0]);
                self.stack = _.uniq(seriesName[0]);
              }else if(self.dimensionLength === 1){
                self.legend = legend;
                self.stack = "";
              }
            }
            if(self.measureLength===2){
                var scatterName = [];
                var scatterData = [];
                itemCategory.forEach((c, iIdenx) => {
                  var dd = new Array();
                  scatterName.push(c);
                  dd.push(valueArray[0][0][iIdenx]);
                  dd.push(valueArray[1][0][iIdenx]);
                  scatterData.push(dd);
                });
                self.legend = legend;
                self.scatterDatas = scatterData;
                self.scatterName = scatterName;
            }
          }
          this.showCondition = function() {
              this.showEchartDisabled();
              /****按钮全不可点击****/
              function radioDisabled() {
                self.pieIsDisabled = true;
                self.lineIsDisabled = true;
                self.horizontalBarIsDisabled = true;
                self.columnIsDisabled = true;
                self.areaIsDisabled = true;
                self.radarIsDisabled = true;
                self.scatterIsDisabled = true;
              }
              /****按钮全可点击****/
              function radioAbled() {
                self.pieIsDisabled = false;
                self.lineIsDisabled = false;
                self.horizontalBarIsDisabled = false;
                self.columnIsDisabled = false;
                self.areaIsDisabled = false;
                self.radarIsDisabled = false;
                self.scatterIsDisabled = false;
              }
              if (this.dimensionLength > 0) {
                if (this.measureLength > 2) {
                  toast('warning', '数值选择不能超过2个！');
                  return;
                } else if (this.dimensionLength > 2) {
                  toast('warning', '维度不能超过二个以上！');
                  radioDisabled();
                  return;
                } else if (this.measureLength === 2 && this.dimensionLength > 1) {
                  toast('warning', '两个数值的维度不能超过1个！！');
                  radioDisabled();
                  return;
                } else {
                  //满足条件选择
                  if (this.measureLength === 2 && this.dimensionLength === 1) {
                    //只能散点图可选  并且 dimension只能等于1
                    radioDisabled();
                    this.scatterIsDisabled = false;
                    this.showEchart("scatter");
                  } else if (this.measureLength === 1 && this.dimensionLength === 1) {
                    //除了散点图 ，其他图都可以
                    radioAbled();
                    this.scatterIsDisabled = true;
                    if (self.isChecked) {
                      if (self.isChecked == "scatter") {
                        toast('warning', '散点图不支持！');
                        return;
                      } else {
                        this.showEchart(self.isChecked);
                      }
                    }
                  } else if (this.measureLength < 1 && this.dimensionLength === 1) {
                    //除了饼图 ，其他图都不可以
                    radioAbled();
                    this.scatterIsDisabled = true;
                    if (self.isChecked) {
                      if (self.isChecked == "scatter") {
                        toast('warning', '散点图不支持！');
                        return;
                      } else {
                        this.showEchart(self.isChecked);
                      }
                    }
                  } else if (this.dimensionLength > 1) {
                    //除了散点图 pie图不能画，其他图都可以（ category 固定为X轴）
                    radioAbled();
                    this.pieIsDisabled = true;
                    this.scatterIsDisabled = true;
                    if (self.isChecked) {
                      if (self.isChecked == "pie") {
                        toast('warning', '饼图不支持！');
                        return;
                      } else if (self.isChecked == "scatter") {
                        toast('warning', '散点图不支持！');
                        return;
                      } else {
                        this.showEchart(self.isChecked);
                      }
                    }
                  }
                }
              } else {
                toast('warning', '必须选择一个维度！');
                return;
              }
            }
            /****图层全不显示****/
          this.showEchartDisabled = function() {
            self.showEchart.show_pie = false;
            self.showEchart.show_line = false;
            self.showEchart.show_column = false;
            self.showEchart.show_horizontalBar = false;
            self.showEchart.show_radar = false;
            self.showEchart.show_area = false;
            self.showEchart.show_scatter = false;
          }
          this.showEchart = function(tx) {
            this.showEchartDisabled();
            if (this.dimensionLength < 1) {
              toast('warning', '请选择一个维度！');
              return;
            }
            if (this.dimensionLength > 1&&this.measureLength < 1) {
              toast('warning', '请选择一个数值！');
              return;
            }
            if (tx == 'pie') {
              handleDate();
              if (this.measureLength > 0) {
                var data0 = [];
                for (var a = 0; a < this.data[0].length; a++) {
                  var temp = {};
                  temp.value = this.data[0][a];
                  temp.name = this.item[a];
                  data0.push(temp);
                  this.dataP = data0;
                }
              } else {
                this.dataP = self.dataP;
              }
              $timeout(setshowEchartStatusTimeout, 200);
              function setshowEchartStatusTimeout() {
                self.showEchart.show_pie = true;
              }
            }
            if (tx == 'line') {
              handleDate();
              $timeout(setshowEchartStatusTimeout, 200);
              function setshowEchartStatusTimeout() {
                self.showEchart.show_line = true;
              }
            }
            if (tx == 'column') {
              handleDate();
              $timeout(setshowEchartStatusTimeout, 200);
              function setshowEchartStatusTimeout() {
                self.showEchart.show_column = true;
              }
            }
            if (tx == 'horizontalBar') {
              handleDate();
              $timeout(setshowEchartStatusTimeout, 200);
              function setshowEchartStatusTimeout() {
                self.showEchart.show_horizontalBar = true;
              }
            }
            if (tx == 'radar') {
              handleDate();
              $timeout(setshowEchartStatusTimeout, 200);
              function setshowEchartStatusTimeout() {
                self.showEchart.show_radar = true;
              }
            }
            if (tx == 'area') {
              handleDate();
              $timeout(setshowEchartStatusTimeout, 200);
              function setshowEchartStatusTimeout() {
                self.showEchart.show_area = true;
              }
            }
            if (tx == 'scatter') {
              handleDate();
              this.legend = this.scatterName;
              this.data = this.scatterDatas;
              $timeout(setshowEchartStatusTimeout, 200);
              function setshowEchartStatusTimeout() {
                self.showEchart.show_scatter = true;
              }
            }
         }
        }
      ],
      controllerAs: "show",
      link: function(scope, element, attrs) {
      },
      template: require('./instanceShow.html')
    }
  }
])
module.exports = moduleName;