<!-- 使用方式 -->
<!--
  <SelectRepairItem
    v-model:visible="showAddRepairPopup"
    :service-proxy-id="workOrder.serviceProxyId"
    @confirm="handleAddRepairConfirm"
  />
-->
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
        @update-item="handleItemUpdateWrapper"
        @delete-item="removeItem"
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
            @delete="removeItem(item, 'item')"
            @update-item="handleItemUpdateWrapper"
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
              @update-item="handleItemUpdateWrapper"
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
            @update-item="handleItemUpdateWrapper"
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
          @click="onSave"
        >
          保存
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Empty from '@/views/repairWork/components/Empty.vue'
import SearchBar from './SearchBar.vue'
import RepairItemCard from './RepairItemCard.vue'
import AisCascader from '@/components/AisCascader/index.vue'
import { useRepairItemData, useRepairItemBusinessRules, useRepairItemOperations, useRepairItemList } from './hooks'

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

// UI 状态
const searchBarRef = ref(null)
const activeTab = ref('item')

// 数据管理 Hook
const {
  // loading,
  rawCheckoutTypes,
  rawRepairItemTypes,
  rawMaintenanceTypes,
  selectedItems,
  selectedParts,
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
  // closeCheckoutPicker
} = useRepairItemBusinessRules({
  dealerPermission,
  rawMaintenanceTypes,
  rawCheckoutTypes,
  rawRepairItemTypes,
  selectedItems,
  selectedParts
})

// 操作 Hook
const {
  // saving,
  performSearch,
  handleAddItemWithParts,
  handleItemUpdate,
  removeItem,
  handleSave
} = useRepairItemOperations({
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
const {
  hasAnySelectedItems,
  regularItems,
  packageItemGroups,
  regularParts,
  packagePartGroups
} = useRepairItemList({ selectedItems, selectedParts })

// 事件处理
const handleClose = () => {
  searchBarRef.value?.reset()
  resetData()
  innerVisible.value = false
}

const onSaveSuccess = (data) => {
  emit('confirm', data)
  handleClose()
}

const handleItemUpdateWrapper = (item, updates) => {
  if (updates._action === 'checkout') {
    openCheckoutPicker(item)
    return
  }
  handleItemUpdate(item, updates)
}

const onSearchDone = () => {
  searchBarRef.value?.reset()
}

const onSave = async() => {
  const success = await handleSave(onSaveSuccess)
  if (success) {
    handleClose()
  }
}

// 监听器
watch(activeTab, () => {
  searchBarRef.value?.reset()
})

watch(() => props.visible, async(newVal) => {
  resetData()
  if (newVal) {
    await loadInitialData()
  }
})
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
