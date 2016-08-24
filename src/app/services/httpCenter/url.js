"use strict";

module.exports = {
  ListEntities: {
    method: "GET",
    url: "/web/otm/listEntities"
  },
  ListLinks: {
    method: "GET",
    url: "/web/otm/listLinks"
  },
  SearchMarkedTagDomains: {
    method: "GET",
    url: "/web/otm/searchMarkedTagDomains"
  },
  CanvasList: {
    method: "GET",
    url: "/web/bos/list"
  },
  CreateCanvas: {
    method: "POST",
    url: "/web/canvases"
  },
  FindElement: {
    method: "POST",
    url: "/web/canvases/findElements"
  },
  GetCanvas: {
    method: "GET",
    url: "/web/canvas/{canvasId}/load"
  },
  SaveCanvas: {
    method: "POST",
    url: "/web/canvas/{canvasId}"
  },

  UpdateCanvas: {
    method: "POST",
    url: "/web/canvas/{canvasId}"
  },  
  DeleteCanvas:{
      method: "DELETE",
    url: "/web/canvas/{canvasId}"
  },

  GetCanvasInfo: {
    method: "GET",
    url: "/web/canvas/{canvasId}"
  },
  DetectEntity: {
    method: "POST",
    url: "/web/canvases/detectEntity"
  },
  GetTag: {
    method: "GET",
    url: "/web/otm/getTagsWithHierarchy"
  },
  GetEntityDetail: {
    method: "GET",
    url: "/web/otm/entity/{domainCode}"
  },
  GetLinkDetail: {
    method: "GET",
    url: "/web/otm/link/{domainCode}"
  },
  GetERTagDetail: {
    method: "GET",
    url: "/web/otm/getTags"
  },
  GetTagStructDetail: {
    method: "GET",
    url: "/web/otm/tags/structDetail"
  },
  //修改方法参数/web/otm/tags/detail?tagCode=xxx&entityCode=xxx
  getTagDetail: {
    method: "GET",
    url: "/web/otm/tags/detail"
  },
  GetDomainField: {
    method: "GET",
    url: "/web/otm/listDomainFields"
  },
  GetCategories: {
    method: "GET",
    url: "/web/otm/category/{categoryId}/hierarchy"
  },
  GetResDsType: {
    method: "GET",
    url: "/web/bds/dsTypes"
  },
  GetProject: {
    method: "GET",
    url: "/web/bds/datasources"
  },
  CreateDataSource: {
    method: "POST",
    url: "/web/bds/datasources"
  },
  UpdateDataSource:{
    method:"POST",
    url:"/web/bds/datasource/{dsId}"
  },
  GetDataSourceInfo:{
    method:"GET",
    url:"/web/bds/datasource/{dsId}"
  },
  DeleteDataSource: {
    method: "DELETE",
    url: "/web/bds/datasource/{dsId}"
  },
  GetTable: {
    method: "GET",
    url: "/web/bds/tables"
  },
  GetRecommend: {
    method: "POST",
    url: "/web/canvases/recommend"
  },
  UpdateTopSubjectContent: {
    method: "POST",
    url: "/web/ws/{workspaceId}/topSubjects"
  },
  GetFolderLoad: {
    method: "GET",
    url: "/web/folder/{folderId}/load"
  },
  GetBosList: {
    method: "GET",
    url: "/web/bos/list"
  },
  GetFolderInfo: {
    method: "GET",
    url: "/web/folder/{folderId}"
  },
  CreateFolderViaJson: {
    method: "POST",
    url: "/web/folders"
  },
  CreateFolderViaForm: {
    method: "POST",
    url: "/web/folders"
  },
  UpdateFolderViaJson: {
    method: "POST",
    url: "/web/folder/{folderId}"
  },
  UpdateFolderViaForm: {
    method: "POST",
    url: "/web/folder/{folderId}"
  },
  DeleteFolderViaJson: {
    method: "DELETE",
    url: "/web/folder/{folderId}"
  },
  GetBloodLineParent: {
    method: "GET",
    url: "/web/meta/bloodline/parants"
  },
  GetTableDetail: {
    method: "GET",
    url: "/web/meta/table/detail"
  },
  GetBloodInfo: {
    method: "GET",
    url: "/web/meta/table/info"
  },
  GetTableBlood: {
    method: "GET",
    url: "/web/meta/bloodline"
  },
  GetDataSources: {
    method: "GET",
    url: "/web/bds/datasources"
  },
  GetDsTypeDetails: {
    method: "GET",
    url: "/web/bds/dsTypeDetails"
  },
  GetTableGraph: {
    method: "GET",
    url: "/web/bds/datasource/{dsId}/tableGraph"
  },
  GetTableSumInfo: {
    method: "GET",
    url: "/web/bds/datasource/{dsId}/tableSumInfo"
  },
  GetRecommendCanvas: {
    method: "GET",
    url: "/web/canvases/recommend/canvases"
  },
  GetRecommendCanvasInfo: {
    method: "GET",
    url: "/web/canvases/recommend/canvas/{cavansId}"
  },
  GetRecommendExpore: {
    method: "POST",
    url: "/web/canvases/recommend/byDomainId"
  },
  GetLoginUser: {
    method: "GET",
    url: "/web/luser/info"
  },
  GetCmSearch: {
    method: "GET",
    url: "/web/cm/search?keyword={keyword}"
  },
  CreateDetect: {
    method: "POST",
    url: "/web/dt/defs"
  },
  GetDtSchedulerStatus: {
    method: "GET",
    url: "/web/dt/schd/{schedulerId}/status"
  },
  GetDefineInsts: {
    method: "GET",
    url: "/web/dt/def/{defineId}/insts"
  },
  GetInstsSchds: {
    method: "GET",
    url: "/web/dt/inst/{instanceId}/schds"
  },
  GetDtInstanceResult: {
    method: "GET",
    url: "/web/dt/schd/{schedulerId}/result"
  },
  GetTopSubject: {
    method: "GET",
    url: "/web/ws/{workspaceId}/topSubjects"
  },
  GetDtDefine: {
    method: "GET",
    url: "/web/dt/def/{defineId}"
  },
  DeleteDtDefine: {
    method: "DELETE",
    url: "/web/dt/def/{defineId}"
  },
  GetDtInstance: {
    method: "GET",
    url: "/web/dt/inst/{instanceId}"
  },
  GetDtScheduler: {
    method: "GET",
    url: "/web/dt/schd/{schedulerId}"
  },
  LoadGraphByDefineId: {
    method: "GET",
    url: "/web/dt/def/{defineId}/loadGraph"
  },
  LoadGraphByInstanceId: {
    method: "GET",
    url: "/web/dt/inst/{instanceId}/loadGraph"
  },
   LoadGraphBySchedulerId: {
    method: "GET",
    url: "/web/dt/sch/{schedulerId}/loadGraph"
  },
  ExecExploreByDefineID: {
    method: "POST",
    url: "/web/dt/def/{defineId}/exe"
  },
  ExecExploreByInstanceID: {
    method: "POST",
    url: "/web/dt/inst/{instanceId}/exe"
  },
  DeleteDtInstance: {
    method: "DELETE",
    url: "/web/dt/inst/{instanceId}"
  },
  GetPartitionInfo: {
    method: "GET",
    url: "/web/otm/listPatitions"
  },
  CreateInstanceByDefineID: {
    method: "POST",
    url: "/web/dt/insts"
  },
  GetWorkSpaceInfo:{
    method:"GET",
    url:" /web/ws/{wsId}/config"
  },
  UpdateWorkSpaceInfo:{
    method:"POST",
    url:"/web/ws/{wsId}/config"
  },
  GetPersonalizations:{
    method:"GET",
    url:"/web/luser/personalizations"
  },
  SetPersonalization:{
    method:"POST",
    url:"/web/luser/personalization"
  },
  GetObjectByIds:{
    method:"GET",
    url:"/web/bos/listByIds"
  },
  GetHistoryTabsBar:{
    method:"GET",
    url:"/web/luser/tagHistory"
  },
  
  
}
