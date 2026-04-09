<template>
  <van-popup
    v-model:show="innerVisible"
    position="bottom"
    teleport="body"
    :style="{ width: '100vw', height: '100%' }"
    z-index="5055"
    class="add-repair-item-popup"
  >
    <div class="popup-container">
      <!-- 标题栏 -->
      <div class="popup-header">
        <div class="close-btn" @click="handleClose">
          <van-icon name="arrow-left" />
        </div>
        <div class="header-title">选择维修项目</div>
        <div class="header-right"></div>
      </div>

      <!-- Tab栏 -->
      <van-tabs v-model:active="activeTab" class="add-tabs" sticky>
        <van-tab title="添加维修项目" name="item" />
        <van-tab title="添加维修零件" name="part" />
      </van-tabs>

      <!-- 搜索栏 -->
      <SearchBar
        ref="searchBarRef"
        :placeholder="
          activeTab === 'item'
            ? '输入维修项目代码、名称、拼音简码'
            : '输入维修零件代码、名称、拼音简码'
        "
        @search="performSearch"
        @add-item-with-parts="handleAddItemWithParts"
        @update-item="handleItemUpdate"
        @done="onSearchDone"
      />

      <!-- 内容区域 -->
      <div class="content-area">
        <div class="content-area-section" v-if="selectedItems.length > 0">
          <div class="section-title">维修项目</div>
           <div v-for="group in packageItemGroups" :key="'pkg-item-' + group.key" class="package-group">
            <div class="package-group-title">{{ group.title }}<van-icon name="arrow" /></div>
            <RepairItemCard
              v-for="item in group.items"
              :key="item.id || item.repairItemId"
              :item="item"
              :stepper-disabled="!isWorkHourEditable(item)"
              :discount-disabled="!isDiscountEditable(item)"
              :name-editable="isNameEditable(item)"
              :deletable="isItemDeletable(item)"
              @delete="removeItem(item, 'item')"
              @update-item="handleItemUpdate"
            />
          </div>
          <RepairItemCard
            v-for="item in regularItems"
            :key="item.id || item.repairItemId"
            :item="item"
            :stepper-disabled="!isWorkHourEditable(item)"
            :discount-disabled="!isDiscountEditable(item)"
            :name-editable="isNameEditable(item)"
            :deletable="isItemDeletable(item)"
            @delete="removeItem(item, 'item')"
            @update-item="handleItemUpdate"
          />
        </div>

        <div class="content-area-section" v-if="selectedParts.length > 0">
          <div class="section-title">维修配件</div>
          <div v-for="group in packagePartGroups" :key="'pkg-part-' + group.key" class="package-group">
            <div class="package-group-title">{{ group.title }}<van-icon name="arrow" /></div>
            <RepairItemCard
              v-for="item in group.items"
              :key="item.id || item.partsId"
              :item="item"
              :stepper-disabled="!isQuantityEditable(item)"
              :discount-disabled="!isDiscountEditable(item)"
              :name-editable="false"
              :deletable="isPartDeletable(item)"
              @delete="removeItem(item, 'part')"
              @update-item="handleItemUpdate"
            />
          </div>
          <RepairItemCard
            v-for="item in regularParts"
            :key="item.id || item.partsId"
            :item="item"
            :stepper-disabled="!isQuantityEditable(item)"
            :discount-disabled="!isDiscountEditable(item)"
            :name-editable="false"
            :deletable="isPartDeletable(item)"
            @delete="removeItem(item, 'part')"
            @update-item="handleItemUpdate"
          />
        </div>

        <Empty v-if="selectedItems.length === 0 && selectedParts.length === 0" text="还没有添加维修项目零件" />
      </div>

      <!-- 结算类型选择弹窗 -->
      <AisCascader
        v-model:show="showCheckoutPicker"
        title="请选择"
        :options="cascaderOptions"
        :model-value="editingItem?.warrantyTypeId || ''"
        @confirm="onCheckoutConfirm"
      />

      <!-- 底部保存按钮 -->
      <div class="popup-footer">
        <div
          class="save-btn"
          :class="{ disabled: !hasAnySelectedItems }"
          @click="handleSave"
        >
          保存
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import Empty from '@/views/repairWork/components/Empty.vue'
import { CheckoutTypeEnum, WarrantyTypeEnum, UNIVERSAL_LABOR_HOUR_ITEM_ID, WorkRecordStatusEnum } from '@/views/repairWork/constant'
import { filterRepairItems, filterRepairParts, getRepairItemInfo, saveRepairItemInfo, getEnum, getRepairItemTypeMap, getDealerPermission } from '@/api/repairWork'
import SearchBar from './SearchBar.vue'
import RepairItemCard from './RepairItemCard.vue'
import AisCascader from '@/components/AisCascader/index.vue'

