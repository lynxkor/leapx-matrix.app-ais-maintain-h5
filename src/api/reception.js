import { post, postText } from './request.js'

// 获取施工单列表
export function getList(data) {
  return post('/maintain/app/sp/serviceProxy/page', data)
}

// 获取施工单详情
export function getDetail(data) {
  return postText('/maintain/app/sp/serviceProxy/detail', data)
}

// 获取权益列表
export function getEquityList(data) {
  return post('/maintain/app/sp/serviceProxy/rightsList', data)
}

// 施工单作废
export function serviceProxyCancel(data) {
  return post('/maintain/app/sp/serviceProxy/cancel', data)
}

// 维修履历
export function getHistory(data) {
  return postText('/datacenter/app/vehicle/serviceProxyHis/get', data)
}

// 权益列表
export function getRightsList(data) {
  return post('/maintain/app/sp/serviceProxy/rightsList', data)
}

// 新建施工单查询车辆信息
export function getVehicleInfo(data) {
  return post('/datacenter/app/vehicle/vehicleProfile/listFull', data)
}
// 查询车联网里程
export function getVehicleMileage(data) {
  return postText('/maintain/app/sp/serviceProxy/getCarInfo', data)
}

// 搜索故障模块
export function getFaultModule(data) {
  return post('/maintain/app/sp/serviceProxy/cccList', data)
}

// 搜索维修项目
export function getRepairItem(data) {
  return post('/maintain/app/sp/serviceProxy/repairItem/filter', data)
}
// 搜索维修配件
export function getMaintenanceParts(data) {
  return post('/maintain/app/basic/sparePart/repairItem/filter', data)
}
// 新增施工单
export function serviceAddOrUpdate(data) {
  return post('/maintain/app/sp/serviceProxy/addOrUpdate', data)
}
// 预检确认
export function servicePreCheck(data) {
  return post('/maintain/app/sp/serviceProxy/precheck', data)
}

// 特殊开单--维修套餐--列表查询
export function getSpecialPackageList(data) {
  return post('/maintain/app/sp/special/rp/list', data)
}
// 特殊开单--维修套餐--详情
export function getSpecialPackageDetail(data) {
  return post('/maintain/app/sp/special/rp/detail', data)
}
// 特殊开单--维修套餐--使用
export function specialPackageUse(data) {
  return post('/maintain/app/sp/special/rp/use', data)
}
// 特殊开单--权益套餐--列表查询
export function getSpecialEquityList(data) {
  return post('/maintain/app/sp/special/equity/list', data)
}
// 特殊开单--权益套餐--详情
export function getSpecialEquityDetail(data) {
  return post('/maintain/app/sp/special/equity/detail', data)
}
// 特殊开单--权益套餐--使用
export function specialEquityUse(data) {
  return post('/maintain/app/sp/special/equity/use', data)
}
// 特殊开单--权益套餐--替换

export function specialEquityReplace(data) {
  return post('/maintain/app/sp/special/equity/replace', data)
}
// 特殊开单--商品订单--列表查询
export function getSpecialGoodsList(data) {
  return post('/maintain/app/sp/special/eo/list', data)
}
// 特殊开单--商品订单--详情
export function getSpecialGoodsDetail(data) {
  return post('/maintain/app/sp/special/eo/detail', data)
}
// 特殊开单--商品订单--使用
export function specialGoodsUse(data) {
  return post('/maintain/app/sp/special/eo/use', data)
}
// 特殊开单--免保项目--列表查询
export function getSpecialFreeList(data) {
  return post('/maintain/app/sp/special/fp/list', data)
}
// 特殊开单--免保项目--详情
export function getSpecialFreeDetail(data) {
  return post('/maintain/app/sp/special/fp/detail', data)
}
// 特殊开单--免保项目--使用
export function specialFreeUse(data) {
  return post('/maintain/app/sp/special/fp/use', data)
}
// 特殊开单--服务活动--列表查询
export function getSpecialActivityList(data) {
  return post('/maintain/app/sp/special/activity/list', data)
}
// 特殊开单--服务活动--详情
export function getSpecialActivityDetail(data) {
  return post('/maintain/app/sp/special/activity/detail', data)
}
// 特殊开单--服务活动--使用
export function specialActivityUse(data) {
  return post('/maintain/app/sp/special/activity/use', data)
}
// 接车施工单--提醒信息
export function getRemindInfo(data) {
  return postText('/maintain/app/sp/serviceProxy/getSpRemindInfo', data)
}
/**
 * 维修类型列表查询
 * @param data
 */
export function getRepairItemTypeList(data) {
  return post('/maintain/web/basic/repairItemType/list', data)
}

// 接车施工单--维修项目/零件--保存
export function saveSpRepairItem(data) {
  return post('/maintain/app/sp/serviceProxy/repairItem/save', data)
}
