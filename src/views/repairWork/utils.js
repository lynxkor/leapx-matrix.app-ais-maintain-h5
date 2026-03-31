import { showConfirmDialog, showToast } from 'vant'
import {
  startWork,
  endWork,
  deleteWorkers,
  repaired,
  finalInspection,
  qualityInspection,
  addOrUpdate
} from '@/api/repairWork'
import { formatDateTime } from '@/libs/utils'
import { useUserStore } from '@/stores/user'
/**
 * 操作确认弹窗配置
 */
export const actionConfirmConfig = {
  delete: { title: '确认删除', message: '确定要删除该派工项目吗？' },
  start: { title: '确认作业开始', message: '确定要开始作业吗？' },
  end: { title: '确认作业结束', message: '确定要结束作业吗？' },
  quality: { title: '确认质检', message: '确定要进行质检吗？' },
  rework: { title: '确认返修', message: '确定要进行返修吗？' },
  finalCheck: { title: '确认终检', message: '确定要进行终检吗？' }
}

/**
 * 显示操作确认弹窗
 * @param {string} action - 操作类型 (delete|start|end|quality|rework|finalCheck)
 * @param {number} count - 操作项目数量，用于批量操作时显示数量
 * @returns {Promise<boolean>} - 用户确认返回 true，取消返回 false
 */
export async function showOperationConfirm(action, count = 1) {
  const config = actionConfirmConfig[action]
  if (!config) return false

  const message = count > 1
    ? `确定要对选中的 ${count} 个项目${config.message.replace('确定要', '')}`
    : config.message

  try {
    await showConfirmDialog({
      title: config.title,
      message,
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    return true
  } catch {
    return false
  }
}

/**
 * 单条项目 API 调用
 * @param {string} action - 操作类型
 * @param {Object} options - 参数选项
 * @param {string} options.serviceProxyId - 施工单ID
 * @param {Object} options.item - 维修项目对象
 * @returns {Promise} - API调用结果
 */
export async function callSingleItemApi(action, { serviceProxyId, item }) {
  const repairItemId = item.id
  const params = { serviceProxyId, repairItemId }
  const userStore = useUserStore()

  switch (action) {
    case 'delete':
      return deleteWorkers([item.id])
    case 'start':
      params.ids = [repairItemId]
      params.timeSpend = formatDateTime(new Date())
      return startWork(params)
    case 'end':
      params.ids = [repairItemId]
      params.finishAt = formatDateTime(new Date())
      return endWork(params)
    case 'quality':
      Object.assign(params, { ...item,
        qualityCheckAt: formatDateTime(new Date()),
        qualityCheckerId: userStore.userId,
        qualityCheckerName: userStore.userId
      })
      return qualityInspection(params)
    case 'rework':
      Object.assign(params, { ...item })
      return repaired(params)
    case 'finalCheck':
      return finalInspection(params)
    default:
      throw new Error(`Unknown action: ${action}`)
  }
}

/**
 * 批量项目 API 调用
 * @param {string} action - 操作类型
 * @param {Object} options - 参数选项
 * @param {string} options.serviceProxyId - 施工单ID
 * @param {Array<string>} options.ids - 项目ID列表
 * @param {Object} options.extraParams - 额外参数
 * @returns {Promise} - API调用结果
 */
export async function callBatchApi(action, { serviceProxyId, ids, extraParams = {}}) {
  const params = { serviceProxyId, ids, ...extraParams }

  switch (action) {
    case 'delete':
      return deleteWorkers(ids)
    case 'start':
      return startWork(params)
    case 'end':
      return endWork(params)
    case 'rework':
      return repaired(params)
    case 'quality':
      return qualityInspection(params)
    case 'finalCheck':
      return finalInspection(params)
    default:
      throw new Error(`Unknown action: ${action}`)
  }
}

/**
 * 终检后故障检查弹窗
 * @param {string} serviceProxyId - 施工单ID
 * @param {Function} onRefresh - 刷新回调函数
 * @returns {Promise<Object>} - 返回操作结果 { action: 'fillFault' | 'noFault' }
 */
export async function showFaultCheckDialog(serviceProxyId, onRefresh) {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '系统检测到本次进店是否存在故障为"是，有故障"，请填写故障模块信息。',
      confirmButtonText: '去填写故障信息',
      cancelButtonText: '无故障'
    })
    return { action: 'fillFault' }
  } catch {
    // 点击"无故障" → 二次确认
    try {
      await showConfirmDialog({
        title: '提示',
        message: '若本次无故障，将清空"故障模块、故障描述"，请确认无故障。',
        confirmButtonText: '确认无故障',
        cancelButtonText: '取消'
      })
      // 确认无故障，清空故障信息
      try {
        await addOrUpdate({
          serviceProxyId,
          faultModules: [],
          faultDescription: ''
        })
        showToast('已确认无故障')
        onRefresh?.()
        return { action: 'noFault' }
      } catch {
        showToast('操作失败')
        throw new Error('clear_fault_failed')
      }
    } catch {
      // 取消 → 重新显示故障检查弹窗
      return showFaultCheckDialog(serviceProxyId, onRefresh)
    }
  }
}

/**
 * 执行单条项目操作（确认 + API调用 + Toast）
 * @param {string} action - 操作类型
 * @param {Object} options - 参数选项
 * @param {string} options.serviceProxyId - 施工单ID
 * @param {Object} options.item - 维修项目对象
 * @param {Function} options.onRefresh - 刷新回调
 * @param {Function} options.onSuccess - 成功后额外回调
 * @returns {Promise<boolean>} - 操作成功返回 true
 */
export async function executeSingleItemOperation(action, { serviceProxyId, item, onRefresh, onSuccess }) {
  const confirmed = await showOperationConfirm(action)
  if (!confirmed) return false

  try {
    await callSingleItemApi(action, { serviceProxyId, item })
    showToast('操作成功')
    onRefresh?.()
    onSuccess?.()
    return true
  } catch {
    showToast('操作失败')
    return false
  }
}

/**
 * 执行批量项目操作（确认 + API调用 + Toast）
 * @param {string} action - 操作类型
 * @param {Object} options - 参数选项
 * @param {string} options.serviceProxyId - 施工单ID
 * @param {Array<string>} options.ids - 项目ID列表
 * @param {Array<Object>} options.selectedItems - 选中的项目列表（用于显示数量）
 * @param {Object} options.extraParams - 额外参数
 * @param {Function} options.onRefresh - 刷新回调
 * @param {Function} options.onSuccess - 成功后额外回调
 * @returns {Promise<boolean>} - 操作成功返回 true
 */
export async function executeBatchOperation(action, { serviceProxyId, ids, selectedItems, extraParams, onRefresh, onSuccess }) {
  const count = selectedItems?.length || ids?.length || 0
  if (count === 0) return false

  const confirmed = await showOperationConfirm(action, count)
  if (!confirmed) return false

  try {
    await callBatchApi(action, { serviceProxyId, ids, extraParams })
    showToast('操作成功')
    onRefresh?.()
    onSuccess?.()
    return true
  } catch {
    showToast('操作失败')
    return false
  }
}
