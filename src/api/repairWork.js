import { post, postJson } from '@/libs/api/request'

const prefix = 'maintain/app/sp/serviceProxy'

/**
 * 施工单分页查询
 * @param {Object} data
 */
export function getList(data) {
  return post(prefix + '/page', data)
}

/**
 * 施工单分页查询
 * @param {Object} data
 */
export function getRecord(data) {
  return post(prefix + '/repairWorkRecordPage', data)
}

/**
 * 施工单详情信息
 * @param {Object} data
 */
export function getDetail(data) {
  return post(prefix + '/get', data)
}

/**
 * 施工单详情更新
 * @param {Object} data
 */
export function addOrUpdate(data) {
  return post(prefix + '/addOrUpdate', data)
}

/**
 * 下拉选择施工单
 * @param {Object} data
 */
export function selectServiceProxy(data) {
  return post(prefix + '/selectServiceProxy', data)
}

/**
 * 维修项目--详情
 * @param {string} serviceProxyId - 施工单ID
 */
export function getRepairItemInfo(serviceProxyId) {
  return postJson(prefix + '/repairItemInfo', serviceProxyId)
}

/**
 * 维修项目--保存
 * @param {Object} data
 */
export function saveRepairItemInfo(data) {
  return post(prefix + '/repairItem/save', data)
}

/**
 * 维修项目--作业开始
 * @param {Object} data
 */
export function startWork(data) {
  return post(prefix + '/startWork', data)
}

/**
 * 维修项目--作业结束
 * @param {Object} data
 */
export function endWork(data) {
  return post(prefix + '/endWork', data)
}

/**
 * 维修项目--删除派工
 * @param {Object} data
 */
export function deleteWorkers(data) {
  return post(prefix + '/deleteWorkers', data)
}

/**
 * 维修项目--返修
 * @param {Object} data
 */
export function repaired(data) {
  return post(prefix + '/repaired', data)
}

/**
 * 维修项目--派工
 * @param {Object} data
 */
export function dispatchWorkers(data) {
  return post(prefix + '/dispatchWorkers', data)
}

/**
 * 维修项目--维修作业记录
 * @param {Object} data
 */
export function getRepairWorkRecord(data) {
  return post(prefix + '/repairWorkRecord', data)
}

/**
 * 维修项目--搜索故障模块
 * @param {Object} data
 */
export function cccList(data) {
  return postJson(prefix + '/cccList', data)
}

/**
 * 维修项目--终检
 * @param {Object} data
 */
export function finalInspection(data) {
  return post(prefix + '/finalInspection', data)
}

/**
 * 维修项目--终检详情
 * @param {Object} data
 */
export function finalInspectionDetail(data) {
  return postJson(prefix + '/finalInspectionDetail', data)
}

/**
 * 维修项目--质检
 * @param {Object} data
 */
export function qualityInspection(data) {
  return post(prefix + '/qualityInspection', data)
}

/**
 * 维修项目--取消终检
 * @param {Object} data
 */
export function cancelFinal(data) {
  return post(prefix + '/cancelFinal', data)
}

/**
 * 维修项目--作废
 * @param {Object} data
 */
export function cancel(data) {
  return post(prefix + '/cancel', data)
}

/**
 * 维修项目--维修作业列表
 * @param {Object} data
 */
export function repairWorkRecord(data) {
  return post(prefix + '/repairWorkRecord', data)
}

/**
 * 工位
 * @param {Object} data
 */
export function getDealerStation(data) {
  return post(prefix + '/listStation', data)
}

/**
 * 技师
 * @param {Object} data
 */
export function getDealerTeamUserRelation(data) {
  return post(prefix + '/listTeamUser', data)
}

/**
 * 班组
 * @param {Object} data
 */
export function getDealerWorkTeam(data) {
  return post(prefix + '/listWorkTeam', data)
}

/**
 * 获取电池去向单位
 * @param {Object} data
 */
export function getBatteryUnitList(data) {
  return post(prefix + '/battery/list', data)
}

/**
 * 更新故障模块
 * @param {Object} data
 */
export function updateFaultAlertRecord(data) {
  return post(prefix + '/addFaultRecord', data)
}

/**
 * 维修项目筛选（搜索）
 * POST /app/sp/serviceProxy/repairItem/filter
 * 请求体: { serviceProxyId, nameOrCodeOrPinyinLike, pageSize }
 * 响应 data: RepairItemResp[]
 */
export function filterRepairItems(data) {
  return postJson(prefix + '/repairItem/filter', data)
}

/**
 * 维修零件筛选（搜索）— 接口暂无，预留占位
 */
export function filterRepairParts(data) {
  return postJson('sp/app/basic/sparePart/repairItem/filter', data)
}

/**
 * 获取枚举接口
 * @param {String} key
 */
export function getEnum(key) {
  return post(`maintain/web/common/enum/${key}`)
}

/**
 * 获取保修类型和结算类型映射关系
 */
export function getRepairItemTypeMap() {
  return post(`maintain/app/sp/serviceProxy/type/list`, { 'categorys': [20] })
}

/**
 * 查询用户功能权限
 * @param data
 */
export function getDealerPermission(data) {
  return post('maintain/app/common/dealer/permission/list', data)
}
