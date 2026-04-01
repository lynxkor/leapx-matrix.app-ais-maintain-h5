<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '90%' }"
    round
    teleport="body"
    @close="handleClose"
  >
    <div class="batch-operate-popup">
      <!-- 派工弹窗 -->
      <DispatchWorkPopup
        v-model="showDispatchPopup"
        :work-order="workOrder"
        :selected-item-ids="getSelectedItems()"
        :service-proxy-id="workOrder.id"
        @submit="handleBatchDispatchSubmit"
      />

      <!-- 标题栏 -->
      <div class="popup-header">
        <div class="close-btn" @click="handleClose">
          <van-icon name="cross" />
        </div>
        <div class="header-center">
          <span class="order-number">{{ workOrder.code }}</span>
          <span v-if="workOrder.businessTypeLabel" class="order-tag">{{
            workOrder.businessTypeLabel
          }}</span>
        </div>
        <div class="header-right"></div>
      </div>

      <!-- 内容区域 -->
      <div class="popup-content" v-loading="loading">
        <!-- 白色卡片容器 -->
        <div class="content-card">
          <!-- 车辆信息 -->
          <div class="vehicle-info-section">
            <div class="vehicle-main">
              <div class="vehicle-left">
                <div class="plate-row">
                  <span class="plate-number">{{ workOrder.carPlate }}</span>
                  <span class="status-text">{{ workOrder.orderStatusLabel }}</span>
                </div>
                <div class="vehicle-model">
                  {{ workOrder.vehModelName
                  }}<template v-if="workOrder.vehProfileVin"> · {{ workOrder.vehProfileVin }}</template>
                </div>
              </div>
              <div class="void-btn" @click="handleVoid">
                <span>作废</span>
              </div>
            </div>
          </div>

          <!-- 维修项目标题 -->
          <div class="repair-title-row">
            <span class="repair-title">维修项目</span>
            <div class="add-repair" @click="handleAddRepair">
              <span class="add-text">添加维修项目</span>
              <van-icon name="arrow" class="arrow-icon" />
            </div>
          </div>

          <!-- 状态标签栏 -->
          <div class="status-tags">
            <div
              v-for="(tag, index) in statusTags"
              :key="index"
              class="status-tag-item"
              :class="{ active: activeTagIndex === tag.index }"
              @click="handleTagClick(tag.index)"
            >
              {{ tag.label }}
            </div>
          </div>

          <!-- 维修项目列表 -->
          <div class="repair-list" v-if="filteredRepairItems.length > 0">
            <div
              v-for="item in filteredRepairItems"
              :key="item.repairItemId || item.id"
              class="repair-item"
              @click="toggleItemSelect(item.repairItemId || item.id)"
            >
              <div class="item-checkbox">
                <div class="checkbox-icon" :class="{ checked: item._selected }">
                  <van-icon v-if="item._selected" name="success" />
                </div>
              </div>
              <div class="item-content">
                <div class="item-name">{{ item.repairItemName }}</div>
                <div class="item-info">
                  <span v-if="item.dealerStationName" class="info-text">工位：{{
                    item.dealerStationName
                  }}</span>
                  <span v-if="item.repairTechnicianName" class="info-text">技师：{{
                    item.repairTechnicianName
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div class="empty-state" v-else>
            <van-icon name="todo-list-o" size="48" color="#C8C9CC" />
            <p class="empty-text">暂无维修项目</p>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="popup-footer">
        <div class="footer-content">
          <div class="select-all" @click="toggleSelectAll">
            <div class="checkbox-icon" :class="{ checked: isAllSelected }">
              <van-icon v-if="isAllSelected" name="success" />
            </div>
            <span class="select-text">{{isAllSelected ? '取消全选' : '全选'}}</span>
          </div>
          <div class="action-buttons">
            <!-- 待派工: 派工 -->
            <div
              v-if="activeTagIndex === 0"
              class="action-btn primary-btn"
              :class="{ disabled: !hasSelectedItems }"
              @click="showBatchDispatch"
            >
              <span>派工</span>
            </div>
            <!-- 未作业: 作业开始 -->
            <template v-if="activeTagIndex === 1">
              <div
                  class="action-btn delete-btn"
                  :class="{ disabled: !hasSelectedItems }"
                  @click="showDeleteConfirm"
                >
                  <span>删除派工</span>
              </div>
              <div
                v-if="activeTagIndex === 1"
                class="action-btn primary-btn"
                :class="{ disabled: !hasSelectedItems }"
                @click="showStartConfirm"
              >
                <span>作业开始</span>
              </div>
            </template>
            <!-- 作业中: 作业结束 + 删除派工 -->
            <template v-if="activeTagIndex === 2">
              <div
                class="action-btn delete-btn"
                :class="{ disabled: !hasSelectedItems }"
                @click="showDeleteConfirm"
              >
                <span>删除派工</span>
              </div>
              <div
                class="action-btn primary-btn"
                :class="{ disabled: !hasSelectedItems }"
                @click="showEndConfirm"
              >
                <span>作业结束</span>
              </div>
            </template>
            <!-- 待质检: 质检 -->
             <div
              v-if="activeTagIndex === 3 || activeTagIndex === 4"
              class="action-btn delete-btn"
              :class="{ disabled: !hasSelectedItems }"
              @click="showReworkConfirm"
            >
              <span>返修</span>
            </div>
            <div
              v-if="activeTagIndex === 3"
              class="action-btn primary-btn"
              :class="{ disabled: !hasSelectedItems }"
              @click="showQualityConfirm"
            >
              <span>质检</span>
            </div>
            <!-- 待终检: 终检 -->
            <div
              v-if="activeTagIndex === 4"
              class="action-btn primary-btn"
              @click="showFinalConfirm"
            >
              <span>终检</span>
            </div>
          </div>
        </div>
        <!-- 底部安全区域 -->
        <div class="footer-safe-area"></div>
      </div>
    </div>
  </van-popup>

  <!-- 作废弹窗 -->
  <CancelWorkPopup v-model="showCancelPopup" @confirm="handleVoidConfirm" />
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { showToast } from 'vant'
import DispatchWorkPopup from './DispatchWorkPopup.vue'
import CancelWorkPopup from './CancelWorkPopup.vue'
import { cancel, repairWorkRecord } from '../../../api/repairWork'
import { WorkRecordStatusEnum, RepairOrderStatusEnum } from '../constant'
import { formatDateTime } from '@/libs/utils'
import { executeBatchOperation } from '../utils'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  workOrder: {
    type: Object,
    default: () => ({})
  },
  repairItems: {
    type: Array,
    default: () => []
  },
  defaultTagIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = ref(props.modelValue)
const showCancelPopup = ref(false)
const showDispatchPopup = ref(false)
const loading = ref(false)

// 内部维修项目列表（带选中状态）
const internalRepairItems = ref([])

// 状态标签列表
const statusTagList = ref([
  { label: '待派工', index: 0 },
  { label: '未作业', index: 1 },
  { label: '作业中', index: 2 },
  { label: '待质检', index: 3 },
  { label: '待终检', index: 4 }
])

// 当前选中的标签索引
const activeTagIndex = ref(0)

// 根据状态过滤维修项目的函数
const filterByTag = (item, tagIndex) => {
  switch (tagIndex) {
    case 0: // 待派工
      return item.isDispatch !== 1
    case 1: // 未作业
      return item.isDispatch === 1 && item.status === WorkRecordStatusEnum.NOT_STARTED
    case 2: // 作业中
      return item.status === WorkRecordStatusEnum.IN_PROGRESS
    case 3: // 待质检
      return item.status === WorkRecordStatusEnum.COMPLETED && item.qualityCheckStatus !== 30
    case 4: // 待终检
      return item.qualityCheckStatus === 30
    default:
      return true
  }
}

// 根据状态过滤的维修项目
const filteredRepairItems = computed(() => {
  if (internalRepairItems.value.length === 0) return []
  return internalRepairItems.value.filter((item) => filterByTag(item, activeTagIndex.value))
})

const statusTags = computed(() => {
  if (props.workOrder.orderStatus === RepairOrderStatusEnum.PENDING_DISPATCH || props.workOrder.orderStatus === RepairOrderStatusEnum.UNDER_CONSTRUCTION) {
    return statusTagList.value.slice(0, 3)
  } else if (props.workOrder.orderStatus === RepairOrderStatusEnum.PENDING_FINAL_INSPECTION) {
    return statusTagList.value.slice(3, 5)
  }
  return statusTagList.value
})

// 加载维修作业记录
const loadRepairWorkRecord = async() => {
  loading.value = true
  try {
    const data = await repairWorkRecord({ serviceProxyId: props.workOrder.id })
    internalRepairItems.value = (data?.data || []).map((item) => ({
      ...item,
      _selected: false
    }))
    activeTagIndex.value = props.defaultTagIndex
    nextTick(() => {
      toggleSelectAll()
    })
  } catch {
    showToast('获取维修记录失败')
    internalRepairItems.value = []
  } finally {
    loading.value = false
  }
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      loadRepairWorkRecord()
    }
  }
)

