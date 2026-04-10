import { get, post, postJson } from './request'

// ==================== 结算单列表相关 ====================

/**
 * 获取结算单列表（分页）
 * @param {Object} data - 查询参数
 * @param {number} data.pageNum - 页码
 * @param {number} data.pageSize - 每页条数
 * @param {string} [data.appSearchKeyWord] - 搜索关键词（支持工单号、VIN、车牌号、车主姓名模糊搜索）
 * @param {string} [data.vehProfileVin] - VIN码
 * @param {string} [data.carPlate] - 车牌号
 * @param {string} [data.customerName] - 车主姓名
 * @param {string} [data.serviceProxyCode] - 施工单号
 * @param {string} [data.code] - 结算单号
 * @param {string} [data.statementStatus] - 结算状态：10-待结算，30-待收款，40-已收款，50-反结算，60-取消结算
 * @param {string} [data.createTimeStart] - 创建开始时间（格式：YYYY-MM-DD HH:mm:ss）
 * @param {string} [data.createTimeEnd] - 创建结束时间（格式：YYYY-MM-DD HH:mm:ss）
 * @returns {Promise}
 */
export function getSettlementStatementPage(data) {
  return post('maintain/app/sp/serviceProxy/page', data)
}

/**
 * 获取结算报表列表
 * @param {Object} data - 查询参数
 * @returns {Promise}
 */
export function getSettlementList(data) {
  return post('/settlement/statement/page', data)
}

/**
 * 获取结算详情
 * @param {string} id - 结算单ID
 * @returns {Promise}
 */
export function getSettlementDetail(id) {
  return get(`/settlement/statement/detail/${id}`)
}

/**
 * 结算审核通过
 * @param {string} id - 结算单ID
 * @returns {Promise}
 */
export function approveSettlement(id) {
  return post(`/settlement/statement/approve/${id}`)
}

/**
 * 结算审核驳回
 * @param {string} id - 结算单ID
 * @param {Object} data - 驳回原因等
 * @returns {Promise}
 */
export function rejectSettlement(id, data) {
  return post(`/settlement/statement/reject/${id}`, data)
}

/**
 * 重新提交结算单
 * @param {string} id - 结算单ID
 * @returns {Promise}
 */
export function resubmitSettlement(id) {
  return post(`/settlement/statement/resubmit/${id}`)
}

/**
 * 获取结算统计数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getSettlementStatistics(params) {
  return get('/settlement/statement/statistics', params)
}

/**
 * 导出结算报表
 * @param {Object} data - 导出参数
 * @returns {Promise}
 */
export function exportSettlement(data) {
  return post('/settlement/statement/export', data, {
    responseType: 'blob'
  })
}

// ==================== 结算单编辑相关 ====================

/**
 * 更新结算单
 * @param {string} id - 结算单ID
 * @param {Object} data - 更新的数据
 * @returns {Promise}
 */
export function updateSettlement(id, data) {
  return post(`/settlement/statement/update/${id}`, data)
}

/**
 * 保存结算单草稿
 * @param {Object} data - 草稿数据
 * @returns {Promise}
 */
export function saveSettlementDraft(data) {
  return post('/settlement/statement/draft/save', data)
}

/**
 * 获取结算单草稿
 * @param {string} workOrderId - 工单ID
 * @returns {Promise}
 */
export function getSettlementDraft(workOrderId) {
  return get(`/settlement/statement/draft/${workOrderId}`)
}

// ==================== 维修作业相关 ====================

/**
 * 获取维修作业详情
 * @param {string} id - 工单ID
 * @returns {Promise}
 */
export function getWorkOrderDetail(id) {
  return get(`/settlement/work-order/detail/${id}`)
}

/**
 * 创建结算单
 * @param {Object} data - 结算单数据
 * @returns {Promise}
 */
export function createSettlement(data) {
  return post('/settlement/statement/create', data)
}

// ==================== 售后结算单相关 ====================

/**
 * 获取售后结算单列表
 * @param {Object} data - 查询参数
 * @returns {Promise}
 */
export function getAfterSalesSettlementList(data) {
  return post('/settlement/after-sales/page', data)
}

/**
 * 获取售后结算单详情
 * @param {string} id - 结算单ID
 * @returns {Promise}
 */
export function getAfterSalesSettlementDetail(id) {
  return get(`/settlement/after-sales/detail/${id}`)
}

// ==================== 签字相关 ====================

/**
 * 获取签字信息
 * @param {string} id - 结算单ID
 * @returns {Promise}
 */
export function getSignInfo(id) {
  return get(`/settlement/sign/info/${id}`)
}

/**
 * 提交签字
 * @param {string} id - 结算单ID
 * @param {Object} data - 签字数据
 * @returns {Promise}
 */
export function submitSignature(id, data) {
  return post(`/settlement/sign/submit/${id}`, data)
}

/**
 * 发送签字邀请
 * @param {string} id - 结算单ID
 * @param {Object} data - 邀请方式数据
 * @returns {Promise}
 */
export function sendSignInvite(id, data) {
  return post(`/settlement/sign/invite/${id}`, data)
}

// ==================== 收款记录相关 ====================

/**
 * 创建收款记录
 * @param {Object} data - 收款数据
 * @returns {Promise}
 */
export function createPaymentRecord(data) {
  return post('/settlement/payment/create', data)
}

/**
 * 获取收款记录列表
 * @param {string} settlementId - 结算单ID
 * @returns {Promise}
 */
export function getPaymentRecords(settlementId) {
  return get(`/settlement/payment/list/${settlementId}`)
}

/**
 * 上传收款凭证
 * @param {FormData} data - 凭证文件
 * @returns {Promise}
 */
export function uploadPaymentVoucher(data) {
  return post('/settlement/payment/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
