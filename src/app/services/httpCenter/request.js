"use strict";

var Url = require("./url");

let toast = require("../toast/toast");
import ERRORCODE from "./errorCode";

function HttpRequest() {
  this.isLogining = false;
}

HttpRequest.prototype._getData = function(params) {
  let self = this;

  if (params.method === "POST") {
    params.dataType = params.dataType || "JSON";
    params.contentType = params.contentType || "application/json; charset=utf-8";
    params.data = JSON.stringify(params.data);
  }

  return new Promise(function(resolve, reject) {
    $.ajax(params).then(function(data) {
      if (data.errorCode === ERRORCODE.SUCCESS) {
        resolve(data.data);
      } else {
        switch (data.errorCode) {
          case ERRORCODE.NOT_LOGIN:
            if (!self.isLogining) {
              self.isLogining = true;
              toast('warning', '登陆信息失效,请点击登陆！', function() {
                window.open("https:/account.aliyun.test");
              });
            }
            // hack
            setTimeout(function() {
              self.isLogining = false;
            }, 3000);
            break;
          default:
            toast('warning', data.errorMessage);
            break;
        }
        reject(data);
      }

    });
  });
}

HttpRequest.prototype.ListEntities = function(params) {
  var url = $.extend(true, {}, Url.ListEntities);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetPartitionInfo = function(params) {
  var url = $.extend(true, {}, Url.GetPartitionInfo);
  return this._getData($.extend({}, url, {
    data: params
  }));
}


HttpRequest.prototype.ListLinks = function(params) {
  var url = $.extend(true, {}, Url.ListLinks);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.SearchMarkedTagDomains = function(params) {
  var url = $.extend(true, {}, Url.SearchMarkedTagDomains);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.CreateCanvas = function(params) {
  var url = $.extend(true, {}, Url.CreateCanvas);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.CreateDataSource = function(params) {
  var url = $.extend(true, {}, Url.CreateDataSource);
  return this._getData($.extend({}, url, {
    data: params
  }));
}
HttpRequest.prototype.DeleteDataSource = function(params) {
  var url = $.extend(true, {}, Url.DeleteDataSource);
  url.url = url.url.replace("{dsId}", params.dsId);
  return this._getData($.extend({}, url));
}
HttpRequest.prototype.CanvasList = function(params) {
  var url = $.extend(true, {}, Url.CanvasList);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.getCanvas = function(params) {
  var url = $.extend(true, {}, Url.GetCanvas);
  url.url = url.url.replace("{canvasId}", params.id);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.findElements = function(params) {
  var url = $.extend(true, {}, Url.FindElement);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.UpdateDataSource = function(params) {
  var url = $.extend(true, {}, Url.UpdateDataSource);
  url.url = url.url.replace("{dsId}", params.dsId);
  return this._getData($.extend({}, url,{
    data:params
  }));
}

HttpRequest.prototype.GetDataSourceInfo = function(params) {
  var url = $.extend(true, {}, Url.GetDataSourceInfo);
  url.url = url.url.replace("{dsId}", params.dsId);
  return this._getData($.extend({}, url,{
    data:params
  }));
}

HttpRequest.prototype.saveCanvas = function(params) {
  var url = $.extend(true, {}, Url.SaveCanvas);
  url.url = url.url.replace("{canvasId}", params.canvasId);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.updateCanvas = function(params) {
  var url = $.extend(true, {}, Url.UpdateCanvas);
  url.url = url.url.replace("{canvasId}", params.canvasId);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.DeleteCanvas = function(params) {
  var url = $.extend(true, {}, Url.DeleteCanvas);
  url.url = url.url.replace("{canvasId}", params.canvasId);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetCanvasInfo = function(params) {
  var url = $.extend(true, {}, Url.GetCanvasInfo);
  url.url = url.url.replace("{canvasId}", params.canvasId);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.detectEntity = function(params) {
  var url = $.extend(true, {}, Url.DetectEntity);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.getTag = function(params) {
  var url = $.extend(true, {}, Url.GetTag);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.getEntityDetail = function(params) {
  var url = $.extend(true, {}, Url.GetEntityDetail);
  url.url = url.url.replace("{domainCode}", params.code);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.GetLinkDetail = function(params) {
  var url = $.extend(true, {}, Url.GetLinkDetail);
  url.url = url.url.replace("{domainCode}", params.code);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.GetERTagDetail = function(params) {
  var url = $.extend(true, {}, Url.GetERTagDetail);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetTagStructDetail = function(params) {
  var url = $.extend(true, {}, Url.GetTagStructDetail);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.getTagDetail = function(params) {
  var url = $.extend(true, {}, Url.getTagDetail);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetDomainField = function(params) {
  var url = $.extend(true, {}, Url.GetDomainField);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetCategories = function(params) {
  var url = $.extend(true, {}, Url.GetCategories);
  url.url = url.url.replace("{categoryId}", params.categoryId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.GetResDsType = function() {
  return this._getData($.extend({}, Url.GetResDsType));
}

HttpRequest.prototype.GetProject = function(params) {
  var url = $.extend(true, {}, Url.GetProject);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetTable = function(params) {
  var url = $.extend(true, {}, Url.GetTable);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetRecommend = function(params) {
  var url = $.extend(true, {}, Url.GetRecommend);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetTopSubject = function(params) {
  var url = $.extend(true, {}, Url.GetTopSubject);
  url.url = url.url.replace("{workspaceId}", params.workspaceId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.UpdateTopSubjectContent = function(params) {
  var url = $.extend(true, {}, Url.UpdateTopSubjectContent);
  url.url = url.url.replace("{workspaceId}", params.workspaceId);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetBosList = function(params) {
  var url = $.extend(true, {}, Url.GetBosList);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetFolderLoad = function(params) {
  var url = $.extend(true, {}, Url.GetFolderLoad);
  url.url = url.url.replace("{folderId}", params.folderId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.GetFolderInfo = function(params) {
  var url = $.extend(true, {}, Url.GetFolderInfo);
  url.url = url.url.replace("{folderId}", params.folderId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.CreateFolderViaJson = function(params) {
  var url = $.extend(true, {}, Url.CreateFolderViaJson);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.CreateFolderViaForm = function(params) {
  var url = $.extend(true, {}, Url.CreateFolderViaForm);
  return this._getData($.extend({}, url, {
    data: params,
    contentType: "multipart/form-data; charset=utf-8"
  }));
}

HttpRequest.prototype.UpdateFolderViaJson = function(params) {
  var url = $.extend(true, {}, Url.UpdateFolderViaJson);
  url.url = url.url.replace("{folderId}", params.folderId);
  return this._getData($.extend({}, url, {
    data: params
  }));
}
HttpRequest.prototype.DeleteFolderViaJson = function(params) {
  var url = $.extend(true, {}, Url.DeleteFolderViaJson);
  url.url = url.url.replace("{folderId}", params.folderId);
  return this._getData($.extend({}, url, {
    data: params
  }));
}


HttpRequest.prototype.UpdateFolderViaForm = function(params) {
  var url = $.extend(true, {}, Url.UpdateFolderViaForm);
  return this._getData($.extend({}, url, {
    data: params,
    contentType: "multipart/form-data; charset=utf-8"
  }));
}

HttpRequest.prototype.GetBloodLineParent = function(params) {
  var url = $.extend(true, {}, Url.GetBloodLineParent);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetTableDetail = function(params) {
  var url = $.extend(true, {}, Url.GetTableDetail);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetBloodInfo = function(params) {
  var url = $.extend(true, {}, Url.GetBloodInfo);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetTableBlood = function(params) {
  var url = $.extend(true, {}, Url.GetTableBlood);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetDataSources = function(params) {
  var url = $.extend(true, {}, Url.GetDataSources);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetDsTypeDetails = function(params) {
  var url = $.extend(true, {}, Url.GetDsTypeDetails);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetTableGraph = function(params) {
  var url = $.extend(true, {}, Url.GetTableGraph);
  url.url = url.url.replace("{dsId}", params.dsId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.GetTableSumInfo = function(params) {
  var url = $.extend(true, {}, Url.GetTableSumInfo);
  url.url = url.url.replace("{dsId}", params.dsId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.GetRecommendCanvas = function(params) {
  var url = $.extend(true, {}, Url.GetRecommendCanvas);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetRecommendCanvasInfo = function(params) {
  var url = $.extend(true, {}, Url.GetRecommendCanvasInfo);
  url.url = url.url.replace("{cavansId}", params.cavansId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.GetRecommendExpore = function(params) {
  var url = $.extend(true, {}, Url.GetRecommendExpore);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetLoginUser = function(params) {
  var url = $.extend(true, {}, Url.GetLoginUser);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.GetCmSearch = function(params) {
  var url = $.extend(true, {}, Url.GetCmSearch);
  url.url = url.url.replace("{keyword}", params.keyword);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.GetDtDefine = function(params) {
  var url = $.extend(true, {}, Url.GetDtDefine);
  url.url = url.url.replace("{defineId}", params.defineId);
  return this._getData($.extend({}, url));
}
HttpRequest.prototype.DeleteDtDefine = function(params) {
  var url = $.extend(true, {}, Url.DeleteDtDefine);
  url.url = url.url.replace("{defineId}", params.defineId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.LoadGraphByDefineId = function(params) {
  var url = $.extend(true, {}, Url.LoadGraphByDefineId);
  url.url = url.url.replace("{defineId}", params.defineId);
  return this._getData($.extend({}, url));
}
HttpRequest.prototype.LoadGraphByInstanceId = function(params) {
  var url = $.extend(true, {}, Url.LoadGraphByInstanceId);
  url.url = url.url.replace("{instanceId}", params.instanceId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.LoadGraphBySchedulerId = function(params) {
  var url = $.extend(true, {}, Url.LoadGraphBySchedulerId);
  url.url = url.url.replace("{schedulerId}", params.schedulerId);
  return this._getData($.extend({}, url));
}


HttpRequest.prototype.GetDtInstance = function(params) {
  var url = $.extend(true, {}, Url.GetDtInstance);
  url.url = url.url.replace("{instanceId}", params.instanceId);
  return this._getData($.extend({}, url));
}
HttpRequest.prototype.GetDtScheduler = function(params) {
  var url = $.extend(true, {}, Url.GetDtScheduler);
  url.url = url.url.replace("{schedulerId}", params.schedulerId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.CreateDetect = function(params) {
  var url = $.extend(true, {}, Url.CreateDetect);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetDtSchedulerStatus = function(params) {
  var url = $.extend(true, {}, Url.GetDtSchedulerStatus);
  url.url = url.url.replace("{schedulerId}", params.schedulerId);
  return this._getData($.extend({}, url));
}

/****获取透视结果***/
HttpRequest.prototype.GetDtInstanceResult = function(params) {
    var url = $.extend(true, {}, Url.GetDtInstanceResult);
    url.url = url.url.replace("{schedulerId}", params.schedulerId);
    return this._getData($.extend({}, url));
  }
  /***删除实例***/
HttpRequest.prototype.DeleteDtInstance = function(params) {
  var url = $.extend(true, {}, Url.DeleteDtInstance);
  url.url = url.url.replace("{instanceId}", params.instanceId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.GetDefineInsts = function(params) {
  var url = $.extend(true, {}, Url.GetDefineInsts);
  url.url = url.url.replace("{defineId}", params.defineId);
  return this._getData($.extend({}, url));
}
HttpRequest.prototype.GetInstsSchds = function(params) {
  var url = $.extend(true, {}, Url.GetInstsSchds);
  url.url = url.url.replace("{instanceId}", params.instanceId);
  return this._getData($.extend({}, url));
}


HttpRequest.prototype.ExecExploreByDefineID = function(params) {
  var url = $.extend(true, {}, Url.ExecExploreByDefineID);
  url.url = url.url.replace("{defineId}", params.defineId);
  return this._getData($.extend({}, url, {
    data: params
  }));
}


HttpRequest.prototype.ExecExploreByInstanceID = function(params) {
  var url = $.extend(true, {}, Url.ExecExploreByInstanceID);
  url.url = url.url.replace("{instanceId}", params.instanceId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.CreateInstanceByDefineID = function(params) {
  var url = $.extend(true, {}, Url.CreateInstanceByDefineID);
  return this._getData($.extend({}, url, {
    data: params
  }));
}

HttpRequest.prototype.GetWorkSpaceInfo = function(params) {
  var url = $.extend(true, {}, Url.GetWorkSpaceInfo);
  url.url = url.url.replace("{wsId}", params.wsId);
  return this._getData($.extend({}, url));
}

HttpRequest.prototype.UpdateWorkSpaceInfo = function(params) {
  var url = $.extend(true, {}, Url.UpdateWorkSpaceInfo);
  url.url = url.url.replace("{wsId}", params.wsId);
  return this._getData($.extend({}, url,{data:params.data}));
}
HttpRequest.prototype.GetPersonalizations = function(params) {
  var url = $.extend(true, {}, Url.GetPersonalizations);
  return this._getData($.extend({}, url,{data:params}));
}

HttpRequest.prototype.SetPersonalization = function(params) {
  var url = $.extend(true, {}, Url.SetPersonalization);
  return this._getData($.extend({}, url,{data:params}));
}
HttpRequest.prototype.GetObjectByIds = function(params) {
  var url = $.extend(true, {}, Url.GetObjectByIds);
  return this._getData($.extend({}, url,{data:params}));
}
HttpRequest.prototype.GetHistoryTabsBar = function(params) {
  var url = $.extend(true, {}, Url.GetHistoryTabsBar);
  return this._getData($.extend({}, url,{data:params}));
}

HttpRequest.prototype.UpdateFolderForm = function(params) {
  $.ajax({
    url: '/web/folder/' + params.folderId,
    type: 'POST',
    data: params.data,
    async: false,
    cache: false,
    contentType: false,
    processData: false,
    success: function(returndata) {
      toast('success', '目录编辑成功');
    },
    error: function(returndata) {
      toast('warning', '目录编辑失败:error=' + data.errorMessage);
    }
  });
}

module.exports = new HttpRequest();
