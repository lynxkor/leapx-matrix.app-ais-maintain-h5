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
    <div class="item-list-wrapper" v-if="expandState !== 'collapsed'">
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
import { showToast } from 'vant'
import DispatchWorkPopup from './DispatchWorkPopup.vue'
import { WorkRecordStatusEnum } from '../constant'
import { executeSingleItemOperation } from '../utils'

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
    overscroll-behavior: contain;

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
