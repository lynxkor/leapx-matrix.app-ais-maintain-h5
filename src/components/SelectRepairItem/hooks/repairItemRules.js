import { CheckoutTypeEnum, UNIVERSAL_LABOR_HOUR_ITEM_ID, WorkRecordStatusEnum, PackageTypeEnum } from '@/views/repairWork/constant'

/**
 * 判断结算类型是否为保修或合同
 * @param {string} typeId - 结算类型ID
 * @returns {boolean}
 */
export const checkoutTypeIncluded = (typeId) => {
  return typeId === CheckoutTypeEnum.WARRANTY || typeId === CheckoutTypeEnum.CONTRACT
}

/**
 * 工时可编辑（维修项目步进器）
 * @param {Object} item - 维修项目/零件
 * @returns {boolean}
 */
export const isWorkHourEditable = (item) => {
  const isUniversal = item.repairItemCode === UNIVERSAL_LABOR_HOUR_ITEM_ID
  if (checkoutTypeIncluded(item.checkoutTypeId) && (item.isWarranty === 1 || item.isProdType === 1)) {
    return true
  }
  if (isUniversal && item.workRecordStatus !== WorkRecordStatusEnum.COMPLETED) {
    return true
  }
  return false
}

/**
 * 数量可编辑（零件步进器）
 * @param {Object} item - 维修零件
 * @returns {boolean}
 */
export const isQuantityEditable = (item) => {
  return !item.isOutstock && !item.packageId
}

/**
 * 优惠金额可编辑
 * @param {Object} item - 维修项目/零件
 * @returns {boolean}
 */
export const isDiscountEditable = (item) => {
  return !checkoutTypeIncluded(item.checkoutTypeId) || String(item.packageType) === PackageTypeEnum.STORE
}

/**
 * 维修项目名称可编辑：仅万能工时新增未保存
 * @param {Object} item - 维修项目
 * @returns {boolean}
 */
export const isNameEditable = (item) => {
  const isUniversal = item.repairItemCode === UNIVERSAL_LABOR_HOUR_ITEM_ID
  return isUniversal && Number(item.workRecordStatus || 0) < WorkRecordStatusEnum.COMPLETED && !item.packageId
}

/**
 * 维修项目是否可删除
 * @param {Object} item - 维修项目
 * @returns {boolean}
 */
export const isItemDeletable = (item) => {
  if (item.packageId && item.workRecordStatus === WorkRecordStatusEnum.COMPLETED) return false
  return true
}

/**
 * 零件是否可删除
 * @param {Object} item - 维修零件
 * @returns {boolean}
 */
export const isPartDeletable = (item) => {
  if (item.isOutstock) return false
  if (item.packageId && item.workRecordStatus === WorkRecordStatusEnum.COMPLETED) return false
  return true
}
