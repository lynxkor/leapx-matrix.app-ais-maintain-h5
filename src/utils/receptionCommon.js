import { showToast } from 'vant'
import { nextTick } from 'vue'
import { AlarmLevelEnum, WarrantyTypeEnum, PackageTypeEnum } from '@/views/repairWork/constant'
import { RepairOrderStatusEnum, FAULT_REMIND_REPAIR_TYPES } from '@/views/reception/constant'
import { deleteAttachmentConfig } from '@/libs/api/fileConfig'
import { getFaultModule, getRecentlyServiceProxy } from '@/api/reception'

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
  const url = file?.fileUrl || file?.url || file?.authFileUrl || ''
  if (!url) return ''
  // 如果是带签名的完整URL，提取 /VirtualUrl/... 路径部分
  const match = url.match(/\/VirtualUrl\/[^?]+/)
  return match ? match[0] : url
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
    const fileId = item.uploadId || item.fileId || item.id
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
 *
 * 后端返回结构（YAPI AttachmentConfigResp）：
 *   { code, data: { id, configCode, detailList: [{ attachType, acceptSuffix, maxSize, maxNum, required, ... }] } }
 * 即 res.data 本身就是配置对象，detailList 直接挂在 res.data 下，没有 .value 包裹。
 * 兼容：传 ref 整体（ref.value 取 detailList）或传 plain object 都行。
 */
export function getAttachConfig(attachType, uploadConfig) {
  const cfg = uploadConfig?.value || uploadConfig || {}
  const detailList = cfg.detailList || []
  return detailList.find((item) => item.attachType === attachType) || {}
}

/**
 * 解析后端下发的 acceptSuffix（带点、逗号隔开，如 ".jpg,.png,.heic"）
 * - 自动 trim、统一小写、缺 `.` 自动补
 * - 返回 Set<'.ext'> 或 null（未配置时不校验）
 */
export function parseAcceptSuffix(acceptSuffix) {
  if (acceptSuffix == null) return null
  const raw = String(acceptSuffix).trim()
  if (!raw) return null
  const set = new Set()
  raw.split(',').forEach((item) => {
    const v = String(item).trim().toLowerCase()
    if (!v) return
    set.add(v.startsWith('.') ? v : `.${v}`)
  })
  return set.size > 0 ? set : null
}

/**
 * 校验 url 后缀是否在白名单内（针对 native 返回的图片地址）
 * - 未配置 acceptSuffix 时返回 { ok: true }（放行）
 * - url 无后缀时返回 { ok: true }（保守放行，避免误伤鉴权链接）
 * @param {string} url native 返回的图片地址
 * @param {object} config getAttachConfig 返回的单条配置项（含 acceptSuffix）
 * @returns {{ok: boolean, ext?: string, allowed?: string}}
 */
export function validateFileExtension(url, config) {
  const cfg = config || {}
  const allowSet = parseAcceptSuffix(cfg.acceptSuffix)
  console.log('[validateFileExtension] url:', url, 'acceptSuffix:', cfg.acceptSuffix, 'allowSet:', allowSet ? Array.from(allowSet) : null)
  if (!allowSet) return { ok: true }

  let ext = ''
  try {
    const cleaned = String(url || '').split('?')[0].split('#')[0]
    const slashIdx = cleaned.lastIndexOf('/')
    const path = slashIdx >= 0 ? cleaned.slice(slashIdx + 1) : cleaned
    const dotIdx = path.lastIndexOf('.')
    if (dotIdx > 0 && dotIdx < path.length - 1) {
      ext = '.' + path.slice(dotIdx + 1).toLowerCase()
    }
  } catch {
    return { ok: true }
  }
  console.log('[validateFileExtension] parsed ext:', ext)
  if (!ext) return { ok: true }

  if (allowSet.has(ext)) return { ok: true }
  const allowed = Array.from(allowSet)
    .map((s) => s.replace(/^\./, ''))
    .join(', ')
  return { ok: false, ext: ext.replace(/^\./, ''), allowed }
}

/**
 * 判断 uploadFileByUrl 返回是否"成功但后端静默失败"
 * （如 HEIC 等不被支持格式：res.code === 200 但 data 字段全 null）
 * @param {object} res 接口返回
 * @returns {boolean}
 */
export function isUploadSilentFailure(res) {
  if (!res || res.code !== 200) return false
  const data = res.data
  if (Array.isArray(data)) {
    const first = data[0] || {}
    return !first.id && !first.url && !first.authFileUrl && !first.fileUrl
  }
  if (data && typeof data === 'object') {
    return !data.id && !data.url && !data.authFileUrl && !data.fileUrl
  }
  return true
}

