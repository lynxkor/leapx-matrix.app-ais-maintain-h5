import { computed } from 'vue'

/**
 * 维修项目和零件列表分组计算 Hook
 * 负责将已选的项目和零件按套餐进行分组展示
 *
 * @param {Object} params - 参数对象
 * @param {import('vue').Ref<Array>} params.selectedItems - 已选维修项目
 * @param {import('vue').Ref<Array>} params.selectedParts - 已选维修零件
 * @returns {Object} Hook 返回的计算属性
 */
export default function useRepairItemList({ selectedItems, selectedParts }) {
  /**
   * 是否有任何已选项
   */
  const hasAnySelectedItems = computed(() => {
    return selectedItems.value.length > 0 || selectedParts.value.length > 0
  })

  /**
   * 常规维修项目（非套餐）
   */
  const regularItems = computed(() => {
    return selectedItems.value.filter(item => !item.packageId)
  })

  /**
   * 套餐维修项目分组
   */
  const packageItemGroups = computed(() => {
    const map = {}
    selectedItems.value.filter(item => item.packageId).forEach(item => {
      const key = item.packageId
      if (!map[key]) {
        map[key] = {
          key,
          title: `${item.packageTypeLabel || ''}-${item.packageCode || ''}`,
          items: []
        }
      }
      map[key].items.push(item)
    })
    return Object.values(map)
  })

  /**
   * 常规维修零件（非套餐）
   */
  const regularParts = computed(() => {
    return selectedParts.value.filter(item => !item.packageId)
  })

  /**
   * 套餐维修零件分组
   */
  const packagePartGroups = computed(() => {
    const map = {}
    selectedParts.value.filter(item => item.packageId).forEach(item => {
      const key = item.packageId
      if (!map[key]) {
        map[key] = {
          key,
          title: `${item.packageTypeLabel || ''}-${item.packageCode || ''}`,
          items: []
        }
      }
      map[key].items.push(item)
    })
    return Object.values(map)
  })

  return {
    hasAnySelectedItems,
    regularItems,
    packageItemGroups,
    regularParts,
    packagePartGroups
  }
}
