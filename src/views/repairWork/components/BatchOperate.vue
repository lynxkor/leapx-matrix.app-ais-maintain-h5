<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '90%' }"
    round
    @close="handleClose"
  >
    <div class="batch-operate-popup">
      <!-- 标题栏 -->
      <div class="popup-header">
        <div class="header-left">
          <div class="close-btn" @click="handleClose">
            <van-icon name="cross" />
          </div>
        </div>
        <div class="header-center">
          <span class="order-number">{{ workOrder.orderNo }}</span>
          <span v-if="workOrder.tag" class="order-tag">{{ workOrder.tag }}</span>
        </div>
        <div class="header-right"></div>
      </div>

      <!-- 内容区域 -->
      <div class="popup-content">
        <!-- 白色卡片容器 -->
        <div class="content-card">
          <!-- 车辆信息 -->
          <div class="vehicle-info-section">
            <div class="vehicle-main">
              <div class="vehicle-left">
                <div class="plate-row">
                  <span class="plate-number">{{ workOrder.plateNumber }}</span>
                  <span class="status-text" :class="`status-${workOrder.status}`">{{
                    workOrder.statusText
                  }}</span>
                </div>
                <div class="vehicle-model">{{ workOrder.vehicleModel }}</div>
              </div>
              <div v-if="showVoidBtn" class="void-btn" @click="handleVoid">
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
              v-for="(tag, index) in internalStatusTags"
              :key="index"
              class="status-tag-item"
              :class="{ active: tag.active }"
              @click="handleTagClick(index)"
            >
              {{ tag.label }}
            </div>
          </div>

          <!-- 维修项目列表 -->
          <div class="repair-list" v-if="filteredRepairItems.length > 0">
            <div
              v-for="item in filteredRepairItems"
              :key="item.id"
              class="repair-item"
              @click="toggleItemSelect(item.id)"
            >
              <div class="item-checkbox">
                <div class="checkbox-icon" :class="{ checked: item.selected }">
                  <van-icon v-if="item.selected" name="success" />
                </div>
              </div>
              <div class="item-content">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-info">
                  <span class="info-text">工位：{{ item.station }}</span>
                  <span class="info-text">技师：{{ item.technician }}</span>
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
            <span class="select-text">全选</span>
          </div>
          <div class="action-buttons">
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
              @click="showStartConfirm"
            >
              <span>作业开始</span>
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
/**
 * 批量操作弹窗组件 - 作业开始
 * 根据设计稿实现: https://mastergo.com/file/175060511907951?layer_id=1212:194749
 */
import { ref, computed, watch } from 'vue'
import { showConfirmDialog } from 'vant'
import CancelWorkPopup from './CancelWorkPopup.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  workOrder: {
    type: Object,
    default: () => ({
      orderNo: '3318938923892839283',
      tag: '外返',
      status: 'pending',
      statusText: '待派工',
      plateNumber: '浙AA12345',
      vehicleModel: 'B10-510激光雷达版 · LFV3H6686RKYM3393'
    })
  },
  repairItems: {
    type: Array,
    default: () => [
      {
        id: '1',
        name: '更换或拆装左迁门电动防夹玻璃升降器总成更换或拆装左或拆装左或拆装左或拆装左或拆…',
        station: '0001',
        technician: '云佩玉',
        status: 'pending'
      },
      {
        id: '2',
        name: '更换或拆装气门嘴总成',
        station: '0002',
        technician: '汤杨',
        status: 'working'
      },
      {
        id: '3',
        name: '更换刹车片',
        station: '0003',
        technician: '昌瑞堂',
        status: 'pending'
      }
    ]
  },
  statusTags: {
    type: Array,
    default: () => [
      { label: '待派工', active: false },
      { label: '未作业', active: true },
      { label: '作业中', active: false },
      { label: '待质检', active: false },
      { label: '待终检', active: false }
    ]
  },
  showVoidBtn: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:modelValue',
  'batch-dispatch',
  'batch-start',
  'refresh',
  'add-repair',
  'void'
])

const visible = ref(props.modelValue)

// 作废弹窗显示状态
const showCancelPopup = ref(false)

// 内部维修项目列表
const internalRepairItems = ref([])

// 内部状态标签
const internalStatusTags = ref([])

// 当前选中的标签索引
const activeTagIndex = ref(0)

// 状态映射：标签名称 -> 维修项目状态
const tagStatusMap = {
  待派工: 'pending',
  未作业: 'unworked',
  作业中: 'working',
  待质检: 'quality',
  待终检: 'final'
}

// 根据状态过滤的维修项目
const filteredRepairItems = computed(() => {
  if (internalRepairItems.value.length === 0) return []
  const activeTag = internalStatusTags.value[activeTagIndex.value]
  if (!activeTag) return internalRepairItems.value

  // 如果是"未作业"标签，显示所有未完成的项目
  if (activeTag.label === '未作业') {
    return internalRepairItems.value
  }

  // 其他标签按状态过滤
  const targetStatus = tagStatusMap[activeTag.label]
  return internalRepairItems.value.filter((item) => item.status === targetStatus)
})

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      // 打开时初始化维修项目列表
      internalRepairItems.value = props.repairItems.map((item) => ({
        ...item,
        selected: false
      }))
      // 初始化状态标签
      internalStatusTags.value = props.statusTags.map((tag, index) => ({
        ...tag,
        active: index === 0
      }))
      activeTagIndex.value = 0
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
  return internalRepairItems.value.some((item) => item.selected)
})

// 是否全选（基于过滤后的列表）
const isAllSelected = computed(() => {
  if (filteredRepairItems.value.length === 0) return false
  return filteredRepairItems.value.every((item) => item.selected)
})

