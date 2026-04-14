import { get, post, postJson } from './request'

const SERVICE_PROXY_BASE = 'maintain/app/sp/serviceProxy'
const SERVICE_STATEMENT_BASE = 'maintain/app/sp/serviceStatement'

// ==================== 结算单列表相关 ====================

/**
 * 获取结算单列表（分页）
 * @param {Object} data - 查询参数
 * @param {number} data.pageNum - 页码
 * @param {number} data.pageSize - 每页条数
 * @param {string} [data.orderStatus] - 工单状态：160-待交车，180-已交车
 * @param {string} [data.appSearchKeyWord] - 搜索关键词（支持工单号、VIN、车牌号、车主姓名模糊搜索）
 * @param {string} [data.vehProfileVin] - VIN 码
 * @param {string} [data.carPlate] - 车牌号
 * @param {string} [data.customerName] - 车主姓名
 * @param {string} [data.serviceProxyCode] - 施工单号
 * @param {string} [data.createTimeStart] - 创建开始时间（YYYY-MM-DD HH:mm:ss）
 * @param {string} [data.createTimeEnd] - 创建结束时间（YYYY-MM-DD HH:mm:ss）
 * @returns {Promise}
 */
export function getSettlementStatementPage(data) {
  return post(`${SERVICE_PROXY_BASE}/page`, data)
}

/**
 * 获取接车施工单详情
 * @param {string} id - 施工单 ID
 * @returns {Promise}
 */
export function getServiceProxyDetail(id) {
  return get(`${SERVICE_PROXY_BASE}/get/${id}`)
}

/**
 * 获取结算单详情信息
 * 兼容两种调用方式：
 * 1. getServiceStatementDetail('statementId')
 * 2. getServiceStatementDetail({ id: 'statementId' })
 * @param {string|Object} payload - 结算单 ID 或查询参数
 * @returns {Promise}
 */
export function getServiceStatementDetail(payload) {
  const data = typeof payload === 'string' ? { id: payload } : payload
  return postJson(`${SERVICE_STATEMENT_BASE}/get`, data)
}

/**
 * 根据施工单查询对应的结算单详情列表
 * 兼容两种调用方式：
 * 1. getServiceStatementListByServiceProxy('serviceProxyId')
 * 2. getServiceStatementListByServiceProxy({ serviceProxyId: 'serviceProxyId' })
 * @param {string|Object} payload - 施工单 ID 或查询参数
 * @returns {Promise}
 */
export function getServiceStatementListByServiceProxy(payload) {
  return postJson(`${SERVICE_STATEMENT_BASE}/list/statement`, payload)
}

// ==================== 作废相关 ====================

/**
 * 作废接车施工单
 * @param {Object} data - 作废参数
 * @param {string} data.id - 施工单主键 ID
 * @param {string} data.invaildDesc - 作废描述
 * @returns {Promise}
 */
export function cancelServiceProxy(data) {
  return postJson(`${SERVICE_PROXY_BASE}/cancel`, data)
}

// ==================== 结算相关 ====================

/**
 * 接车施工单结算
 * @param {Object} data - 结算参数
 * @param {string} data.serviceProxyId - 接车施工单 ID
 * @param {number} data.faultSolve - 客户反馈问题是否全部解决：1-已解决，0-未解决
 * @param {string} [data.reason] - 未解决原因
 * @returns {Promise}
 */
export function addServiceProxyStatement(data) {
  return postJson(`${SERVICE_PROXY_BASE}/statement/add`, data)
}

/**
 * 结算单--提交结算并确认签字
 * @param {Object} data - 提交参数
 * @returns {Promise}
 */
export function signSettlementStatement(data) {
  return post(`${SERVICE_STATEMENT_BASE}/signSettlement`, data)
}

/**
 * 结算单--提交结算
 * @param {Object} data - 提交参数
 * @returns {Promise}
 */
export function submitSettlementStatement(data) {
  return post(`${SERVICE_STATEMENT_BASE}/submitSettlementAndSign`, data)
}

/**
 * 结算单--创建收款记录
 * @param {Object} data - 提交参数
 * @returns {Promise}
 */
export function addReceiptRecord(data) {
  return post('app/sp/serviceStatement/addReceiptRecord', data)
}

/**
 * 结算单--确认收款
 * @param {Object} data - 提交参数
 * @returns {Promise}
 */
export function receiptCompletion(data) {
  return postJson('app/sp/serviceStatement/receiptCompletion', data)
}
