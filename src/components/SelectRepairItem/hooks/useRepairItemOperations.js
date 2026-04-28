import { ref } from 'vue'
import { showToast, showConfirmDialog, closeToast, showLoadingToast } from 'vant'
import { filterRepairItems, filterRepairParts, saveRepairItemInfo } from '@/api/repairWork'
import { WarrantyTypeEnum, UNIVERSAL_LABOR_HOUR_ITEM_ID, WorkRecordStatusEnum } from '@/views/repairWork/constant'

/**
 * 维修项目和零件的增删改查操作 Hook
 * 负责搜索、添加、更新、删除和保存操作
 *
 * @param {Object} params - 参数对象
 * @param {string} params.serviceProxyId - 服务代理ID
 * @param {import('vue').Ref<Array>} params.selectedItems - 已选维修项目
 * @param {import('vue').Ref<Array>} params.selectedParts - 已选维修零件
 * @param {Function} params.normalizeItem - 标准化维修项目方法
 * @param {Function} params.normalizePart - 标准化维修零件方法
 * @param {import('vue').Ref<string>} params.activeTab - 当前激活的标签
 * @param {import('vue').Ref<Object>} params.searchBarRef - 搜索栏组件引用
 * @returns {Object} Hook 返回的响应式数据和方法
 */
