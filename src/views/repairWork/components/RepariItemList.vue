<template>
  <div class="repair-item-list">
    <!-- 派工弹窗 -->
    <DispatchWorkPopup
      v-model="showDispatchPopup"
      :single-item="currentDispatchItem"
      :service-proxy-id="serviceProxyId"
      @submit="handleDispatchSubmit"
    />

    <!-- 折叠头部 -->
    <div class="collapse-header" @click="toggleExpand">
      <span class="header-title">查看维修项目</span>
      <van-icon :name="expandState === 'collapsed' ? 'arrow-down' : 'arrow-up'" />
    </div>

    <!-- 维修项目列表 -->
    <div ref="listWrapperRef" class="item-list-wrapper" v-if="expandState !== 'collapsed'" @touchstart="onTouchStart" @touchmove="onWrapperTouchMove">
      <div class="item-list">
        <div v-for="(item, index) in displayItems" :key="index" class="repair-item-card">
          <div class="item-content">
            <div class="item-left">
              <div class="item-name">
                <span class="order-tag" v-if="item.reworkTypeLabel">{{ item.reworkTypeLabel }}</span>
                {{ item.repairItemName }}
              </div>
              <div class="item-meta">
                <span v-if="item.repairItemTypeName" class="meta-text">{{
                  item.repairItemTypeName
                }}</span>
                <span v-if="item.checkoutTypeName" class="meta-text">{{
                  item.checkoutTypeName
                }}</span>
              </div>
            </div>
            <div class="item-actions">
              <!-- 派工tab：显示派工操作 -->
              <template
                v-if="item.status === WorkRecordStatusEnum.NOT_STARTED && item.isDispatch !== 1"
              >
                <span class="action-text dispatch" @click="handleAction('dispatch', item)"
                  >派工</span
                >
              </template>

              <!-- 施工tab：删除派工 + 作业开始/结束 + 质检 -->
              <span
                v-if="item.isDispatch === 1 && item.status !== WorkRecordStatusEnum.COMPLETED"
                class="action-text delete"
                @click="handleAction('delete', item)"
                >删除派工</span
              >
              <span
                v-if="item.status === WorkRecordStatusEnum.IN_PROGRESS"
                class="action-text start"
                @click="handleAction('end', item)"
                >作业结束</span
              >
              <span
                v-if="item.status === WorkRecordStatusEnum.NOT_STARTED && item.isDispatch === 1"
                class="action-text start"
                @click="handleAction('start', item)"
                >作业开始</span
              >

              <!-- 终检tab：返修 + 终检 -->
              <span v-if="item.status === WorkRecordStatusEnum.COMPLETED" class="action-text rework" @click="handleAction('rework', item)">返修</span>
              <span v-if="item.status === WorkRecordStatusEnum.COMPLETED && item.qualityCheckStatus !== 30" class="action-text rework" @click="handleAction('quality', item)">质检</span>
              <!-- <span v-if="item.status === WorkRecordStatusEnum.COMPLETED" class="action-text final-check" @click="handleAction('finalCheck', item)">终检</span> -->
            </div>
          </div>
        </div>
      </div>

      <!-- 查看全部按钮：partial状态且超过10条时显示 -->
      <div
        v-if="expandState === 'partial' && sortedItems.length > VisibleItemLength"
        class="view-all"
        @click="emit('viewAll')"
      >
        <span class="view-all-text">查看全部</span>
        <van-icon name="arrow-down" size="12" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import DispatchWorkPopup from './DispatchWorkPopup.vue'
import { WorkRecordStatusEnum } from '../constant'
import { executeSingleItemOperation, filterByTag } from '../utils'

const VisibleItemLength = 10

const props = defineProps({
  repairItems: {
    type: Array,
    default: () => []
  },
  serviceProxyId: {
    type: String,
    default: ''
  },
  orderNo: {
    type: String,
    default: ''
  },
  hasFault: {
    type: Boolean,
    default: false
  },
  activeTab: {
    type: String,
    default: 'dispatch'
  }
})

const emit = defineEmits(['refresh', 'viewAll'])

// 折叠状态: collapsed(折叠) / partial(展示前10条)
const expandState = ref('partial')
const listWrapperRef = ref(null)
let touchStartY = 0

const onTouchStart = (e) => {
  touchStartY = e.touches[0].clientY
}

// 阻止内层滚动事件冒泡到 van-pull-refresh，但在边界位置放行以允许下拉刷新
const onWrapperTouchMove = (e) => {
  const el = listWrapperRef.value
  if (!el) return
  const { scrollTop, scrollHeight, clientHeight } = el
  if (scrollHeight <= clientHeight) return

  const direction = e.touches[0].clientY - touchStartY
  // 下拉到顶部 → 放行（允许 pull-to-refresh）
  if (direction > 0 && scrollTop <= 0) return
  // 上拉到底部 → 放行（允许外层滚动继续）
  if (direction < 0 && scrollTop >= scrollHeight - clientHeight - 1) return

  e.stopPropagation()
}

// 派工弹窗
const showDispatchPopup = ref(false)
const currentDispatchItem = ref(null)

// 根据 tab 筛选+排序维修项目
const sortedItems = computed(() => {
  const items = props.repairItems
  if (!items.length) return []
  switch (props.activeTab) {
    case 'dispatch':
      return items.filter(item => filterByTag(item, 0) || filterByTag(item, 1))
    case 'working': {
      const priority = [0, 1, 2, 3]
      const prioritized = []
      const rest = []
      for (const item of items) {
        const idx = priority.findIndex(tag => filterByTag(item, tag))
        if (idx !== -1) prioritized.push({ item, priority: idx })
        else rest.push(item)
      }
      prioritized.sort((a, b) => a.priority - b.priority)
      return [...prioritized.map(p => p.item), ...rest]
    }
    case 'inspection':
      return items
    default:
      return items
  }
})

// 切换 tab 时重置折叠状态
watch(() => props.activeTab, (tab) => {
  expandState.value = tab === 'inspection' ? 'collapsed' : 'partial'
}, { immediate: true })

const displayItems = computed(() => {
  if (expandState.value === 'collapsed') return []
  if (expandState.value === 'partial') return sortedItems.value.slice(0, VisibleItemLength)
  return sortedItems.value
})

const toggleExpand = () => {
  expandState.value = expandState.value === 'collapsed' ? 'partial' : 'collapsed'
}

// 统一操作处理
const handleAction = async(action, item) => {
  // 派工直接打开弹窗
  if (action === 'dispatch') {
    currentDispatchItem.value = item
    showDispatchPopup.value = true
    return
  }

  await executeSingleItemOperation(action, {
    serviceProxyId: props.serviceProxyId,
    item,
    onRefresh: () => emit('refresh'),
    onSuccess: async() => {}
  })
}

// 派工弹窗提交
const handleDispatchSubmit = async() => {
  showDispatchPopup.value = false
  showToast('派工成功')
  emit('refresh')
}

</script>

<style lang="scss" scoped>
.repair-item-list {
  width: 100%;
  border-top: 0.5px solid var(--leap-color-default-light-4);
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
  .order-tag {
    background-color: rgba(25, 26, 27, 0.06);
    color: var(--leap-color-default);
    font-size: 12px;
    font-weight: 400;
    padding: 1px 4px;
    border-radius: 4px;
  }

  .item-list-wrapper {
    margin-top: 8px;
    max-height: 360px;
    overflow: auto;

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
        font-size: 14px;
        font-family: 'PingFang SC', sans-serif;
        color: #545454;
      }

      .van-icon {
        color: #545454;
      }
    }
  }
}
</style>
