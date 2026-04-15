import { get, post, postJson } from './request'

/**
 * 预授权申请 - 移动端接口
 * 分类: 移动端 预授权申请 (catid: 43721)
 */

// 预授权申请表分页查询
export function preAuthPage(data) {
  return post('maintain/app/sp/preAuth/page', data)
}

// 预授权申请表列表查询
export function preAuthList(data) {
  return post('maintain/app/sp/preAuth/list', data)
}

// 预授权申请表详情信息
export function preAuthGet(data) {
  return postJson('maintain/app/sp/preAuth/get', data)
}

// 预授权申请表新增/编辑
export function preAuthAddOrUpdate(data) {
  return post('maintain/app/sp/preAuth/addOrUpdate', data)
}

// 预授权申请表删除
export function preAuthDelete(data) {
  return post('maintain/app/sp/preAuth/delete', data)
}

// 预授权申请表启用/禁用
export function preAuthEnableOrDisable(data) {
  return post('maintain/app/sp/preAuth/enableOrDisable', data)
}

// 预授权审批
export function preAuthAudit(data) {
  return post('maintain/app/sp/preAuth/audit', data)
}

// 提交
export function preAuthSubmit(data) {
  return post('maintain/app/sp/preAuth/submit', data)
}

// 作废
export function preAuthCancel(data) {
  return post('maintain/app/sp/preAuth/cancel', data)
}

// 重新生成
export function preAuthReGenerate(data) {
  return post('maintain/app/sp/preAuth/reGenerate', data)
}

// 新增时获取预售权填充详情信息
export function preAuthGetPreAuthInfoDetail(data) {
  return postJson('maintain/app/sp/preAuth/getPreAuthInfoDetail', data)
}
// 门店所属区域
export function preAuthGetStoreArea(data) {
  return post('maintain/app/sp/preAuth/listRegion', data)
}
// 施工单列表
export function preAuthGetConstructionList(data) {
  return post('/maintain/app/sp/serviceProxy/page', data)
}
// 质量反馈列表
export function preAuthGetQualityFeedbackList(data) {
  return post('maintain/app/sp/qualityOrderReport/page', data)
}
// 错误代码设置表列表查询
export function preAuthGetErrorCodeList(data) {
  return post('maintain/app/sp/preAuth/code/list', data)
}
