<!-- 当成组件使用模式
  <RepairItemContent
    ref="contentRef"
    :service-proxy-id="route.query.id"
    isComponent
  />
  初始化数据：contentRef.value?.loadInitialData()
  保存方法： contentRef.value?.onSave()
  数据： contentRef.value?.selectedItems、contentRef.value?.selectedParts
-->
<template>
  <div class="popup-container">
    <!-- 标题栏（弹窗模式） -->
    <div v-if="showHeader" class="popup-header">
      <div class="close-btn" @click="$emit('close')">
        <van-icon name="arrow-left" />
      </div>
      <div class="header-title">选择维修项目</div>
      <div class="header-right"></div>
    </div>

    <!-- Tab栏 -->
    <van-tabs v-model:active="activeTab" class="add-tabs" sticky v-if="!isComponent">
      <van-tab title="添加维修项目" name="item" />
      <van-tab title="添加维修零件" name="part" />
    </van-tabs>

    <!-- 搜索栏 -->
    <SearchBar
      v-if="!isComponent"
      ref="searchBarRef"
      :disabled="isAuditComplete"
      :placeholder="
        activeTab === 'item'
          ? '输入维修项目代码、名称、拼音简码'
          : '输入维修零件代码、名称、拼音简码'
      "
      :activeTab="activeTab"
      @search="performSearch"
      @add-item-with-parts="handleAddItemWithParts"
      @update-item="handleItemUpdateWrapper"
      @delete-item="removeItem"
      @done="onSearchDone"
    />

    <!-- 内容区域 -->
    <div class="content-area">
      <div :class="`content-area-section ${isComponent ? '': 'border-r'}`" v-if="selectedItems.length > 0">
        <div class="section-title">维修项目</div>
        <div
          v-for="group in packageItemGroups"
          :key="'pkg-item-' + group.key"
          class="package-group"
        >
          <div class="package-group-title" @click="openPackageDetail(group)">
            {{ group.title }}<van-icon name="arrow" />
          </div>
          <RepairItemCard
            v-for="item in group.items"
            :key="item.id || item.repairItemId"
            :item="item"
            :stepper-disabled="!isWorkHourEditable(item)"
            :discount-disabled="!isDiscountEditable(item)"
            :name-editable="isNameEditable(item)"
            :deletable="isItemDeletable(item)"
            :disabled="isAuditComplete"
            @delete="removeItem(item, 'item')"
            @update-item="handleItemUpdateWrapper"
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
          :disabled="isAuditComplete"
          @delete="removeItem(item, 'item')"
          @update-item="handleItemUpdateWrapper"
        />
      </div>

      <div :class="`content-area-section ${isComponent ? '': 'border-r'}`" v-if="selectedParts.length > 0">
        <div class="section-title">维修配件</div>
        <div
          v-for="group in packagePartGroups"
          :key="'pkg-part-' + group.key"
          class="package-group"
        >
          <div class="package-group-title" @click="openPackageDetail(group)">
            {{ group.title }}<van-icon name="arrow" />
          </div>
          <RepairItemCard
            v-for="item in group.items"
            :key="item.id || item.partsId"
            :item="item"
            :stepper-disabled="!isQuantityEditable(item)"
            :discount-disabled="!isDiscountEditable(item)"
            :name-editable="false"
            :deletable="isPartDeletable(item)"
            :disabled="isAuditComplete"
            :isReplace="isReplace"
            @delete="removeItem(item, 'part')"
            @update-item="handleItemUpdateWrapper"
            @replace="repairItemContentReplace"
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
          :disabled="isAuditComplete"
          :isReplace="isReplace"
          @delete="removeItem(item, 'part')"
          @update-item="handleItemUpdateWrapper"
          @replace="repairItemContentReplace"
        />
      </div>

      <Empty
        v-if="selectedItems.length === 0 && selectedParts.length === 0"
        text="还没有添加维修项目零件"
      />
    </div>

    <!-- 结算类型选择弹窗 -->
    <AisCascader
      v-model:show="showCheckoutPicker"
      title="请选择"
      :options="cascaderOptions"
      :model-value="
        editingItem
          ? `${editingItem.repairItemTypeId || ''}-${editingItem.checkoutTypeId || ''}-${editingItem.warrantyTypeId || ''}`
          : ''
      "
      @confirm="onCheckoutConfirmWrapper"
    />

    <!-- 底部保存按钮 -->
    <div class="popup-footer" v-if="!isComponent">
      <div
        class="save-btn"
        :class="{ disabled: isAuditComplete }"
        @click="onSave"
      >
        保存
      </div>
    </div>

    <!-- 套餐详情弹窗 -->
    <PackageDetailPopup
      :show="showPackageDetail"
      :package-data="selectedPackageDetail"
      :show-cancel="false"
      @close="showPackageDetail = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { showToast, closeToast, showLoadingToast } from 'vant'
