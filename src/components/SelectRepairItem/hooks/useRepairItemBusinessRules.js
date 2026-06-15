import { ref } from 'vue'
import { CheckoutTypeEnum, WarrantyTypeEnum, UNIVERSAL_LABOR_HOUR_ITEM_ID, GENERAL_REPAIR_ID } from '@/views/repairWork/constant'
import { checkoutTypeIncluded, isWorkHourEditable, isQuantityEditable, isDiscountEditable, isNameEditable, isItemDeletable, isPartDeletable } from './repairItemRules'

/**
 * 把"一般整车保修"置顶到列表首位（仅用于弹窗展示，不污染原始数组）
 * @param {Array} list - 原始保修类型列表
 * @returns {Array} 置顶后的新数组
 */
const topGeneralFirst = (list) => {
  const idx = list.findIndex(it => it.id === GENERAL_REPAIR_ID)
  if (idx <= 0) return list
  const next = list.slice()
  const [target] = next.splice(idx, 1)
  next.unshift(target)
  return next
}

/**
 * 业务规则和级联选择器管理 Hook
 * 负责级联选择器选项构建
 * 纯业务规则函数从 repairItemRules.js 共享
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
  // ============ 级联选择器方法 ============

  /** 级联选择器弹窗显示状态 */
  const showCheckoutPicker = ref(false)
  /** 正在编辑的项目 */
  const editingItem = ref(null)
  /** 级联选择器选项 */
  const cascaderOptions = ref([])
  /**
   * 级联选择器挂载 key
   * 每次打开弹窗时自增，强制 AisCascader（含内部 van-cascader）销毁重建，
   * 避免 vant Cascader 内部 tabs.value 在弹窗关闭后保留陈旧状态，
   * 进而与下一次打开时新传入的 model-value/options 产生时序错位。
   */
  const cascaderKey = ref(0)

  /**
   * 根据编辑项上下文动态构建级联选项（带禁用规则 + 权限过滤）
   * @param {Object|null} item - 正在编辑的维修项目/零件，null表示无过滤
   * @returns {Array} 级联选项数组
   */
  const buildCascaderOptions = (item) => {
    const maintenanceTypes = rawMaintenanceTypes.value
    const checkoutTypes = rawCheckoutTypes.value
    const repairItemTypes = rawRepairItemTypes.value

    const isUniversal = item?.repairItemCode === UNIVERSAL_LABOR_HOUR_ITEM_ID
    const isPart = !!item?.partsId
    const isOemPart = Number(item?.oemPart || item?.isOemPart) === 1

    // 权限过滤
    const perm = dealerPermission.value
    const hasPerm = isPart ? perm.partHasPermission : perm.repairItemHasPermission
    const permCheckoutTypeIds = hasPerm ? (isPart ? perm.part.checkoutTypeIds : perm.repairItem.checkoutTypeIds) : null
    const permWarrantyTypeIds = hasPerm ? (isPart ? perm.part.warrantyTypeIds : perm.repairItem.warrantyTypeIds) : null
    // 随维修项目导入的零件维修类型不可修改，已保存过的维修项目维修类型不可修改
    const repairItemDisabled = isPart ? item.repairItemDisabled : (!!item.id || item.repairItemDisabled)

    return maintenanceTypes.map(mt => ({
      text: mt.message,
      value: mt.code,
      disabled: repairItemDisabled,
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
            children: topGeneralFirst(repairItemTypes)
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
                  value: `${mt.code}-${ct.code}-${rit.id}`,
                  rawValue: rit.id,
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
    // 自增 key，强制 AisCascader 销毁重建，确保 van-cascader 内部状态全新
    cascaderKey.value++
    showCheckoutPicker.value = true
  }

  /**
   * 结算类型确认选择
   * @param {Object} param - 选择参数
   * @param {Array} param.selectedOptions - 选中的选项数组
   */
  const onCheckoutConfirm = ({ selectedOptions }) => {
    const [level1, level2, level3] = selectedOptions || []
    // 防御性校验：三级选项必须完整，否则视为无效选择，不更新数据
    if (!level1 || !level2 || !level3) {
      showCheckoutPicker.value = false
      editingItem.value = null
      return
    }
    if (editingItem.value) {
      const item = editingItem.value
      const wasEditable = isWorkHourEditable(item)
      Object.assign(item, {
        repairItemTypeId: level1.value,
        repairItemTypeName: level1.text || '',
        checkoutTypeId: level2.value,
        checkoutTypeName: level2.text || '',
        warrantyTypeId: level3.rawValue ?? level3.value ?? '',
        warrantyTypeName: level3.text || ''
      })
      // 维修项目：工时从可编辑变为不可编辑时，恢复原始工时
      if (!item.partsId && wasEditable && !isWorkHourEditable(item)) {
        item.quantity = item.originalQuantity
        item.workHour = item.originalQuantity
      }
      // 保修或合同清空折扣价格
      if (checkoutTypeIncluded(level2.value)) {
        item.discountAmount = 0
      }
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
    cascaderKey,
    editingItem,
    showCheckoutPicker,
    buildCascaderOptions,
    openCheckoutPicker,
    onCheckoutConfirm,
    closeCheckoutPicker
  }
}
