<template>
  <!-- 终检确认弹窗 -->
  <FinalCheckPopup v-model="showFinalCheckPopup" :service-proxy-id="workOrder.serviceProxyId" @refresh="handleRefresh" />

  <!-- 故障信息弹窗 -->
  <FaultInfoPopup
    v-model="showFaultInfoPopup"
    :service-proxy-id="workOrder.serviceProxyId"
    :order-no="workOrder.serviceProxyCode"
    :order="workOrder"
    @refresh="handleRefresh"
  />

  <!-- 批量操作弹窗 -->
  <BatchOperate
    v-model="showBatchOperate"
    :work-order="workOrder"
    :repair-items="repairItems"
    :default-tag-index="defaultTagIndex"
    @refresh="handleRefresh"
  />

  <div class="repair-work-actions">
    <div class="actions-left">
      <span class="more-text" @click="handleMore">更多</span>
    </div>
    <div class="actions-right">
      <van-button
        v-if="hasNotStarted || hasInProgress"
        class="action-btn"
        plain
        type="primary"
        size="small"
        round
        @click="handleDelete"
      >
        删除派工
      </van-button>
      <van-button
        v-if="hasInProgress"
        class="action-btn"
        plain
        type="primary"
        size="small"
        round
        @click="handleEnd"
      >
        作业结束
      </van-button>
      <van-button
        v-if="hasNotStarted"
        class="action-btn"
        plain
        type="primary"
        size="small"
        round
        @click="handleStart"
      >
        作业开始
      </van-button>
      <van-button
        v-if="hasQualityed"
        class="action-btn rework-btn"
        plain
        type="primary"
        size="small"
        round
        @click="handleRework"
      >
        返修
      </van-button>
      <van-button
        v-if="hasPendingQuality"
        class="action-btn"
        plain
        type="primary"
        size="small"
        round
        @click="handleRework"
      >
        质检
      </van-button>
      <van-button
        v-if="hasPendingFinal && activeTab === 'inspection'"
        class="action-btn"
        plain
        type="primary"
        size="small"
        round
        @click="handleFinalCheckSubmit"
      >
        终检
      </van-button>
      <van-button
        v-if="hasPendingDispatch"
        class="action-btn"
        plain
        type="primary"
        size="small"
        round
        @click="handleDispatch"
      >
        派工
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BatchOperate from './BatchOperatePopup.vue'
import FinalCheckPopup from './FinalCheckPopup.vue'
import FaultInfoPopup from './FaultInfoPopup.vue'
import { filterByTag, handleFinalCheckFlow } from '../utils'

const props = defineProps({
  workOrder: {
    type: Object,
    default: () => ({})
  },
  repairItems: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: 'dispatch'
  },
  showEndBtn: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])

const showBatchOperate = ref(false)
const showFinalCheckPopup = ref(false)
const showFaultInfoPopup = ref(false)
const defaultTagIndex = ref(0)

const serviceProxyId = computed(() => props.workOrder.serviceProxyId)

// 根据维修项目数据判断各分类是否存在
const recordList = computed(() => props.workOrder.repairWorkRecordList || [])
const hasItem = (tagIndex) => recordList.value.some(item => filterByTag(item, tagIndex))

const hasPendingDispatch = computed(() => hasItem(0))
const hasNotStarted = computed(() => hasItem(1))
const hasInProgress = computed(() => hasItem(2))
const hasPendingQuality = computed(() => hasItem(3))
const hasQualityed = computed(() => hasItem(4))
const hasPendingFinal = computed(() => {
  const list = recordList.value
  return list.length > 0 && list.every(item => filterByTag(item, 4))
})

// 批量操作按钮 → 打开 BatchOperate 弹窗
const handleDelete = () => {
  defaultTagIndex.value = hasInProgress.value ? 2 : 1
  showBatchOperate.value = true
}

const handleStart = () => {
  defaultTagIndex.value = 1
  showBatchOperate.value = true
}

const handleEnd = () => {
  defaultTagIndex.value = 2
  showBatchOperate.value = true
}

// 派工弹窗
const handleDispatch = () => {
  defaultTagIndex.value = 0
  showBatchOperate.value = true
}

// 返修和质检
const handleRework = async() => {
  defaultTagIndex.value = 3
  showBatchOperate.value = true
}

// 更多 → 批量操作
const handleMore = () => {
  defaultTagIndex.value = 0
  showBatchOperate.value = true
}

// 终检弹窗提交
const handleFinalCheckSubmit = async() => {
  await handleFinalCheckFlow({
    serviceProxyId: serviceProxyId.value,
    workOrder: props.workOrder,
    onRefresh: () => emit('refresh'),
    onShowFinalCheckPopup: () => { showFinalCheckPopup.value = true },
    onShowFaultInfoPopup: () => { showFaultInfoPopup.value = true }
  })
}

// 刷新回调
const handleRefresh = () => {
  showBatchOperate.value = false
  showFaultInfoPopup.value = false
  showFinalCheckPopup.value = false
  emit('refresh')
}
</script>

<style lang="scss" scoped>
.repair-work-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  padding: 0;
}

.actions-left {
  .more-text {
    color: var(--leap-color-primary);
    font-family:
      'PingFang SC',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }
  }
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 32px;
  border-radius: 38px;
  border-width: 1px;

  &.delete-btn,
  &.end-btn,
  &.rework-btn {
    color: var(--leap-color-primary);
    border-color: var(--leap-color-primary);
    background: transparent;
  }

  &:last-child{
    background: var(--leap-color-primary);
    border-color: var(--leap-color-primary);
    color: #fff;
  }
  &:not(:nth-last-child(-n+3)) {
    display: none;
  }

  :deep(.van-button__text) {
    font-family:
      'PingFang SC',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
  }
}
</style>
