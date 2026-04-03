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
  return post(prefix + '/repairItemInfo', serviceProxyId)
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
  return post(prefix + '/cccList', data)
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
