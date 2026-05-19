import { showToast } from 'vant'
import { AlarmLevelEnum, WarrantyTypeEnum } from '@/views/repairWork/constant'
import { deleteAttachmentConfig } from '@/libs/api/fileConfig'
import { getFaultModule } from '@/api/reception'

// ==================== 文件相关工具函数 ====================

/**
 * 获取文件预览 URL（优先使用已授权地址）
 */
export function getFilePreviewUrl(file) {
  return file?.authFileUrl || file?.url || file?.fileUrl || ''
}

/**
 * 获取文件保存 URL
 */
export function getFileSaveUrl(file) {
  return file?.url || file?.fileUrl || file?.authFileUrl || ''
}

/**
 * 获取文件类型（扩展名）
 */
export function getFileType(file, fallback = '') {
  if (!file) return fallback
  if (file.fileType || file.ext) return file.fileType || file.ext

  const filePath = file.fileName || file.name || file.url || file.fileUrl || file.authFileUrl || ''
  const cleanPath = filePath.split('?')[0]
  const ext = cleanPath.includes('.') ? cleanPath.split('.').pop() : ''
  return ext || fallback
}

/**
 * 处理图片列表参数，格式化为接口需要的结构
 */
export function formatPhotoList(list, attachType, businessId) {
  return list.map((item) => {
    const fileId = item.id || item.uploadId
    return {
      id: businessId ? fileId : null,
      fileId,
      businessId,
      fileUrl: getFileSaveUrl(item),
      fileType: getFileType(item, 'image/jpeg'),
      attachType,
      configCode: 'mcs_serviceproxy'
    }
  })
}

/**
 * 检查文件列表中是否有重复的 fileId
 */
export function hasDuplicateFileId(list) {
  const ids = list.map((item) => item.fileId || item.id || item.uploadId).filter(Boolean)
  return ids.length !== new Set(ids).size
}

/**
 * 根据附件类型获取上传配置
 */
export function getAttachConfig(attachType, uploadConfig) {
  const detailList = uploadConfig?.value?.detailList || []
  return detailList.find((item) => item.attachType === attachType) || {}
}

/**
 * 根据上传类型获取目标文件列表
 */
export function getTargetFileList(type, detail, signatureData) {
  switch (type) {
    case 'interior':
      return detail.interiorImages
    case 'exterior':
      return detail.exteriorImages
    case 'attachment':
      return signatureData.attachments
    default:
      return detail.interiorImages
  }
}

/**
 * 删除文件（支持有id的远程删除和无id的本地删除）
 */
export async function handleFileDelete(file, type, detail, signatureData) {
  const targetList =
    type === 'interior'
      ? detail.interiorImages
      : type === 'exterior'
        ? detail.exteriorImages
        : signatureData.attachments

  if (file.id) {
    await deleteAttachmentConfig([file.id])
    const index = targetList.findIndex((item) => item.id === file.id)
    if (index > -1) {
      targetList.splice(index, 1)
    }
  } else {
    const index = targetList.findIndex((item) => item === file)
    if (index > -1) {
      targetList.splice(index, 1)
    }
  }
}

/**
 * 删除车内照片
 */
export function handleInteriorDelete(file, detail, signatureData) {
  handleFileDelete(file, 'interior', detail, signatureData)
}

/**
 * 删除车外照片
 */
export function handleExteriorDelete(file, detail, signatureData) {
  handleFileDelete(file, 'exterior', detail, signatureData)
}

/**
 * 删除附件资料
 */
export function handleAttachmentDelete(file, detail, signatureData) {
  handleFileDelete(file, 'attachment', detail, signatureData)
}

// ==================== 业务校验函数 ====================

/**
 * 校验送修人信息
 */
export function validateRepairPerson(
  repairPersonType,
  repairPersonNameInput,
  repairPersonPhoneInput
) {
  if (repairPersonType === 'other') {
    if (!repairPersonNameInput.trim()) {
      showToast('请输入送修人姓名')
      return false
    }
    if (!repairPersonPhoneInput.trim()) {
      showToast('请输入送修人手机号')
      return false
    }
    if (!/^1[3-9]\d{9}$/.test(repairPersonPhoneInput.trim())) {
      showToast('请输入正确的手机号')
      return false
    }
  }
  return true
}

