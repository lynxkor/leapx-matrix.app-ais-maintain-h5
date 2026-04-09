import { ref } from 'vue'
import { CheckoutTypeEnum, WarrantyTypeEnum, UNIVERSAL_LABOR_HOUR_ITEM_ID, WorkRecordStatusEnum } from '@/views/repairWork/constant'

/**
 * 业务规则和级联选择器管理 Hook
 * 负责字段可编辑性判断、项目删除判断和级联选择器选项构建
 *
 * @param {Object} params - 参数对象
 * @param {import('vue').Ref<Object>} params.dealerPermission - 经销商权限
 * @param {import('vue').Ref<Array>} params.rawMaintenanceTypes - 原始维修类型枚举
 * @param {import('vue').Ref<Array>} params.rawCheckoutTypes - 原始结算类型枚举
 * @param {import('vue').Ref<Array>} params.rawRepairItemTypes - 原始保修类型映射数据
 * @param {import('vue').Ref<Array>} params.selectedItems - 已选维修项目
 * @param {import('vue').Ref<Array>} params.selectedParts - 已选维修零件
 * @returns {Object} Hook 返回的响应式数据和方法
 */
export default function useRepairItemBusinessRules({
  dealerPermission,
  rawMaintenanceTypes,
  rawCheckoutTypes,
  rawRepairItemTypes,
  selectedItems,
  selectedParts
}) {
  // ============ 私有方法 ============

  /**
   * 判断结算类型是否为保修或合同
   * @param {string} typeId - 结算类型ID
   * @returns {boolean}
   */
  const checkoutTypeIncluded = (typeId) => {
    return typeId === CheckoutTypeEnum.WARRANTY || typeId === CheckoutTypeEnum.CONTRACT
  }

  // ============ 业务规则方法 ============

  /**
   * 工时可编辑（维修项目步进器）
   * @param {Object} item - 维修项目/零件
   * @returns {boolean}
   */
  const isWorkHourEditable = (item) => {
    const isUniversal = item.repairItemId === UNIVERSAL_LABOR_HOUR_ITEM_ID
    // 保修/合同 + (保修专用 or 生产类专用) → 可编辑
    if (checkoutTypeIncluded(item.checkoutTypeId) && (item.isWarranty === 1 || item.isProdType === 1)) {
      return true
    }
    // 万能工时 + 未完工 → 可编辑
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
  const isQuantityEditable = (item) => {
    return !item.isOutstock
  }

  /**
   * 优惠金额可编辑
   * @param {Object} item - 维修项目/零件
   * @returns {boolean}
   */
  const isDiscountEditable = (item) => {
    return !checkoutTypeIncluded(item.checkoutTypeId)
  }

  /**
   * 维修项目名称可编辑：仅万能工时新增未保存
   * @param {Object} item - 维修项目
   * @returns {boolean}
   */
  const isNameEditable = (item) => {
    const isUniversal = item.repairItemId === UNIVERSAL_LABOR_HOUR_ITEM_ID
    return isUniversal && !item.id && !item.packageId
  }

  /**
   * 维修项目是否可删除
   * @param {Object} item - 维修项目
   * @returns {boolean}
   */
  const isItemDeletable = (item) => {
    if (item.packageId && item.workRecordStatus === WorkRecordStatusEnum.COMPLETED) return false
    return true
  }

  /**
   * 零件是否可删除
   * @param {Object} item - 维修零件
   * @returns {boolean}
   */
  const isPartDeletable = (item) => {
    if (item.isOutstock) return false
    if (item.packageId && item.workRecordStatus === WorkRecordStatusEnum.COMPLETED) return false
    return true
  }

  // ============ 级联选择器方法 ============

  /** 级联选择器弹窗显示状态 */
  const showCheckoutPicker = ref(false)
  /** 正在编辑的项目 */
  const editingItem = ref(null)
  /** 级联选择器选项 */
  const cascaderOptions = ref([])

  /**
   * 根据编辑项上下文动态构建级联选项（带禁用规则 + 权限过滤）
   * @param {Object|null} item - 正在编辑的维修项目/零件，null表示无过滤
   * @returns {Array} 级联选项数组
   */
  const buildCascaderOptions = (item) => {
    const maintenanceTypes = rawMaintenanceTypes.value
    const checkoutTypes = rawCheckoutTypes.value
    const repairItemTypes = rawRepairItemTypes.value

    const isUniversal = item?.repairItemId === UNIVERSAL_LABOR_HOUR_ITEM_ID
    const isPart = !!item?.partsId
    const isOemPart = item?.isOemPart === 1

    // 权限过滤
    const perm = dealerPermission.value
    const hasPerm = isPart ? perm.partHasPermission : perm.repairItemHasPermission
    const permCheckoutTypeIds = hasPerm ? (isPart ? perm.part.checkoutTypeIds : perm.repairItem.checkoutTypeIds) : null
    const permWarrantyTypeIds = hasPerm ? (isPart ? perm.part.warrantyTypeIds : perm.repairItem.warrantyTypeIds) : null

    return maintenanceTypes.map(mt => ({
      text: mt.message,
      value: mt.code,
      children: checkoutTypes
        // 权限过滤：不显示不被允许的结算类型
        .filter(ct => !hasPerm || !permCheckoutTypeIds.length || permCheckoutTypeIds.includes(ct.code))
        .map(ct => {
          // 结算类型禁用规则
          let ctDisabled = false
          if (isUniversal && checkoutTypeIncluded(ct.code)) {
            // 万能工时 → 禁用保修/合同
            ctDisabled = true
          }
          if (isPart && !isOemPart && checkoutTypeIncluded(ct.code)) {
            // 非原厂零件 → 禁用保修/合同
            ctDisabled = true
          }

          return {
            text: ct.message,
            value: ct.code,
            disabled: ctDisabled,
            children: repairItemTypes
              .filter(rit => rit.checkoutTypeId === ct.code)
              // 权限过滤：不显示不被允许的保修类型
              .filter(rit => !hasPerm || !permWarrantyTypeIds.length || permWarrantyTypeIds.includes(rit.id))
              .map(rit => {
                // 保修类型禁用规则
                let wtDisabled = false
                if (ct.code === CheckoutTypeEnum.WARRANTY && rit.id === WarrantyTypeEnum.TECHNICAL_SERVICE_ACTIVITY) {
                  // 结算=保修 → 禁用技术服务活动
                  wtDisabled = true
                }
                if (ct.code === CheckoutTypeEnum.CONTRACT && [
                  WarrantyTypeEnum.FREE_MAINTENANCE,
                  WarrantyTypeEnum.LIFETIME_MAINTENANCE,
                  WarrantyTypeEnum.MAINTENANCE_PACKAGE
                ].includes(rit.id)) {
                  // 结算=合同 → 禁用免费保养/终身保养/保养套餐
                  wtDisabled = true
                }
                return {
                  text: rit.name,
                  value: rit.id,
                  disabled: wtDisabled
                }
              })
          }
        })
    }))
  }

  /**
   * 打开结算类型选择器
   * @param {Object} item - 要编辑的项目
   */
  const openCheckoutPicker = (item) => {
    editingItem.value = item
    cascaderOptions.value = buildCascaderOptions(item)
    showCheckoutPicker.value = true
  }

  /**
   * 结算类型确认选择
   * @param {Object} param - 选择参数
   * @param {Array} param.selectedOptions - 选中的选项数组
   */
  const onCheckoutConfirm = ({ selectedOptions }) => {
    const [level1, level2, level3] = selectedOptions || []
    if (editingItem.value) {
      Object.assign(editingItem.value, {
        repairItemTypeId: level1?.value || '',
        repairItemTypeName: level1?.text || '',
        checkoutTypeId: level2?.value || '',
        checkoutTypeName: level2?.text || '',
        warrantyTypeId: level3?.value || '',
        warrantyTypeName: level3?.text || ''
      })
    }
    showCheckoutPicker.value = false
    editingItem.value = null
  }

  /**
   * 关闭结算类型选择器
   */
  const closeCheckoutPicker = () => {
    showCheckoutPicker.value = false
    editingItem.value = null
  }

  // ============ 公开 API ============

  return {
    // 业务规则方法
    isWorkHourEditable,
    isQuantityEditable,
    isDiscountEditable,
    isNameEditable,
    isItemDeletable,
    isPartDeletable,

    // 级联选择器
    cascaderOptions,
    editingItem,
    showCheckoutPicker,
    buildCascaderOptions,
    openCheckoutPicker,
    onCheckoutConfirm,
    closeCheckoutPicker
  }
}
