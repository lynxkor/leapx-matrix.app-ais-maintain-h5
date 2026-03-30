<template>
  <div class="repair-item-list">
    <!-- 派工弹窗 -->
    <DispatchWorkPopup v-model="showDispatchPopup" @submit="handleDispatchSubmit" />

    <!-- 折叠头部 -->
    <div class="collapse-header" @click="toggleExpand">
      <span class="header-title">查看维修项目</span>
      <van-icon :name="expandState === 'collapsed' ? 'arrow-down' : 'arrow-up'" />
    </div>

    <!-- 维修项目列表 -->
    <div class="item-list-wrapper" v-if="expandState !== 'collapsed'">
      <div class="item-list">
        <div v-for="(item, index) in displayItems" :key="index" class="repair-item-card">
          <div class="item-content">
            <div class="item-left">
              <div class="item-name">{{ item.repairItemName }}</div>
              <div class="item-meta">
                <span v-if="item.repairItemTypeName" class="meta-text"
                  >{{ item.repairItemTypeName }}</span
                >
                <span v-if="item.checkoutTypeName" class="meta-text"
                  >{{ item.checkoutTypeName }}</span
                >
              </div>
            </div>
            <div class="item-actions">
              <!-- 派工tab：显示派工操作 -->
              <template v-if="activeTab === 'dispatch'">
                <span class="action-text dispatch" @click="handleAction('dispatch', item)"
                  >派工</span
                >
              </template>

              <!-- 施工tab：删除派工 + 作业开始/结束 + 质检 -->
              <template v-else-if="activeTab === 'working'">
                <span
                  v-if="item.allowDelete === 1"
                  class="action-text delete"
                  @click="handleAction('delete', item)"
                  >删除派工</span
                >
                <template v-if="item.allowDelete === 1">
                  <van-divider vertical />
                </template>
                <span class="action-text start" @click="handleAction('start', item)"
                  >作业开始</span
                >
                <van-divider vertical />
                <span class="action-text quality" @click="handleAction('quality', item)"
                  >质检</span
                >
              </template>

              <!-- 终检tab：返修 + 终检 -->
              <template v-else-if="activeTab === 'inspection'">
                <span class="action-text rework" @click="handleAction('rework', item)"
                  >返修</span
                >
                <van-divider vertical />
                <span class="action-text final-check" @click="handleAction('finalCheck', item)"
                  >终检</span
                >
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 查看全部按钮：partial状态且有超过2条时显示 -->
      <div
        v-if="expandState === 'partial' && repairItems.length > 2"
        class="view-all"
        @click="expandState = 'full'"
      >
        <span class="view-all-text">查看全部</span>
        <van-icon name="arrow-down" size="12" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import DispatchWorkPopup from './DispatchWorkPopup.vue'
import {
  startWork,
  endWork,
  deleteWorkers,
  repaired,
  finalInspection,
  qualityInspection
} from '../../../api/repairWork'

const props = defineProps({
  repairItems: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: 'dispatch'
  },
  serviceProxyId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['refresh'])

// 三态折叠: collapsed(0条) / partial(2条) / full(全部)
const expandState = ref('collapsed')

// 派工弹窗
const showDispatchPopup = ref(false)
const currentDispatchItem = ref(null)

const displayItems = computed(() => {
  if (expandState.value === 'collapsed') return []
  if (expandState.value === 'partial') return props.repairItems.slice(0, 2)
  return props.repairItems
})

const toggleExpand = () => {
  expandState.value = expandState.value === 'collapsed' ? 'partial' : 'collapsed'
}

// 操作确认文案映射
const actionConfirmMap = {
  delete: { title: '确认删除', message: '确定要删除该派工项目吗？' },
  start: { title: '确认作业开始', message: '确定要开始作业吗？' },
  end: { title: '确认作业结束', message: '确定要结束作业吗？' },
  quality: { title: '确认质检', message: '确定要进行质检吗？' },
  rework: { title: '确认返修', message: '确定要进行返修吗？' },
  finalCheck: { title: '确认终检', message: '确定要进行终检吗？' }
}

// API 函数映射
const apiFnMap = {
  delete: deleteWorkers,
  start: startWork,
  end: endWork,
  quality: qualityInspection,
  rework: repaired,
  finalCheck: finalInspection
}

// 统一操作处理
const handleAction = async(action, item) => {
  // 派工直接打开弹窗
  if (action === 'dispatch') {
    currentDispatchItem.value = item
    showDispatchPopup.value = true
    return
  }

  const config = actionConfirmMap[action]
  if (!config) return

  try {
    await showConfirmDialog({
      title: config.title,
      message: config.message,
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }

  try {
    await apiFnMap[action]({
      serviceProxyId: props.serviceProxyId,
      repairItemId: item.repairItemId || item.id
    })
    showToast('操作成功')
    emit('refresh')
  } catch {
    showToast('操作失败')
  }
}

// 派工弹窗提交
const handleDispatchSubmit = async(data) => {
  showDispatchPopup.value = false
  try {
    // TODO: 派工 API 端点待确认，暂时占位
    console.log('dispatch submit:', {
      serviceProxyId: props.serviceProxyId,
      repairItemId: currentDispatchItem.value?.repairItemId || currentDispatchItem.value?.id,
      ...data
    })
    showToast('派工成功')
    emit('refresh')
  } catch {
    showToast('派工失败')
  }
}
</script>

<style lang="scss" scoped>
.repair-item-list {
  width: 100%;
  border-top: 0.5px solid var(--leap-color-default-light-4);
  border-bottom: 0.5px solid var(--leap-color-default-light-4);
  padding: 10px 0;

  .collapse-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    .header-title {
      font-size: 14px;
      font-family: 'PingFang SC', sans-serif;
      font-weight: 400;
      color: var(--leap-color-default);
      line-height: 20px;
    }

    .van-icon {
      font-size: 16px;
      color: var(--leap-color-default-light-2);
    }
  }

  .item-list-wrapper {
    margin-top: 8px;

    .item-list {
      display: flex;
      flex-direction: column;

      .repair-item-card {
        background-color: var(--leap-color-default-light-5);
        border-radius: 4px;
        border-left: 1px solid transparent;
        padding: 8px;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .item-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;

          .item-left {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;

            .item-name {
              font-size: 14px;
              font-family: 'PingFang SC', sans-serif;
              font-weight: 500;
              color: var(--leap-color-default);
              line-height: 20px;
              text-overflow: ellipsis;
              overflow: hidden;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
            }

            .item-meta {
              display: flex;
              gap: 12px;

              .meta-text {
                font-size: 12px;
                font-family: 'PingFang SC', sans-serif;
                font-weight: 400;
                color: var(--leap-color-default-light-2);
                line-height: 17px;
              }
            }
          }

          .item-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;

            .action-text {
              font-size: 14px;
              font-family: 'PingFang SC', sans-serif;
              font-weight: 400;
              line-height: 20px;
              cursor: pointer;
              white-space: nowrap;

              &.delete,
              &.start,
              &.end,
              &.quality,
              &.dispatch,
              &.rework,
              &.final-check {
                color: var(--leap-color-primary);
              }
            }

            .van-divider {
              margin: 0;
              border-color: var(--leap-color-primary-light-5);
              height: 12px;
            }
          }
        }
      }
    }

    .view-all {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 0 0;
      cursor: pointer;

      .view-all-text {
        font-size: 13px;
        font-family: 'PingFang SC', sans-serif;
        color: var(--leap-color-primary);
      }

      .van-icon {
        color: var(--leap-color-primary);
      }
    }
  }
}
</style>