/**
 * 校验里程数
 */
export function validateMileage(mileage, lastMileage, netMileage) {
  if (mileage && lastMileage) {
    const mileageNum = Number(mileage)
    const lastMileageNum = Number(lastMileage)
    if (mileageNum < lastMileageNum) {
      showToast(`本次进店里程${mileageNum}小于上次进店里程数${lastMileageNum},请注意`)
    }
  }

  if (mileage && netMileage) {
    const mileageNum = Number(mileage)
    const netMileageNum = Number(netMileage)
    const diff = Math.abs(mileageNum - netMileageNum)
    if (diff > 300) {
      showToast('进店里程数和车联网里程数不符，请注意')
    }
  }
}

// ==================== 预警相关 ====================

/**
 * 获取预警等级颜色
 */
export function getAlarmColor(level) {
  switch (level) {
    case AlarmLevelEnum.CRITICAL:
      return 'red'
    case AlarmLevelEnum.WARNING:
      return 'yellow'
    case AlarmLevelEnum.NORMAL:
      return 'green'
    case AlarmLevelEnum.EXPIRED:
      return 'gray'
    default:
      return 'gray'
  }
}

/**
 * 获取预警等级标签
 */
export function getAlarmLabel(level) {
  switch (level) {
    case AlarmLevelEnum.CRITICAL:
      return '红色预警'
    case AlarmLevelEnum.WARNING:
      return '黄色预警'
    case AlarmLevelEnum.NORMAL:
      return '绿色预警'
    case AlarmLevelEnum.EXPIRED:
      return '已过期'
    default:
      return '未知'
  }
}

// ==================== 日期时间生成 ====================

/**
 * 生成预计交车日期列表（未来100天）
 */
export function generateDeliveryDates() {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 100; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    dates.push({
      value: `${year}-${month}-${day}`,
      label: `${year}-${month}-${day}`
    })
  }
  return dates
}

/**
 * 生成预计交车时间列表（08:00:00 到 18:00:00，每15分钟一个）
 */
export function generateDeliveryTimes() {
  const times = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
      times.push({ value: timeStr, label: timeStr })
    }
  }
  return times
}

// ==================== 故障模块 ====================

/**
 * 查询故障模块列表
 */
export async function fetchFaultModuleList(searchValue, faultModuleListRef) {
  try {
    const res = await getFaultModule(searchValue.trim())
    if (res.code === 200 && res.data) {
      faultModuleListRef.value = (res.data || []).map((item) => ({
        ...item,
        cccId: item.id
      }))
    } else {
      faultModuleListRef.value = []
    }
  } catch (error) {
    console.error('获取故障模块失败:', error)
    faultModuleListRef.value = []
  }
}

// ==================== 图片选择 ====================

/**
 * 选择图片来源（拍照或相册）
 */
export function onSelectImageSource(source, showImageUploadSheet, imageUploadRef) {
  showImageUploadSheet.value = false
  if (source === 'camera') {
    // 拍照模式，让原生处理
  } else {
    imageUploadRef.value?.click()
  }
}

/**
 * 验证售前保修只能单独开单
 * @returns {boolean} 是否通过验证
 */
export function validatePreSaleWarranty(selectedItems, selectedParts) {
  const allItems = [...selectedItems, ...selectedParts]
  const filteredItems = allItems.filter(
    (i) => i.warrantyTypeId === WarrantyTypeEnum.PRE_SALE_WARRANTY
  )
  if (filteredItems.length > 0 && allItems.length > filteredItems.length) {
    showToast({ message: '售前保修只能单独开单', 'z-index': 5100 })
    return false
  }
  return true
}

/**
 * 验证善意保修只能单独开单
 * @returns {boolean} 是否通过验证
 */
export function validateGoodWillWarranty(selectedItems, selectedParts) {
  const allItems = [...selectedItems, ...selectedParts]
  const filteredItems = allItems.filter(
    (i) => i.warrantyTypeId === WarrantyTypeEnum.GOODWILL_WARRANTY
  )
  if (filteredItems.length > 0 && allItems.length > filteredItems.length) {
    showToast({ message: '善意保修只能单独开单', 'z-index': 5100 })
    return false
  }
  return true
}