// 判断结算类型是否为保修或合同
const checkoutTypeIncluded = (typeId) => {
  return typeId === CheckoutTypeEnum.WARRANTY || typeId === CheckoutTypeEnum.CONTRACT
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  serviceProxyId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const innerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 子组件 ref
const searchBarRef = ref(null)

// Tab状态 — 仅决定搜索/添加目标，不影响列表展示
const activeTab = ref('item')

watch(activeTab, () => {
  searchBarRef.value?.reset()
})

// 已选数据
const selectedItems = ref([])
const selectedParts = ref([])

// 结算类型选择
const showCheckoutPicker = ref(false)
const editingItem = ref(null)

// 级联选择器数据与枚举默认值
const cascaderOptions = ref([])
const enumDefaults = ref({})
const rawCheckoutTypes = ref([]) // 原始结算类型枚举
const rawRepairItemTypes = ref([]) // 原始保修类型映射数据
const rawMaintenanceTypes = ref([]) // 原始维修类型枚举

// 经销商权限配置
const dealerPermission = ref({
  repairItemHasPermission: false,
  partHasPermission: false,
  repairItem: { checkoutTypeIds: [], warrantyTypeIds: [] },
  part: { checkoutTypeIds: [], warrantyTypeIds: [] }
})

// 加载状态
const loading = ref(false)

// 加载经销商权限数据
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
  } catch (e) {
    console.error('加载权限数据失败:', e)
  }
}

/**
 * 根据项目类型获取权限过滤后的默认结算/保修类型
 * @param {boolean} isPart - 是否为零件
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

const hasAnySelectedItems = computed(() => {
  return selectedItems.value.length > 0 || selectedParts.value.length > 0
})

// 分组展示：常规项目 / 套餐项目
const regularItems = computed(() => {
  return selectedItems.value.filter(item => !item.packageId)
})

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

const regularParts = computed(() => {
  return selectedParts.value.filter(item => !item.packageId)
})

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

// 搜索
const performSearch = async(keyword) => {
  try {
    const apiFn = activeTab.value === 'item' ? filterRepairItems : filterRepairParts
    const res = await apiFn({
      serviceProxyId: props.serviceProxyId,
      nameOrCodeOrPinyinLike: keyword,
      pageSize: 50
    })
    if (res.code === 200) {
      searchBarRef.value?.setResults(res?.data || [])
    } else {
      searchBarRef.value?.setResults([])
      showToast(res.message || '搜索失败')
    }
  } catch {
    searchBarRef.value?.setResults([])
    showToast('搜索失败')
  }
}

// 统一字段映射（零件用 partName/partCode/salePrice，项目用 name/code/price）
const normalizeItem = (raw) => {
  const isUniversal = (raw.repairItemId || raw.id) === UNIVERSAL_LABOR_HOUR_ITEM_ID
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
    quantity: raw.workHour || 1,
    discountAmount: raw.discountAmount || 0,
    workHour: raw.workHour || 1,
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
    isOemPart: raw.isOemPart || 0,
    // 已保存数据保留其类型
    ...(raw.repairItemTypeId ? { repairItemTypeId: raw.repairItemTypeId, repairItemTypeName: raw.repairItemTypeName } : {}),
    ...(raw.checkoutTypeId ? { checkoutTypeId: raw.checkoutTypeId, checkoutTypeName: raw.checkoutTypeName } : {}),
    ...(raw.warrantyTypeId ? { warrantyTypeId: raw.warrantyTypeId, warrantyTypeName: raw.warrantyTypeName } : {})
  }
}

// 搜索结果点击 → 区分维修项目/零件
const handleAddItemWithParts = (rawItem) => {
  if (activeTab.value === 'item') {
    // 维修项目：添加项目 + 附带零件
    const exists = selectedItems.value.filter(el => el.repairItemId !== UNIVERSAL_LABOR_HOUR_ITEM_ID && el.workRecordStatus !== WorkRecordStatusEnum.COMPLETED).find(el => el.repairItemId === rawItem.id)
    if (exists) {
      showToast({ message: '请勿重复添加', 'z-index': 5100 })
      return
    }
    const projectItem = normalizeItem(rawItem)
    selectedItems.value.push(projectItem)

    // 同时添加附带零件
    const parts = (rawItem.partsRespList || []).map((el) => {
      delete el.id
      el.isBindltem = 1
      return normalizePart(el)
    })
    selectedParts.value.push(...parts)

    // 展示操作卡片组
    searchBarRef.value?.showActiveCards([projectItem, ...parts])
    showToast({ message: '添加成功', 'z-index': 5100 })
  } else {
    // 零件：直接添加
    const exists = selectedParts.value.some((i) => i.partsId === rawItem.id)
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

// 搜索完成（点击"完成"按钮）
const onSearchDone = () => {
  searchBarRef.value?.reset()
}

// ==================== 字段可编辑性判断 ====================

/** 工时可编辑（维修项目步进器） */
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