// 监听 visible 变化
watch(visible, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false)
  }
})

// 是否有选中项目
const hasSelectedItems = computed(() => {
  return filteredRepairItems.value.some((item) => item._selected)
})

// 是否全选
const isAllSelected = computed(() => {
  if (filteredRepairItems.value.length === 0) return false
  return filteredRepairItems.value.every((item) => item._selected)
})

// 切换状态标签
const handleTagClick = (index) => {
  activeTagIndex.value = index
}

// 切换单个选中
const toggleItemSelect = (itemId) => {
  const item = internalRepairItems.value.find((i) => (i.repairItemId || i.id) === itemId)
  if (item) {
    item._selected = !item._selected
  }
}

// 切换全选
const toggleSelectAll = () => {
  const newState = !isAllSelected.value
  filteredRepairItems.value.forEach((item) => {
    item._selected = newState
  })
}

// 获取选中的项目
const getSelectedItems = () => {
  return filteredRepairItems.value.filter((item) => item._selected)
}

// 执行批量操作
const handleBatchAction = async(action) => {
  const selectedItems = getSelectedItems()
  if (selectedItems.length === 0) return

  const ids = selectedItems.map((item) => item.id)
  const extraParams = {}

  // 作业开始需要 timeSpend
  if (action === 'start') {
    extraParams.timeSpend = formatDateTime(new Date())
  }
  // 作业结束需要 finishAt
  if (action === 'end') {
    extraParams.finishAt = formatDateTime(new Date())
  }

  await executeBatchOperation(action, {
    serviceProxyId: props.workOrder.id,
    ids,
    selectedItems,
    extraParams,
    onRefresh: () => emit('refresh'),
    onSuccess: () => handleClose()
  })
}