import Empty from '@/views/repairWork/components/Empty.vue'
import SearchBar from './SearchBar.vue'
import RepairItemCard from './RepairItemCard.vue'
import AisCascader from '@/components/AisCascader/index.vue'
import PackageDetailPopup from '@/components/PackageDetailPopup.vue'
import {
  useRepairItemData,
  useRepairItemBusinessRules,
  useRepairItemOperations,
  useRepairItemList
} from './hooks'

const props = defineProps({
  serviceProxyId: {
    type: String,
    default: ''
  },
  showHeader: {
    type: Boolean,
    default: false
  },
  isComponent: {
    type: Boolean,
    default: false
  },
  // 外部传入的维修项目数据
  initialItems: {
    type: Array,
    default: null
  },
  // 外部传入的维修零件数据
  initialParts: {
    type: Array,
    default: null
  },
  isReplace: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm', 'replace', 'delete'])

// UI 状态
const searchBarRef = ref(null)
const activeTab = ref('item')
const isAuditComplete = computed(() => extraInfo.value.isAuditComplete)

// 数据管理 Hook
const {
  rawCheckoutTypes,
  rawRepairItemTypes,
  rawMaintenanceTypes,
  selectedItems,
  selectedParts,
  extraInfo,
  dealerPermission,
  normalizeItem,
  normalizePart,
  getPermFilteredDefaults,
  loadInitialData,
  resetData
} = useRepairItemData({ serviceProxyId: props.serviceProxyId })

// 业务规则 Hook
const {
  isWorkHourEditable,
  isQuantityEditable,
  isDiscountEditable,
  isNameEditable,
  isItemDeletable,
  isPartDeletable,
  cascaderOptions,
  editingItem,
  showCheckoutPicker,
  openCheckoutPicker,
  onCheckoutConfirm
} = useRepairItemBusinessRules({
  dealerPermission,
  rawMaintenanceTypes,
  rawCheckoutTypes,
  rawRepairItemTypes,
  selectedItems,
  selectedParts
})

// 操作 Hook
const { performSearch, handleAddItemWithParts, handleItemUpdate, removeItem: originalRemoveItem, handleSave } =
  useRepairItemOperations({
    serviceProxyId: props.serviceProxyId,
    selectedItems,
    selectedParts,
    normalizeItem,
    normalizePart,
    getPermFilteredDefaults,
    activeTab,
    searchBarRef
  })

// 列表分组 Hook
const { regularItems, packageItemGroups, regularParts, packagePartGroups } =
  useRepairItemList({ selectedItems, selectedParts })

// 删除操作包装函数 - 删除后通知父组件
const removeItem = (item, type) => {
  originalRemoveItem(item, type, data => {
    emit('delete', data)
  })
}

// 结算类型确认选择 - 包装函数，通知父组件数据变化
const onCheckoutConfirmWrapper = (params) => {
  onCheckoutConfirm(params)
  // 只在组件模式下通知父组件
  if (props.isComponent) {
    nextTick(() => {
      emit('replace', {
        selectedItems: selectedItems.value,
        selectedParts: selectedParts.value
      })
    })
  }
}

// 事件处理
const handleItemUpdateWrapper = (item, updates) => {
  if (updates._action === 'checkout') {
    openCheckoutPicker(item)
    return
  }
  handleItemUpdate(item, updates)
  nextTick(() => {
    emit('replace', {
      selectedItems: selectedItems.value,
      selectedParts: selectedParts.value
    })
  })
}

const repairItemContentReplace = (content) => {
  console.log('repairItemContentReplace 收到数据:', content)
  const { oldPart, newPart } = content

  // 在 selectedParts 中查找并替换
  const index = selectedParts.value.findIndex(
    (part) => part.partsId === oldPart.partsId || part.partsCode === oldPart.partsCode
  )

  console.log('找到索引:', index, '原零件:', oldPart)

  if (index !== -1) {
    // 保留原零件的一些属性（如 packageId、isBindltem 等）
    const preservedProps = ['packageId', 'isBindltem', 'repairItemTypeId', 'repairItemTypeName']

    // 先对 newPart 进行标准化处理，确保有所有必要的字段
    const normalizedNewPart = normalizePart(newPart)
    console.log('标准化后的新零件:', normalizedNewPart)

    // 将原零件的关联属性复制到新零件上
    preservedProps.forEach((prop) => {
      if (oldPart[prop] !== undefined) {
        normalizedNewPart[prop] = oldPart[prop]
      }
    })

    // 替换零件
    selectedParts.value.splice(index, 1, normalizedNewPart)
    console.log('替换后的列表:', selectedParts.value)

    // 通知父组件发生了替换操作，传递更新后的零件列表
    emit('replace', {
      selectedItems: selectedItems.value,
      selectedParts: selectedParts.value
    })

    showToast({ message: '替换成功', 'z-index': 5100 })
  } else {
    showToast({ message: '未找到要替换的零件', 'z-index': 5100 })
  }
}
const onSearchDone = () => {
  searchBarRef.value?.reset()
}

const onSaveSuccess = (data) => {
  emit('confirm', data)
}

const onSave = async() => {
  if (isAuditComplete.value) return
  showLoadingToast('请稍候...')
  try {
    const success = await handleSave(onSaveSuccess)
    closeToast()
    if (success) {
      searchBarRef.value?.reset()
      emit('close')
    }
  } catch {
    closeToast()
  }
}

// 套餐详情弹窗
const showPackageDetail = ref(false)
const selectedPackageDetail = ref({
  name: '',
  code: '',
  itemRespList: []
})
const currentPackageGroup = ref(null)

const openPackageDetail = (group) => {
  currentPackageGroup.value = group
  selectedPackageDetail.value = {
    name: group.title || '',
    code: group.key || '',
    itemRespList: group.items || []
  }
  showPackageDetail.value = true
}

// 监听器
watch(activeTab, () => {
  searchBarRef.value?.reset()
})

// 监听外部传入数据变化，同步到组件内部
watch(
  () => props.initialItems,
  (newItems) => {
    if (newItems && newItems.length > 0) {
      selectedItems.value = newItems.map(normalizeItem)
    }
  },
  { immediate: true }
)

watch(
  () => props.initialParts,
  (newParts) => {
    if (newParts && newParts.length > 0) {
      selectedParts.value = newParts.map(normalizePart)
    }
  },
  { immediate: true }
)

// 组件挂载时，如果有外部数据则使用外部数据，否则加载枚举数据
onMounted(async() => {
  if (props.isComponent && (props.initialItems || props.initialParts)) {
    // 有外部数据时，只加载枚举数据（用于分类选择器）
    await loadInitialData()
  } else if (props.serviceProxyId) {
    // 无外部数据时，调用完整加载
    await loadInitialData()
  }
})

// 暴露方法供父组件调用
defineExpose({
  loadInitialData,
  resetData,
  searchBarRef,
  selectedItems,
  selectedParts,
  onSave
})
</script>

<style lang="scss" scoped>
.popup-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--leap-color-default-light-5);

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
      height: 2px;
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
      &.border-r {
        border-radius: 12px;
      }
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
      border-color: #b3deb3;
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