/**
 * 以服务端最新数据刷新当前 attachType 对应的文件列表
 *
 * 背景：uploadFileByUrl 返回的 id 是前端占位用的"假 id"，不能直接用于
 *       deleteAttachmentConfig（删除会失败）。必须重新拉 getFileList 拿真实 id。
 *
 * @param {object} params
 * @param {string} params.businessId 业务 id（施工单 id）。create 场景为 null 时跳过 refresh
 * @param {string} params.attachType 当前上传的 attachType（"车内照片"/"车外照片"/"附件资料"）
 * @param {Array} params.targetList 要刷新的目标数组（detail.interiorImages 等）
 * @param {Function} params.getFileListApi getFileList 接口（从 '@/libs/api/fileConfig' 导入）
 * @returns {Promise<boolean>} true=刷新成功；false=跳过或失败
 */
export async function refreshAttachmentList({ businessId, attachType, targetList, getFileListApi }) {
  // create 场景下没有真实业务 id，跳过 refresh 保留前端拼装对象
  if (!businessId) return false
  try {
    const res = await getFileListApi({
      businessId,
      sortColumns: [{ column: 'id', sort: 'ASC' }]
    })
    if (res.code !== 200) return false

    const serverList = (res.data || []).filter((item) => item.attachType === attachType)
    // 用服务端真实数据整体替换（含真实 id / fileUrl / authFileUrl）
    targetList.splice(0, targetList.length, ...serverList.map((item) => ({
      ...item,
      url: item.fileUrl || item.url || '',
      fileUrl: item.fileUrl || item.url || '',
      authFileUrl: item.authFileUrl || item.fileUrl || item.url || '',
      fileType: item.fileType || item.ext || getFileType(item, 'image/jpeg'),
      status: 'done'
    })))
    return true
  } catch (error) {
    console.error('刷新附件列表失败:', error)
    return false
  }
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
      return { valid: false, errorField: 'repairPersonName' }
    }
    if (!repairPersonPhoneInput.trim()) {
      showToast('请输入送修人手机号')
      return { valid: false, errorField: 'repairPersonPhone' }
    }
  }
  if (repairPersonPhoneInput?.trim() && !/^1[3-9]\d{9}$/.test(repairPersonPhoneInput.trim())) {
    showToast('请输入正确的手机号')
    return { valid: false, errorField: 'repairPersonPhone' }
  }
  return { valid: true }
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

/**
 * 验证商城订单只能单独开单
 * @returns {boolean} 是否通过验证
 */
export function validateStoreOrder(selectedItems, selectedParts) {
  const allItems = [...selectedItems, ...selectedParts]
  const filteredItems = allItems.filter(
    (i) => String(i.packageType) === PackageTypeEnum.STORE
  )
  if (filteredItems.length > 0 && allItems.length > filteredItems.length) {
    showToast({ message: '商城订单只能单独开单', 'z-index': 5100 })
    return false
  }
  return true
}

/**
 * 单独开单校验规则配置
 * - matcher: 命中规则的项目/零件判定函数
 * - message: 命中规则且未单独开单时的提示文案
 */
const ALONE_ORDER_RULES = [
  {
    message: '售前保修只能单独开单',
    matcher: (i) => i.warrantyTypeId === WarrantyTypeEnum.PRE_SALE_WARRANTY
  },
  {
    message: '善意保修只能单独开单',
    matcher: (i) => i.warrantyTypeId === WarrantyTypeEnum.GOODWILL_WARRANTY
  },
  {
    message: '商城订单只能单独开单',
    matcher: (i) => String(i.packageType) === PackageTypeEnum.STORE
  }
]

/**
 * 验证单独开单逻辑
 *
 * 汇总售前保修、善意保修、商城订单三类「只能单独开单」的校验：
 * 只要某类项目/零件存在，就不允许与其它项目/零件混在一个工单中。
 *
 * @param {Array} selectedItems 选中的维修项目
 * @param {Array} selectedParts 选中的备件
 * @returns {boolean} 是否通过验证
 */
export function validateAloneOrder(selectedItems, selectedParts) {
  const allItems = [...(selectedItems || []), ...(selectedParts || [])]
  for (const rule of ALONE_ORDER_RULES) {
    const filteredItems = allItems.filter(rule.matcher)
    if (filteredItems.length > 0 && allItems.length > filteredItems.length) {
      showToast({ message: rule.message, 'z-index': 5100 })
      return false
    }
  }
  return true
}

// ==================== 表单校验滚动定位 ====================