// 删除确认
const showDeleteConfirm = () => handleBatchAction('delete')

// 作业开始确认
const showStartConfirm = () => handleBatchAction('start')

// 作业结束确认
const showEndConfirm = () => handleBatchAction('end')

// 返修
const showReworkConfirm = () => handleBatchAction('rework')

// 质检确认
const showQualityConfirm = () => handleBatchAction('quality')

// 终检确认
const showFinalConfirm = () => handleBatchAction('finalCheck')

// 批量派工
const showBatchDispatch = () => {
  if (!hasSelectedItems.value) return
  showDispatchPopup.value = true
}

// 批量派工提交
const handleBatchDispatchSubmit = async() => {
  showToast('派工成功')
  emit('refresh')
  handleClose()
}

// 添加维修项目
const handleAddRepair = () => {
  // 跳转添加维修项目页面
}

// 作废
const handleVoid = () => {
  showCancelPopup.value = true
}

// 确认作废
const handleVoidConfirm = async(reason) => {
  try {
    const res = await cancel({ id: props.workOrder.id, invaildDesc: reason })
    if (res.code === 200) {
      showToast('作废成功')
      emit('refresh')
      handleClose()
    }
  } catch {
    showToast('作废失败')
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.batch-operate-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f4f4f4;

  // 标题栏
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 58px;
    background-color: #f4f4f4;
    padding: 0 16px;
    flex-shrink: 0;

    .close-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--leap-color-default-light-2);
      border-radius: 50%;
      cursor: pointer;

      .van-icon {
        font-size: 12px;
        color: #fff;
      }
    }

    .header-right {
      width: 20px;
    }

    .header-center {
      display: flex;
      align-items: center;
      gap: 2px;

      .order-number {
        font-family: 'PingFang SC', sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: var(--leap-color-default);
        line-height: 20px;
      }

      .order-tag {
        background-color: rgba(25, 26, 27, 0.06);
        color: var(--leap-color-default);
        font-family: 'PingFang SC', sans-serif;
        font-size: 12px;
        font-weight: 400;
        line-height: 17px;
        padding: 1px 4px;
        border-radius: 4px;
      }
    }
  }

  // 内容区域
  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 12px;

    .content-card {
      background-color: #fff;
      border-radius: 8px;
      padding: 12px;
    }
  }

  // 车辆信息
  .vehicle-info-section {
    padding-bottom: 12px;
    border-bottom: 0.5px solid var(--leap-color-default-light-4);

    .vehicle-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .vehicle-left {
        flex: 1;

        .plate-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;

          .plate-number {
            font-family: 'PingFang SC', sans-serif;
            font-size: 16px;
            font-weight: 600;
            color: var(--leap-color-default);
            line-height: 22px;
          }

          .status-text {
            font-family: 'PingFang SC', sans-serif;
            font-size: 12px;
            font-weight: 600;
            line-height: 17px;
            color: var(--leap-color-warning);
          }
        }

        .vehicle-model {
          font-family: 'PingFang SC', sans-serif;
          font-size: 12px;
          font-weight: 400;
          color: #545454;
          line-height: 17px;
        }
      }

      .void-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 32px;
        border: 1px solid var(--leap-color-danger);
        border-radius: 4px;
        cursor: pointer;

        span {
          font-family: 'PingFang SC', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: var(--leap-color-danger);
        }
      }
    }
  }

  // 状态标签栏
  .status-tags {
    display: flex;
    gap: 8px;
    padding: 12px 0;
    overflow-x: auto;

    .status-tag-item {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 68px;
      height: 30px;
      padding: 2px 0;
      background-color: var(--leap-color-default-light-5);
      border-radius: 4px;
      font-family: 'PingFang SC', sans-serif;
      font-size: 12px;
      font-weight: 400;
      color: var(--leap-color-default);
      line-height: 20px;

      &.active {
        background-color: transparent;
        border: 1px solid var(--leap-color-primary);
        color: var(--leap-color-primary);
      }
    }
  }

  // 维修项目标题
  .repair-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;

    .repair-title {
      font-family: 'PingFang SC', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--leap-color-default);
      line-height: 20px;
    }

    .add-repair {
      display: flex;
      align-items: center;
      cursor: pointer;

      .add-text {
        font-family: 'PingFang SC', sans-serif;
        font-size: 12px;
        font-weight: 400;
        color: var(--leap-color-primary);
        line-height: 17px;
      }

      .arrow-icon {
        font-size: 16px;
        color: var(--leap-color-primary);
      }
    }
  }

  // 维修项目列表
  .repair-list {
    .repair-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 0.5px solid var(--leap-color-default-light-4);

      &:last-child {
        border-bottom: none;
      }

      .item-checkbox {
        margin-right: 12px;
        cursor: pointer;
      }

      .checkbox-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid rgba(25, 26, 27, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;

        &.checked {
          background-color: var(--leap-color-primary);
          border-color: var(--leap-color-primary);

          .van-icon {
            color: #fff;
            font-size: 12px;
          }
        }
      }

      .item-content {
        flex: 1;

        .item-name {
          font-family: 'PingFang SC', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: var(--leap-color-default-dark-1);
          line-height: 20px;
          margin-bottom: 2px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-info {
          display: flex;
          gap: 12px;

          .info-text {
            font-family: 'PingFang SC', sans-serif;
            font-size: 12px;
            font-weight: 400;
            color: var(--leap-color-default-light-2);
            line-height: 17px;
          }
        }
      }
    }
  }

  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;

    .empty-text {
      margin-top: 12px;
      font-family: 'PingFang SC', sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: var(--leap-color-default-light-2);
      line-height: 20px;
    }
  }

  // 底部操作栏
  .popup-footer {
    flex-shrink: 0;
    background-color: #fff;
    border-top: 1px solid #dce0e4;

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      height: 54px;

      .select-all {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;

        .checkbox-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1px solid rgba(25, 26, 27, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: transparent;

          &.checked {
            background-color: var(--leap-color-primary);
            border-color: var(--leap-color-primary);

            .van-icon {
              color: #fff;
              font-size: 12px;
            }
          }
        }

        .select-text {
          font-family: 'PingFang SC', sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: var(--leap-color-default);
          line-height: 22px;
        }
      }

      .action-buttons {
        display: flex;
        gap: 8px;

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;

          span {
            font-family: 'PingFang SC', sans-serif;
            font-size: 14px;
            font-weight: 400;
          }

          &.delete-btn {
            border: 1px solid var(--leap-color-primary);

            span {
              color: var(--leap-color-primary);
            }
          }

          &.primary-btn {
            background-color: var(--leap-color-primary);

            span {
              color: #fff;
            }
          }

          &.dispatch-btn {
            border: 1px solid var(--leap-color-primary);

            span {
              color: var(--leap-color-primary);
            }
          }

          &.disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }

    .footer-safe-area {
      height: 34px;
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;

      // &::after {
      //   content: '';
      //   width: 134px;
      //   height: 5px;
      //   background-color: #000;
      //   border-radius: 2.5px;
      // }
    }
  }
}
</style>