export default function useRepairItemOperations({
  serviceProxyId,
  selectedItems,
  selectedParts,
  normalizeItem,
  normalizePart,
  activeTab,
  searchBarRef
}) {
  // ============ 状态 ============

  /** 保存状态 */
  const saving = ref(false)

  // ============ 搜索操作 ============

  /**
   * 执行搜索
   * @param {string} keyword - 搜索关键词
   */
  const performSearch = async (keyword) => {
    showLoadingToast('请稍候...')
    try {
      const apiFn = activeTab.value === 'item' ? filterRepairItems : filterRepairParts
      const res = await apiFn({
        serviceProxyId: serviceProxyId,
        nameOrCodeOrPinyinLike: keyword,
        pageSize: 50
      })
      closeToast()
      if (res.code === 200) {
        searchBarRef.value?.setResults(res?.data || [])
      } else {
        searchBarRef.value?.setResults([])
        showToast(res.message || '搜索失败')
      }
    } catch {
      searchBarRef.value?.setResults([])
      showToast('搜索失败')
      closeToast()
    }
  }

  // ============ 添加操作 ============

  /**
   * 添加维修项目或零件
   * @param {Object} rawItem - 原始项目/零件数据
   */
  const handleAddItemWithParts = (rawItem) => {
    if (activeTab.value === 'item') {
      // 维修项目：添加项目 + 附带零件
      const exists = selectedItems.value.filter(
        el => el.repairItemId !== UNIVERSAL_LABOR_HOUR_ITEM_ID && el.workRecordStatus !== WorkRecordStatusEnum.COMPLETED
      ).find(el => el.repairItemId === rawItem.id)
      if (exists) {
        showToast({ message: '请勿重复添加', 'z-index': 5100 })
        return
      }
      rawItem.repairItemId = rawItem.id
      delete rawItem.id
      const projectItem = normalizeItem(rawItem)
      selectedItems.value.push(projectItem)

      // 同时添加附带零件
      const parts = (rawItem.partsRespList || []).map((el) => {
        delete el.id
        el.isBindltem = 1
        const res = normalizePart(el)
        Object.assign(res, {
          repairItemTypeId: rawItem.repairItemTypeId || res.repairItemTypeId,
          repairItemTypeName: rawItem.repairItemTypeName || res.repairItemTypeName
        })
        return res
      })
      selectedParts.value.push(...parts)

      // 展示操作卡片组
      searchBarRef.value?.showActiveCards([projectItem, ...parts])
      showToast({ message: '添加成功', 'z-index': 5100 })
    } else {
      // 零件：直接添加
      const exists = selectedParts.value.some((i) => i.partsId === rawItem.id && !i.isOutstock)
      if (exists) {
        showToast({ message: '请勿重复添加', 'z-index': 5100 })
        return
      }
      rawItem.partsId = rawItem.id
      delete rawItem.id
      const newItem = normalizePart(rawItem)
      selectedParts.value.push(newItem)
      searchBarRef.value?.showActiveCards([newItem])
      showToast({ message: '添加成功', 'z-index': 5100 })
    }
  }

  // ============ 更新操作 ============

  /**
   * 统一字段更新
   * @param {Object} item - 要更新的项目/零件
   * @param {Object} updates - 更新的字段
   * @param {Function} openCheckoutPicker - 打开结算类型选择器的方法
   */
  const handleItemUpdate = (item, updates, openCheckoutPicker) => {
    if (updates._action === 'checkout') {
      openCheckoutPicker(item)
      return
    }
    Object.assign(item, updates)
  }

  // ============ 删除操作 ============

  /**
   * 移除已选项
   * @param {Object} item - 要移除的项目/零件
   * @param {string} type - 类型 'item' | 'part'
   */
  const removeItem = (item, type) => {
    const list = type === 'item' ? selectedItems : selectedParts
    const idx = list.value.indexOf(item)
    if (idx === -1) return

    // 如果是套餐内的项目或零件，需要确认删除整个套餐
    if (item.packageId) {
      showConfirmDialog({
        title: '提示',
        message: '本操作视为您取消核销本次权益套餐，请确认',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        'z-index': 5100
      }).then(() => {
        // 确认后删除该套餐相关的所有项目和零件
        const packageId = item.packageId
        selectedItems.value = selectedItems.value.filter(i => i.packageId !== packageId)
        selectedParts.value = selectedParts.value.filter(i => i.packageId !== packageId)
      }).catch(() => {
        // 取消删除，不做任何操作
      })
    } else {
      // 普通项目/零件，直接删除
      list.value.splice(idx, 1)
    }
  }

  // ============ 保存操作 ============

  /**
   * 验证售前保修只能单独开单
   * @returns {boolean} 是否通过验证
   */
  const validatePreSaleWarranty = () => {
    const allItems = [...selectedItems.value, ...selectedParts.value]
    const filteredItems = allItems.filter(i => i.warrantyTypeId === WarrantyTypeEnum.PRE_SALE_WARRANTY)
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
  const validateGoodWillWarranty = () => {
    const allItems = [...selectedItems.value, ...selectedParts.value]
    const filteredItems = allItems.filter(i => i.warrantyTypeId === WarrantyTypeEnum.GOODWILL_WARRANTY)
    if (filteredItems.length > 0 && allItems.length > filteredItems.length) {
      showToast({ message: '善意保修只能单独开单', 'z-index': 5100 })
      return false
    }
    return true
  }

  /**
   * 保存维修项目和零件信息
   * @param {Function} onSuccess - 成功回调
   * @returns {Promise<boolean>} 是否保存成功
   */
  const handleSave = async (onSuccess) => {
    if (selectedItems.value.length === 0 && selectedParts.value.length === 0) return false

    // 售前保修只能单独开单
    if (!validatePreSaleWarranty()) return false

    // 善意保修只能单独开单
    if (!validateGoodWillWarranty()) return false

    try {
      saving.value = true
      const res = await saveRepairItemInfo({
        itemList: selectedItems.value,
        partsList: selectedParts.value,
        discountId: '',
        serviceProxyId: serviceProxyId
      })
      if (res?.code === 200) {
        showToast({ message: '保存成功', 'z-index': 5100 })
        if (onSuccess) {
          onSuccess({
            items: selectedItems.value,
            parts: selectedParts.value
          })
        }
        return true
      } else {
        showToast({ message: res?.message || '保存失败', 'z-index': 5100 })
        return false
      }
    } catch (error) {
      console.error('保存失败:', error)
      showToast({ message: '保存失败', 'z-index': 5100 })
      return false
    } finally {
      saving.value = false
    }
  }

  // ============ 公开 API ============

  return {
    // 状态
    saving,

    // 搜索操作
    performSearch,

    // 添加操作
    handleAddItemWithParts,

    // 更新操作
    handleItemUpdate,

    // 删除操作
    removeItem,

    // 保存操作
    handleSave,
    validatePreSaleWarranty
  }
}