// 切换状态标签
const handleTagClick = (index) => {
  activeTagIndex.value = index
  internalStatusTags.value.forEach((tag, i) => {
    tag.active = i === index
  })
}

// 切换单个选中
const toggleItemSelect = (itemId) => {
  const item = internalRepairItems.value.find((i) => i.id === itemId)
  if (item) {
    item.selected = !item.selected
  }
}

// 切换全选（只操作过滤后的列表）
const toggleSelectAll = () => {
  const newState = !isAllSelected.value
  filteredRepairItems.value.forEach((item) => {
    item.selected = newState
  })
}

// 获取选中的项目
const getSelectedItems = () => {
  return internalRepairItems.value.filter((item) => item.selected)
}

// 显示删除确认弹窗
const showDeleteConfirm = () => {
  const selectedItems = getSelectedItems()
  if (selectedItems.length === 0) return

  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除选中的 ${selectedItems.length} 个派工项目吗？`
  })
    .then(() => {
      // TODO: 调用删除派工接口
      console.log('确认删除派工:', selectedItems)
      emit('batch-dispatch', selectedItems)
      handleClose()
    })
    .catch(() => {})
}

// 显示作业开始确认弹窗
const showStartConfirm = () => {
  const selectedItems = getSelectedItems()
  if (selectedItems.length === 0) return

  showConfirmDialog({
    title: '确认作业开始',
    message: `确定要对选中的 ${selectedItems.length} 个项目开始作业吗？`
  })
    .then(() => {
      // TODO: 调用作业开始接口
      console.log('确认作业开始:', selectedItems)
      emit('batch-start', selectedItems)
      handleClose()
    })
    .catch(() => {})
}

// 添加维修项目
const handleAddRepair = () => {
  emit('add-repair')
}

// 作废
const handleVoid = () => {
  showCancelPopup.value = true
}

// 确认作废
const handleVoidConfirm = (reason) => {
  // TODO: 调用作废接口
  console.log('确认作废工单:', props.workOrder, '原因:', reason)
  emit('void', { ...props.workOrder, reason })
  handleClose()
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
// 颜色变量
$color-primary: #009100; // 零跑绿
$color-text-primary: #191a1b; // 主要文字
$color-text-secondary: #888; // 次要文字
$color-text-tertiary: #545454; // 第三级文字
$color-warning: #c8a12b; // 警告色
$color-danger: #b91919; // 危险色
$color-border: #e6e6e5; // 边框色
$color-bg-gray: #f4f4f4; // 灰色背景
$color-bg-light: #f8f7f7; // 浅灰背景
$color-white: #fff;

.batch-operate-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: $color-bg-gray;

  // 标题栏
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 58px;
    background-color: $color-bg-gray;
    padding: 0 16px;
    flex-shrink: 0;

    .header-left,
    .header-right {
      width: 20px;
    }

    .close-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      .van-icon {
        font-size: 20px;
        color: $color-text-secondary;
      }
    }

    .header-center {
      display: flex;
      align-items: center;
      gap: 2px;

      .order-number {
        font-family: 'PingFang SC', sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: $color-text-primary;
        line-height: 20px;
      }

      .order-tag {
        background-color: rgba(25, 26, 27, 0.06);
        color: $color-text-primary;
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
      background-color: $color-white;
      border-radius: 8px;
      padding: 12px;
    }
  }

  // 车辆信息
  .vehicle-info-section {
    padding-bottom: 12px;
    border-bottom: 0.5px solid $color-border;

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
            color: $color-text-primary;
            line-height: 22px;
          }

          .status-text {
            font-family: 'PingFang SC', sans-serif;
            font-size: 12px;
            font-weight: 600;
            line-height: 17px;

            &.status-pending {
              color: $color-warning;
            }

            &.status-working {
              color: $color-primary;
            }
          }
        }

        .vehicle-model {
          font-family: 'PingFang SC', sans-serif;
          font-size: 12px;
          font-weight: 400;
          color: $color-text-tertiary;
          line-height: 17px;
        }
      }

      .void-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 32px;
        border: 1px solid $color-danger;
        border-radius: 4px;
        cursor: pointer;

        span {
          font-family: 'PingFang SC', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: $color-danger;
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
      background-color: $color-bg-light;
      border-radius: 4px;
      font-family: 'PingFang SC', sans-serif;
      font-size: 12px;
      font-weight: 400;
      color: $color-text-primary;
      line-height: 20px;

      &.active {
        background-color: transparent;
        border: 1px solid $color-primary;
        color: $color-primary;
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
      color: $color-text-primary;
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
        color: $color-primary;
        line-height: 17px;
      }

      .arrow-icon {
        font-size: 16px;
        color: $color-primary;
      }
    }
  }

  // 维修项目列表
  .repair-list {
    .repair-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 0.5px solid $color-border;

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
          background-color: $color-primary;
          border-color: $color-primary;

          .van-icon {
            color: $color-white;
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
          color: $color-text-primary;
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
            color: $color-text-secondary;
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
      color: $color-text-secondary;
      line-height: 20px;
    }
  }

  // 底部操作栏
  .popup-footer {
    flex-shrink: 0;
    background-color: $color-white;
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
            background-color: $color-primary;
            border-color: $color-primary;

            .van-icon {
              color: $color-white;
              font-size: 12px;
            }
          }
        }

        .select-text {
          font-family: 'PingFang SC', sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: $color-text-primary;
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
            border: 1px solid $color-primary;

            span {
              color: $color-primary;
            }
          }

          &.primary-btn {
            background-color: $color-primary;

            span {
              color: $color-white;
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
      background-color: $color-white;
      display: flex;
      justify-content: center;
      align-items: center;

      &::after {
        content: '';
        width: 134px;
        height: 5px;
        background-color: #000;
        border-radius: 2.5px;
      }
    }
  }
}
</style>