/** 数量可编辑（零件步进器） */
const isQuantityEditable = (item) => {
  return !item.isOutstock
}

/** 优惠金额可编辑 */
const isDiscountEditable = (item) => {
  return !checkoutTypeIncluded(item.checkoutTypeId)
}

/** 维修项目名称可编辑：仅万能工时新增未保存 */
const isNameEditable = (item) => {
  const isUniversal = item.repairItemId === UNIVERSAL_LABOR_HOUR_ITEM_ID
  return isUniversal && !item.id && !item.packageId
}

/** 零件名称始终不可编辑，通过 isPart 判断 */

// ==================== 删除禁用判断 ====================

/** 维修项目是否可删除 */
const isItemDeletable = (item) => {
  if (item.packageId && item.workRecordStatus === WorkRecordStatusEnum.COMPLETED) return false
  return true
}

/** 零件是否可删除 */
const isPartDeletable = (item) => {
  if (item.isOutstock) return false
  if (item.packageId && item.workRecordStatus === WorkRecordStatusEnum.COMPLETED) return false
  return true
}

// 移除已选项
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

// 统一字段更新
const handleItemUpdate = (item, updates) => {
  if (updates._action === 'checkout') {
    editingItem.value = item
    // 根据编辑项动态构建级联选项
    cascaderOptions.value = buildCascaderOptions(item)
    showCheckoutPicker.value = true
    return
  }
  Object.assign(item, updates)
}

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

