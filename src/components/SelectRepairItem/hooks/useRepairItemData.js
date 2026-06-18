import { ref } from 'vue'
import { getEnum, getRepairItemTypeMap, getRepairItemTypeList, getRepairItemInfo, getDealerPermission } from '@/api/repairWork'
import { UNIVERSAL_LABOR_HOUR_ITEM_ID, CheckoutTypeEnum } from '@/views/repairWork/constant'

/**
 * 数据获取、权限管理和数据标准化 Hook
 * 负责加载枚举数据、权限数据和维修项目/零件数据，并提供数据标准化方法
 *
 * @param {Object} params - 参数对象
 * @param {string} params.serviceProxyId - 服务代理ID
 * @returns {Object} Hook 返回的响应式数据和方法
 */
export default function useRepairItemData({ serviceProxyId }) {
  // ============ 状态 ============

  /** 加载状态 */
  const loading = ref(false)

  /** 原始枚举数据 */
  const rawCheckoutTypes = ref([])
  const rawRepairItemTypes = ref([])
  const rawMaintenanceTypes = ref([])

  /** 枚举默认值 */
  const enumDefaults = ref({})

  /** 已选数据 */
  const selectedItems = ref([])
  const selectedParts = ref([])

  /** 接口返回的额外数据（除两个列表外的字段） */
  const extraInfo = ref({})

  /** 经销商权限配置 */
  const dealerPermission = ref({
    repairItemHasPermission: false,
    partHasPermission: false,
    repairItem: { checkoutTypeIds: [], warrantyTypeIds: [] },
    part: { checkoutTypeIds: [], warrantyTypeIds: [] }
  })

  // ============ 私有方法 ============

  /**
   * 判断结算类型是否为保修或合同
   * @param {string} typeId - 结算类型ID
   * @returns {boolean}
   */
  const checkoutTypeIncluded = (typeId) => {
    return typeId === CheckoutTypeEnum.WARRANTY || typeId === CheckoutTypeEnum.CONTRACT
  }

  /**
   * 加载经销商权限数据
   */
  const loadPermissionData = async() => {
    try {
      const res = await getDealerPermission({})
      const list = res?.data || []
      const repairItemPerms = list.filter(item => item.permissionType === 10)
      const partPerms = list.filter(item => item.permissionType === 20)
      dealerPermission.value = {
        repairItemHasPermission: repairItemPerms.length > 0,
        partHasPermission: partPerms.length > 0,
        repairItem: {
          checkoutTypeIds: [...new Set(repairItemPerms.map(p => p.checkoutTypeId))],
          warrantyTypeIds: [...new Set(repairItemPerms.map(p => p.repairItemTypeId))]
        },
        part: {
          checkoutTypeIds: [...new Set(partPerms.map(p => p.checkoutTypeId))],
          warrantyTypeIds: [...new Set(partPerms.map(p => p.repairItemTypeId))]
        }
      }
    } catch (_e) { // eslint-disable-line no-unused-vars
      console.warn('加载权限数据失败')
    }
  }

  /**
   * 根据项目类型获取权限过滤后的默认结算/保修类型
   * @param {boolean} isPart - 是否为零件
   * @returns {Object|null} 权限过滤后的默认值
   */
  const getPermFilteredDefaults = (isPart) => {
    const perm = dealerPermission.value
    const hasPerm = isPart ? perm.partHasPermission : perm.repairItemHasPermission
    if (!hasPerm) return null

    const checkoutTypeIds = isPart ? perm.part.checkoutTypeIds : perm.repairItem.checkoutTypeIds
    const warrantyTypeIds = isPart ? perm.part.warrantyTypeIds : perm.repairItem.warrantyTypeIds

    // 过滤允许的结算类型
    const allowedCTs = checkoutTypeIds.length > 0
      ? rawCheckoutTypes.value.filter(ct => checkoutTypeIds.includes(ct.code))
      : []
    const firstCT = allowedCTs[0]

    // 过滤允许的保修类型（同时匹配结算类型）
    const allowedWTs = warrantyTypeIds.length > 0
      ? rawRepairItemTypes.value.filter(rit =>
        warrantyTypeIds.includes(rit.id) && rit.checkoutTypeId === firstCT?.code
      )
      : []
    const firstWT = allowedWTs[0]

    return {
      checkoutTypeId: firstCT?.code || '',
      checkoutTypeName: firstCT?.message || '',
      warrantyTypeId: firstWT?.id || '',
      warrantyTypeName: firstWT?.name || ''
    }
  }

  /**
   * 标准化维修项目数据
   * @param {Object} raw - 原始数据
   * @returns {Object} 标准化后的数据
   */
  const normalizeItem = (raw) => {
    const isUniversal = (raw.repairItemCode || raw.code) === UNIVERSAL_LABOR_HOUR_ITEM_ID
    // 优先使用权限过滤后的默认值
    const permDefaults = getPermFilteredDefaults(false)
    let defaultCheckoutTypeId = permDefaults?.checkoutTypeId || enumDefaults.value.checkoutTypeId
    let defaultCheckoutTypeName = permDefaults?.checkoutTypeName || enumDefaults.value.checkoutTypeName
    let defaultWarrantyTypeId = permDefaults?.warrantyTypeId || enumDefaults.value.warrantyTypeId
    let defaultWarrantyTypeName = permDefaults?.warrantyTypeName || enumDefaults.value.warrantyTypeName

    // 万能工时：默认结算类型跳过保修/合同（在权限过滤基础上进一步过滤）
    if (isUniversal) {
      const perm = dealerPermission.value
      const allowedCTs = perm.repairItemHasPermission && perm.repairItem.checkoutTypeIds.length > 0
        ? rawCheckoutTypes.value.filter(ct => perm.repairItem.checkoutTypeIds.includes(ct.code))
        : rawCheckoutTypes.value
      const nonIncluded = allowedCTs.find(ct => !checkoutTypeIncluded(ct.code))
      if (nonIncluded) {
        defaultCheckoutTypeId = nonIncluded.code
        defaultCheckoutTypeName = nonIncluded.message
        const matchingWarranty = rawRepairItemTypes.value.find(rit => rit.checkoutTypeId === nonIncluded.code)
        defaultWarrantyTypeId = matchingWarranty?.id || ''
        defaultWarrantyTypeName = matchingWarranty?.name || ''
      }
    }

    return {
      ...raw,
      ...enumDefaults.value,
      name: raw.repairItemName || raw.name,
      code: raw.repairItemCode || raw.code,
      price: raw.workhourPrice || raw.price || '0.00',
      quantity: raw.workhour || raw.workHour || 1,
      originalQuantity: raw.workhour || raw.workHour || 1,
      discountAmount: raw.discountAmount || 0,
      workHour: raw.workhour || raw.workHour || 1,
      repairItemName: raw.repairItemName || raw.name,
      repairItemCode: raw.repairItemCode || raw.code,
      repairItemId: raw.repairItemId || raw.id,
      isWarranty: raw.isWarranty || 0,
      isProdType: raw.isProdType || 0,
      // 搜索结果有自己的维修类型时优先使用
      ...(raw.repairItemTypeId ? { repairItemTypeId: raw.repairItemTypeId, repairItemTypeName: raw.repairItemTypeName } : {}),
      // 已保存数据保留其结算/保修类型
      ...(raw.checkoutTypeId ? { checkoutTypeId: raw.checkoutTypeId, checkoutTypeName: raw.checkoutTypeName } : {
        checkoutTypeId: defaultCheckoutTypeId,
        checkoutTypeName: defaultCheckoutTypeName
      }),
      ...(raw.warrantyTypeId ? { warrantyTypeId: raw.warrantyTypeId, warrantyTypeName: raw.warrantyTypeName } : {
        warrantyTypeId: defaultWarrantyTypeId,
        warrantyTypeName: defaultWarrantyTypeName
      })
    }
  }

  /**
   * 标准化维修零件数据
   * @param {Object} raw - 原始数据
   * @returns {Object} 标准化后的数据
   */
  const normalizePart = (raw) => {
    const permDefaults = getPermFilteredDefaults(true)
    return {
      isBindltem: 0,
      ...raw,
      ...enumDefaults.value,
      // 权限过滤后的默认值覆盖 enumDefaults 中的结算/保修类型
      ...(permDefaults ? {
        checkoutTypeId: permDefaults.checkoutTypeId,
        checkoutTypeName: permDefaults.checkoutTypeName,
        warrantyTypeId: permDefaults.warrantyTypeId,
        warrantyTypeName: permDefaults.warrantyTypeName
      } : {}),
      name: raw.partsName || raw.partName || raw.name,
      code: raw.partsCode || raw.partCode || raw.code,
      partsId: raw.partsId || raw.id,
      partsName: raw.partsName || raw.partName || raw.name,
      partsCode: raw.partsCode || raw.partCode || raw.code,
      price: raw.salePrice || raw.price || '0.00',
      quantity: raw.quantity || 1,
      discountAmount: raw.discountAmount || 0,
      repairItemName: raw.name || '',
      repairItemId: raw.repairItemId, // 关联维修项目ID
      repairitemcode: raw.code,
      isOemPart: raw.isOemPart || raw.oemPart || 0,
      // 已保存数据保留其类型
      ...(raw.repairItemTypeId ? { repairItemTypeId: raw.repairItemTypeId, repairItemTypeName: raw.repairItemTypeName } : {}),
      ...(raw.checkoutTypeId ? { checkoutTypeId: raw.checkoutTypeId, checkoutTypeName: raw.checkoutTypeName } : {}),
      ...(raw.warrantyTypeId ? { warrantyTypeId: raw.warrantyTypeId, warrantyTypeName: raw.warrantyTypeName } : {})
    }
  }

  /**
   * 加载枚举数据
   */
  const loadEnumData = async() => {
    const [mtRes, ctRes, ritRes] = await Promise.all([
      getRepairItemTypeList(),
      getEnum('StatementTypeEnum'),
      getRepairItemTypeMap()
    ])
    const maintenanceTypes = mtRes?.data || []
    const checkoutTypes = ctRes?.data || []
    const repairItemTypes = ritRes?.data || []

    // 保存原始数据供后续过滤使用
    rawMaintenanceTypes.value = maintenanceTypes
    rawCheckoutTypes.value = checkoutTypes
    rawRepairItemTypes.value = repairItemTypes

    // 加载权限数据
    await loadPermissionData()

    // 使用权限过滤后的第一个选项作为默认值
    const firstMt = maintenanceTypes[0]
    const permDefaults = getPermFilteredDefaults(false)
    const firstCt = permDefaults
      ? checkoutTypes.find(ct => ct.code === permDefaults.checkoutTypeId)
      : checkoutTypes[0]
    const firstRit = permDefaults
      ? repairItemTypes.find(rit => rit.id === permDefaults.warrantyTypeId)
      : repairItemTypes.find(rit => rit.checkoutTypeId === firstCt?.code)
    enumDefaults.value = {
      repairItemTypeId: firstMt?.code || '',
      repairItemTypeName: firstMt?.name || '',
      checkoutTypeId: firstCt?.code || '',
      checkoutTypeName: firstCt?.message || '',
      warrantyTypeId: firstRit?.id || '',
      warrantyTypeName: firstRit?.name || ''
    }
  }

  /**
   * 加载初始数据
   */
  const loadInitialData = async() => {
    if (!serviceProxyId) return
    try {
      loading.value = true
      await Promise.all([
        loadEnumData(),
        getRepairItemInfo(serviceProxyId).then((res) => {
          if (res?.code === 200 && res?.data) {
            const { repairItemRespList = [], sparePartRespList = [], ...rest } = res.data
            selectedItems.value = repairItemRespList.map(normalizeItem)
            selectedParts.value = sparePartRespList.map(normalizePart)
            extraInfo.value = rest
          }
        })
      ])
    } catch (_error) { // eslint-disable-line no-unused-vars
      console.warn('加载维修项目数据失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置数据
   */
  const resetData = () => {
    selectedItems.value = []
    selectedParts.value = []
    extraInfo.value = {}
  }

  // ============ 公开 API ============

  return {
    // 状态
    loading,
    rawCheckoutTypes,
    rawRepairItemTypes,
    rawMaintenanceTypes,
    enumDefaults,
    selectedItems,
    selectedParts,
    extraInfo,
    dealerPermission,

    // 方法
    loadEnumData,
    loadInitialData,
    loadPermissionData,
    normalizeItem,
    normalizePart,
    getPermFilteredDefaults,
    resetData
  }
}
