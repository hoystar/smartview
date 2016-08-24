"use strict";

function echartsDataService() {

}

echartsDataService.prototype._resolveInitData = function(obj) {
  var resolveData = {
    'categoryvalue':'',
    'series':[],
    'datas':[]
  };
  
  let categoryIndex = -1;
  let categoryName = '';
  for(var i=0;i<obj.struct.length;i++){
    var item = obj.struct[i];
    if(item.type === 1){
      if(item.dimType === "category"){
        categoryIndex = i;
        categoryName = item.name;        
      }else if(item.dimType === "series"){
        var seriesInfo = {
          'col':i,
          'name':item.name,
          'value':''
        };
        resolveData.series.push(seriesInfo);
      }
    }else{
      var data = {
        'name':item.name,
        'col':i,
        'value':0
      };
      resolveData.datas.push(data);
    }
  }  
  var dataValue = [];
  var dataMap = new Object();
  for(var i=0;i<obj.data.length;i++){
    var dataItem = obj.data[i];
    var dataItemCategory = dataItem[categoryIndex];
    var seriesKey = '';
    var seriesName = [];
    var seriesData = [];
    if(resolveData.series.length > 0){
      for(var k=0;k<resolveData.series.length;k++){
        seriesKey += resolveData.series[k].name+':'+dataItem[resolveData.series[k].col]+',';
        seriesName.push(dataItem[resolveData.series[k].col]);
        var seriesItem = {
            'col':resolveData.series[k].col,
            'name':resolveData.series[k].name,
            'value':dataItem[resolveData.series[k].col]
        };
        seriesData.push(seriesItem);        
      }
    }else{
        var dataV = {};
        var flag = false;
        dataValue.forEach((dItem) => {
           if(dItem.name === dataItemCategory){
              dItem.value ++;
              flag = true;
           }
        });
        if(!flag){
              dataV.name = dataItemCategory,
              dataV.value = 1
              dataValue.push(dataV);
        }
    }
      var key = dataItemCategory + '-' + seriesKey;
      if(dataMap[key]){
      let categoryData = dataMap[key];
      categoryData.datas = categoryData.datas.map(function(item) {
        var objItem = {
          'name':item.name,
          'col':item.col,
          'value':item.value
        };
        objItem.value += parseInt(dataItem[item.col]);
        return objItem;
      }); 
    }else{
      var newResolveData = {};
      $.extend(newResolveData,resolveData);
      newResolveData.categoryvalue = dataItemCategory;
      newResolveData.series = seriesData; 
      newResolveData.seriesKey = seriesKey;
      newResolveData.datas = newResolveData.datas.map(function(item) {
        var objItem = {
          'name':item.name,
          'col':item.col
        };
        objItem.value = parseInt(dataItem[item.col]);
        return objItem;
      }); 
      dataMap[key] = newResolveData;  
    }
  }
  if(newResolveData.series.length<1&&newResolveData.datas.length<1){
    return [[{"name":categoryName,"values":dataValue}]];
  }else{
    return this._groupBySeries(obj.struct,dataMap);
  }
  
}

echartsDataService.prototype._resolveResult = function(dataStruct,dataMap){
  var result = {};
  result = dataStruct.map(function(item) {
    var obj = {};
    obj.name = item.name;
    obj.series = [];
    obj.values = [];
    for(var key in dataMap){
      var resolveData = dataMap[key];
      $.extend(obj.series,resolveData.series);
      if(item.dimType === "category"){
        obj.values.push(resolveData.categoryvalue);
      }else if(item.dimType === "series"){
        resolveData.series.forEach((dataitem) => {
            if(obj.name === dataitem.name){
              obj.values.push(dataitem.value);
            }
        }); 
      }
      else{
        resolveData.datas.forEach((dataitem) => {
          if(obj.name === dataitem.name){
            obj.values.push(dataitem.value);
          }
        });        
      }
    }

    return obj;
  }); 
  return result;
}

echartsDataService.prototype._groupBySeries = function(dataStruct,dataMap){
  var result = [];
  var allSeries = [];
   for(var key in dataMap){
      var resolveData = dataMap[key];
      var seriesKey = resolveData.seriesKey;
      var isExist = false;

      allSeries.forEach((seriesitem) => {
        if(seriesitem == seriesKey){
          isExist = true;
        }
      });  

      if(!isExist){
        allSeries.push(seriesKey);
      }  
    }

  allSeries.forEach((seriesitem) => {
    var rstItem = {};

    rstItem = dataStruct.map(function(item) {
      var obj = {};
      obj.name = item.name;
      obj.seriesKey = seriesitem;
      obj.values = [];
      obj.series = [];

      for(var key in dataMap){
        var resolveData = dataMap[key];
        if(resolveData.seriesKey === seriesitem){
          $.extend(obj.series,resolveData.series);
          if(item.dimType === "category"){
            obj.values.push(resolveData.categoryvalue);
          }
          else if(item.dimType !== "series"){
              resolveData.datas.forEach((dataitem) => {
                if(obj.name === dataitem.name){
                  obj.values.push(dataitem.value);
                }
              });        
          }else if(item.dimType === "series"){
            resolveData.series.forEach((seriesItem)=> {
              if(seriesItem.name === obj.name){
                obj.values = seriesItem.value;
              }
            });
           } 
           let month = resolveData.categoryvalue;      
        }

      }
      return obj;
    }); 

    result.push(rstItem);
  });    

  return result;
}

echartsDataService.prototype.unique = function(arr) {
    var result = [],hash = {};
    for(var i=0,elem;(elem = arr[i])!=null;i++){
      if(!hash[elem]){
        result.push(elem);
        hash[elem] = true;
      }
    }
    return result;
}
echartsDataService.prototype.countObject = function(obj) {
    var count = 0;
    for(var property in obj){
      if(Object.prototype.hasOwnProperty.call(obj,property)){
        count++;
      }
    }
    return count;
}
echartsDataService.prototype.sortStrs = function(strs,sortType) {
    var temp="";
        var minIndex=0;
        var min="";
        for (var i=0;i<strs.length ;i++ ){
            minIndex=i;
            min=strs[i];
            for (var j=i;j<strs.length ;j++ ){
                if (sortType==undefined || sortType=='asc' || sortType=='') {//升序
                    if (strs[j].localeCompare(strs[minIndex])<0){
                        minIndex=j;
                        min=strs[j];
                    }
                }else if (sortType=='desc') {//倒序
                    if (strs[j].localeCompare(strs[minIndex])>0){
                        minIndex=j;
                        min=strs[j];
                    }
                }
            }
            if (minIndex!=i)    {
                temp=strs[i];
                strs[i]=strs[minIndex];
                strs[minIndex]=temp;
            }
      }
      return strs;
}
module.exports = echartsDataService;