// 保存
const handleSave = async() => {
  if (!hasAnySelectedItems.value) return

  // 售前保修只能单独开单
  const allItems = [...selectedItems.value, ...selectedParts.value]
  const preSaleItems = allItems.filter(i => i.warrantyTypeId === WarrantyTypeEnum.PRE_SALE_WARRANTY)
  if (preSaleItems.length > 0 && allItems.length > preSaleItems.length) {
    showToast({ message: '售前保修只能单独开单', 'z-index': 5100 })
    return
  }

  try {
    loading.value = true
    const res = await saveRepairItemInfo({
      itemList: selectedItems.value,
      partsList: selectedParts.value,
      discountId: '',
      serviceProxyId: props.serviceProxyId
    })
    if (res?.code === 200) {
      showToast({ message: '保存成功', 'z-index': 5100 })
      emit('confirm', {
        items: selectedItems.value,
        parts: selectedParts.value
      })
      handleClose()
    } else {
      showToast({ message: res?.message || '保存失败', 'z-index': 5100 })
    }
  } catch (error) {
    console.error('保存失败:', error)
    showToast({ message: '保存失败', 'z-index': 5100 })
  } finally {
    loading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  resetAllState()
  innerVisible.value = false
}

const resetAllState = () => {
  searchBarRef.value?.reset()
  selectedItems.value = []
  selectedParts.value = []
  activeTab.value = 'item'
  showCheckoutPicker.value = false
  editingItem.value = null
}

// 弹窗打开时重置状态并加载数据
watch(
  () => props.visible,
  async(newVal) => {
    if (newVal) {
      resetAllState()
      await loadInitialData()
    }
  }
)

// 加载枚举数据并构建级联选项
const loadEnumData = async() => {
  const [mtRes, ctRes, ritRes] = await Promise.all([
    getEnum('MaintenanceTypeEnum'),
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

  // 构建默认级联选项
  cascaderOptions.value = buildCascaderOptions(null)

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
    repairItemTypeName: firstMt?.message || '',
    checkoutTypeId: firstCt?.code || '',
    checkoutTypeName: firstCt?.message || '',
    warrantyTypeId: firstRit?.id || '',
    warrantyTypeName: firstRit?.name || ''
  }
}

/**
 * 根据编辑项上下文动态构建级联选项（带禁用规则 + 权限过滤）
 * @param {Object|null} item - 正在编辑的维修项目/零件，null表示无过滤
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
        // 结算类型禁用规则（保留现有 disabled 逻辑）
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
              // 保修类型禁用规则（保留现有 disabled 逻辑）
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

// 加载初始数据
const loadInitialData = async() => {
  if (!props.serviceProxyId) return
  try {
    loading.value = true
    await Promise.all([
      loadEnumData(),
      getRepairItemInfo(props.serviceProxyId).then((res) => {
        if (res?.code === 200 && res?.data) {
          const { repairItemRespList = [], sparePartRespList = [] } = res.data
          selectedItems.value = repairItemRespList.map(normalizeItem)
          selectedParts.value = sparePartRespList.map(normalizePart)
        }
      })
    ])
  } catch (error) {
    console.error('加载维修项目数据失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.add-repair-item-popup {
  .popup-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--leap-color-default-light-5);
  }

  // 标题栏
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    background-color: #fff;
    padding: 0 16px;
    flex-shrink: 0;
    position: relative;
    z-index: 9;

    .close-btn {
      cursor: pointer;
      .van-icon {
        font-size: 16px;
        color: var(--leap-color-default-dark-1);
      }
    }

    .header-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--leap-color-default);
      line-height: 22px;
    }

    .header-right {
      width: 20px;
    }
  }

  // Tab栏
  .add-tabs {
    flex-shrink: 0;
    background: #fff;
    position: relative;
    z-index: 10;

    ::v-deep(.van-tabs__nav) {
      background: #fff;
    }

    ::v-deep(.van-tab) {
      font-size: 14px;
      color: var(--leap-color-default-light-1);
    }

    ::v-deep(.van-tab--active) {
      color: var(--leap-color-primary);
      font-weight: 500;
    }

    ::v-deep(.van-tabs__line) {
      background: var(--leap-color-primary);
      width: 84px;
    }
  }

  // 内容区域
  .content-area {
    flex: 1;
    overflow-y: auto;
    &-section {
      padding: 12px 12px 0 12px;
      margin-top: 10px;
      background-color: #fff;
    }

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--leap-color-default);
      line-height: 20px;
      padding-left: 4px;
    }

    .package-group {
      margin: 8px -12px 0 -12px;
      padding-bottom: 12px;
      background-color: var(--leap-color-default-light-5);
      border-width: 0.5px 0px 0.5px 0px;
      border-style: solid;
      border-color: #B3DEB3;
      border-radius: 12px;
      ::v-deep .repair-item-card {
        margin: 0 8px 8px 8px;
        border-radius: 8px;
        padding: 15px 8px;
        &:last-child {
          margin-bottom: 0;
        }
      }
      .package-group-title {
        font-size: 12px;
        color: var(--leap-color-default-dark-1);
        padding: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }

  // 底部按钮
  .popup-footer {
    flex-shrink: 0;
    padding: 7px 12px;
    padding-bottom: calc(7px + env(safe-area-inset-bottom));
    background: #fff;

    .save-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 40px;
      background: var(--leap-color-primary);
      border-radius: 8px;
      font-size: 14px;
      color: #ffffff;
      cursor: pointer;

      &:active {
        opacity: 0.8;
      }

      &.disabled {
        opacity: 0.3;
        cursor: not-allowed;

        &:active {
          opacity: 0.3;
        }
      }
    }
  }
}
</style>
