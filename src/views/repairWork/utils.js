import { showConfirmDialog, showToast } from 'vant'
import {
  startWork,
  endWork,
  deleteWorkers,
  repaired,
  finalInspection,
  finalInspectionDetail,
  qualityInspection,
  updateFaultAlertRecord
} from '@/api/repairWork'
import { formatDateTime } from '@/libs/utils'
import { useUserStore } from '@/stores/user'
import { WorkRecordStatusEnum, QualityCheckStatusEnum, DispatchStatusEnum } from './constant'
/**
 * 根据tab索引判断维修项目是否属于该分类
 * @param {Object} item - 维修项目对象
 * @param {number} tagIndex - tab索引 (0:待派工, 1:未作业, 2:作业中, 3:待质检, 4:待终检)
 * @returns {boolean}
 */
export function filterByTag(item, tagIndex) {
  switch (tagIndex) {
    case 0: return item.isDispatch !== DispatchStatusEnum.DISPATCHED
    case 1: return item.isDispatch === DispatchStatusEnum.DISPATCHED && item.status === WorkRecordStatusEnum.NOT_STARTED
    case 2: return item.status === WorkRecordStatusEnum.IN_PROGRESS
    case 3: return item.status === WorkRecordStatusEnum.COMPLETED && item.qualityCheckStatus !== QualityCheckStatusEnum.COMPLETED
    case 4: return item.qualityCheckStatus === QualityCheckStatusEnum.COMPLETED
    default: return true
  }
}

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

  const message = config.message

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
      Object.assign(params, {
        ids: [repairItemId],
        qualityCheckAt: formatDateTime(new Date()),
        qualityCheckerId: userStore.userId,
        qualityCheckerName: userStore.userName
      })
      return qualityInspection(params)
    case 'rework':
      Object.assign(params, { ...item, ids: [repairItemId] })
      return repaired(params)
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
export async function showFaultCheckDialog(serviceProxyId, onRefresh, workOrder) {
  try {
    await showConfirmDialog({
      title: '确认存在故障？',
      message: '系统检测到本次进店是否存在故障为"是，有故障"，请填写故障模块信息。',
      confirmButtonText: '去填写故障信息',
      cancelButtonText: '无故障'
    })
    return { action: 'fillFault' }
  } catch {
    // 点击"无故障" → 二次确认
    try {
      await showConfirmDialog({
        title: '确认无故障？',
        message: '若本次无故障，将清空"故障模块、故障描述"，请确认无故障。',
        confirmButtonText: '确认无故障',
        cancelButtonText: '取消'
      })
      // 确认无故障，清空故障信息
      try {
        // 签字弹框确认：用户点击【准确】后，门店修改本次是否因故障进店，由是修改成否，不用清空【客户故障描述】字段内容
        const newCustomerContent = workOrder.confirmFaultLabel === 1 ? workOrder.customerContent : '本次进店车辆无故障' // 1 为准确 2 为不准确
        const res = await updateFaultAlertRecord({
          id: serviceProxyId,
          currentFault: 0,
          customerContent: newCustomerContent
        })
        if (res.code === 200) {
          showToast('已确认无故障')
          onRefresh?.()
          return { action: 'noFault' }
        } else {
          showToast(res.message)
          throw new Error('clear_fault_failed')
        }
      } catch (e) {
        if (e.message === 'clear_fault_failed') throw e
        showToast('操作失败')
        throw new Error('clear_fault_failed')
      }
    } catch {
      // 取消 → 重新显示故障检查弹窗
      return false
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
    const res = await callSingleItemApi(action, { serviceProxyId, item })
    if (res.code === 200) {
      showToast('操作成功')
      onRefresh?.()
      onSuccess?.()
      return true
    } else {
      showToast(res.message)
      return false
    }
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
    const res = await callBatchApi(action, { serviceProxyId, ids, extraParams })
    if (res.code === 200) {
      showToast('操作成功')
      onRefresh?.()
      onSuccess?.()
      return true
    } else {
      showToast(res.message)
      return false
    }
  } catch {
    showToast('操作失败')
    return false
  }
}

/**
 * 终检完整流程：查询终检详情 → 故障检查 → 电池/追溯判断 → 确认提交
 * @param {Object} options
 * @param {string} options.serviceProxyId - 施工单ID
 * @param {Object} options.workOrder - 工单对象（用于 showFaultCheckDialog）
 * @param {Function} options.onRefresh - 刷新回调
 * @param {Function} options.onShowFinalCheckPopup - 需要填写电池/追溯信息时的回调
 * @param {Function} options.onShowFaultInfoPopup - 需要填写故障信息时的回调
 * @returns {Promise<void>}
 */
export async function handleFinalCheckFlow({ serviceProxyId, workOrder, onRefresh, onShowFinalCheckPopup, onShowFaultInfoPopup }) {
  try {
    const resdata = await finalInspectionDetail(serviceProxyId)
    if (resdata.code !== 200) {
      showToast(resdata.message)
      return
    }
    const res = resdata?.data || {}
    if (res.faultFlag && res.faultAlertRecordResps?.length === 0) {
      const result = await showFaultCheckDialog(serviceProxyId, onRefresh, workOrder)
      if (result?.action === 'fillFault') {
        onShowFaultInfoPopup?.()
      }
    } else {
      if (res.batteryFlag || res.tranceFlag) {
        onShowFinalCheckPopup?.()
      } else {
        await showConfirmDialog({
          title: '提示',
          message: '确认要终检吗？'
        })
        const userStore = useUserStore()
        const submitData = {
          ...res,
          repairWorkRecordResps: res.repairWorkRecordResps,
          faultAlertRecordParams: res.faultAlertRecordResps,
          traceRecordParams: res.partsTraceRecordResps,
          currentFault: res.faultFlag ? 1 : 0,
          id: serviceProxyId,
          finalCheckAt: formatDateTime(new Date()),
          finalCheckerId: userStore.userId,
          finalChecker: userStore.userName
        }
        try {
          const fres = await finalInspection(submitData)
          if (fres.code === 200) {
            showToast('终检成功')
            onRefresh?.()
          } else {
            showToast({
              message: fres.message,
              duration: 5000
            })
            onRefresh?.()
          }
        } catch (e) {
          showToast(e?.message || '终检失败')
          onRefresh?.()
        }
      }
    }
  } catch {
    // showToast('终检失败')
  }
}