const FIELD_SELECTOR_MAP = {
  mileage: '[data-scroll-target="mileage"]',
  repairPersonName: '[data-scroll-target="repairPersonName"]',
  repairPersonPhone: '[data-scroll-target="repairPersonPhone"]',
  customerFaultDesc: '[data-scroll-target="customerFaultDesc"]',
  faultModules: '[data-scroll-target="faultModules"]',
  interiorPhotos: '[data-scroll-target="interiorPhotos"]',
  exteriorPhotos: '[data-scroll-target="exteriorPhotos"]',
  abnormalDesc: '[data-scroll-target="abnormalDesc"]',
  testResult: '[data-scroll-target="testResult"]'
}

/**
 * 校验失败时滚动到对应表单项并聚焦
 */
export function scrollToErrorField({ errorField, activeTab, repairPersonCollapse }) {
  if (activeTab.value !== 'inspection') {
    activeTab.value = 'inspection'
  }
  if (['repairPersonName', 'repairPersonPhone'].includes(errorField)) {
    if (!repairPersonCollapse.value.includes('repairPerson')) {
      repairPersonCollapse.value = ['repairPerson']
    }
  }
  nextTick(() => {
    setTimeout(() => {
      const selector = FIELD_SELECTOR_MAP[errorField]
      if (!selector) return
      const el = document.querySelector(selector)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const target = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el : el.querySelector('input, textarea')
      if (target && !target.disabled) target.focus()
    }, 300)
  })
}

// ==================== 近期环检信息回显 ====================

/**
 * 按 fileUrl 追加去重，避免同一 VIN 重复合并产生重复照片
 */
function appendUniquePhotos(targetList, newList) {
  const exist = new Set((targetList || []).map((i) => i.fileUrl || i.url))
  return [...(targetList || []), ...newList.filter((p) => p && !exist.has(p.fileUrl))]
}

/**
 * 拉取该 VIN 上次环检数据并合并到 detail（车内/车外照片、异常描述）。
 * 已作废（210）、反结算（200）状态不回显。
 *
 * 注：状态判断使用 Number() 转换，兼容后端可能返回字符串状态码（如 "210"/"200"）的场景。
 *
 * @param {string} vin 车辆 VIN
 * @param {object} detail 详情对象（需包含 interiorImages / exteriorImages / abnormalDesc）
 * @param {object} [options]
 * @param {string|number|null} [options.businessId=null] 合并照片时携带的业务 ID（create 场景传 null，edit 场景传施工单 ID）
 */
export async function applyRecentInspectionByVin(vin, detail, { businessId = null } = {}) {
  if (!vin || !detail) return
  // 防御性初始化，确保即使外部未声明字段也不报错
  if (!Array.isArray(detail.interiorImages)) detail.interiorImages = []
  if (!Array.isArray(detail.exteriorImages)) detail.exteriorImages = []
  try {
    const res = await getRecentlyServiceProxy(vin)
    if (res.code !== 200 || !res.data) return
    const recentData = res.data
    // 已作废、反结算状态不回显（兼容字符串状态码）
    const status = Number(recentData.orderStatus)
    if (status === RepairOrderStatusEnum.CANCEL || status === RepairOrderStatusEnum.ANTI_SETTLEMENT) return
    // 合并车内照片（按 fileUrl 去重）
    if (recentData.interiorPhotoList && recentData.interiorPhotoList.length > 0) {
      detail.interiorImages = appendUniquePhotos(
        detail.interiorImages,
        recentData.interiorPhotoList.map((photo) => ({
          ...photo,
          url: photo.fileUrl,
          id: null,
          businessId
        }))
      )
    }
    // 合并车外照片（按 fileUrl 去重）
    if (recentData.exteriorPhotoList && recentData.exteriorPhotoList.length > 0) {
      detail.exteriorImages = appendUniquePhotos(
        detail.exteriorImages,
        recentData.exteriorPhotoList.map((photo) => ({
          ...photo,
          url: photo.fileUrl,
          id: null,
          businessId
        }))
      )
    }
    // 回显异常描述
    if (recentData.anomalyDescription) {
      detail.abnormalDesc = recentData.anomalyDescription
    }
  } catch (error) {
    console.error('获取上次环检信息失败:', error)
  }
}

// ==================== 故障提醒 ====================

/**
 * 判断本次维修类型是否包含故障提醒的三类维修（一般维修/三电维修/保修）
 * @param {string} typeCollect 维修类型汇总字符串（如 repairItemTypeDetailCollect，或由项目/零件类型名拼接而成）
 * @returns {boolean}
 */
export function hasFaultRemindType(typeCollect) {
  if (!typeCollect) return false
  const collect = String(typeCollect)
  return FAULT_REMIND_REPAIR_TYPES.some((t) => collect.includes(t))
}
