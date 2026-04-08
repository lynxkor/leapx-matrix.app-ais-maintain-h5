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
          <RepairItemCard
            v-for="(item, index) in selectedItems"
            :key="item.id"
            :item="item"
            @delete="removeItem(index, 'item')"
            @update-item="handleItemUpdate"
          />
        </div>

        <div class="content-area-section" v-if="selectedParts.length > 0">
          <div class="section-title">维修配件</div>
          <RepairItemCard
            v-for="(item, index) in selectedParts"
            :key="item.id"
            :item="item"
            @delete="removeItem(index, 'part')"
            @update-item="handleItemUpdate"
          />
        </div>

        <Empty v-if="selectedItems.length === 0 && selectedParts.length === 0" text="还没有添加维修项目零件" />
      </div>

      <!-- 结算类型选择弹窗 -->
      <AisCascader
        v-model:show="showCheckoutPicker"
        title="选择结算类型"
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
import { showToast } from 'vant'
import Empty from '@/views/repairWork/components/Empty.vue'
import { filterRepairItems, filterRepairParts, getRepairItemInfo, saveRepairItemInfo, getEnum, getRepairItemTypeMap } from '@/api/repairWork'
import SearchBar from './SearchBar.vue'
import RepairItemCard from './RepairItemCard.vue'
import AisCascader from '@/components/AisCascader/index.vue'

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

// 加载状态
const loading = ref(false)

const hasAnySelectedItems = computed(() => {
  return selectedItems.value.length > 0 || selectedParts.value.length > 0
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
const normalizeItem = (raw) => ({
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
  packageCode: raw.packageCode || '',
  isWarranty: raw.isWarranty || 0,
  isProdType: raw.isProdType || 0
})

const normalizePart = (raw) => ({
  ...enumDefaults.value,
  name: raw.partsName || raw.partName || raw.name,
  code: raw.partsCode || raw.partCode || raw.code,
  partsId: raw.partsId || raw.id,
  partsName: raw.partsName || raw.partName || raw.name,
  partsCode: raw.partsCode || raw.partCode || raw.code,
  price: raw.salePrice || raw.price || '0.00',
  quantity: raw.quantity || 1,
  discountAmount: raw.discountAmount || 0,
  repairItemName: raw.name || '',
  packageCode: raw.packageCode || '',
  repairItemId: raw.repairItemId, // 关联维修项目ID
  repairitemcode: raw.code,
  isOemPart: raw.isOemPart || 0,
  isBindltem: 0
})

// 搜索结果点击 → 区分维修项目/零件
const handleAddItemWithParts = (rawItem) => {
  if (activeTab.value === 'item') {
    // 维修项目：添加项目 + 附带零件
    const exists = selectedItems.value.some((i) => i.id === rawItem.id)
    if (exists) {
      showToast({ message: '请勿重复添加', 'z-index': 5100 })
      return
    }
    const projectItem = normalizeItem(rawItem)
    selectedItems.value.push(projectItem)

    // 同时添加附带零件
    const parts = (rawItem.partsRespList || []).map(normalizePart)
    selectedParts.value.push(...parts)

    // 展示操作卡片组
    searchBarRef.value?.showActiveCards([projectItem, ...parts])
    showToast({ message: '添加成功', 'z-index': 5100 })
  } else {
    // 零件：直接添加
    const exists = selectedParts.value.some((i) => i.id === (rawItem.partsId || rawItem.id))
    if (exists) {
      showToast({ message: '请勿重复添加', 'z-index': 5100 })
      return
    }
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

// 移除已选项
const removeItem = (index, type) => {
  const list = type === 'item' ? selectedItems : selectedParts
  list.value.splice(index, 1)
}

// 统一字段更新
const handleItemUpdate = (item, updates) => {
  if (updates._action === 'checkout') {
    editingItem.value = item
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

  cascaderOptions.value = maintenanceTypes.map(mt => ({
    text: mt.message,
    value: mt.code,
    children: checkoutTypes.map(ct => ({
      text: ct.message,
      value: ct.code,
      children: repairItemTypes
        .filter(rit => rit.checkoutTypeId === ct.code)
        .map(rit => ({ text: rit.name, value: rit.id }))
    }))
  }))

  // 取第一个选项作为新增时的默认值
  const firstMt = maintenanceTypes[0]
  const firstCt = checkoutTypes[0]
  const firstRit = repairItemTypes.find(rit => rit.checkoutTypeId === firstCt?.code)
  enumDefaults.value = {
    repairItemTypeId: firstMt?.code || '',
    repairItemTypeName: firstMt?.message || '',
    checkoutTypeId: firstCt?.code || '',
    checkoutTypeName: firstCt?.message || '',
    warrantyTypeId: firstRit?.id || '',
    warrantyTypeName: firstRit?.name || ''
  }
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
    background: #f7f7f7;
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
      font-family: 'PingFang SC', sans-serif;
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
      font-family: 'PingFang SC', sans-serif;
      font-size: 14px;
      color: #545454;
    }

    ::v-deep(.van-tab--active) {
      color: #009100;
      font-weight: 500;
    }

    ::v-deep(.van-tabs__line) {
      background: #009100;
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
      font-family: 'PingFang SC', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
      line-height: 20px;
      padding-left: 4px;
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
      background: #009100;
      border-radius: 8px;
      font-family: 'PingFang SC', sans-serif;
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
