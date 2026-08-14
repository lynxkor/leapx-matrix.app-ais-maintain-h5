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

  <div class="repair-work-actions">
    <div class="actions-left">
      <span class="more-text" @click="handleMore">更多</span>
    </div>
    <div class="actions-right">
      <van-button
        v-if="(hasNotStarted || hasInProgress) && permissionStore.hasPermission('AISMC-app-serviceProxy-deleteWorkers')"
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
        v-if="hasInProgress && permissionStore.hasPermission('AISMC-app-serviceProxy-endWork')"
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
        v-if="hasNotStarted && permissionStore.hasPermission('AISMC-app-serviceProxy-startWork')"
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
        v-if="hasQualityed && activeTab !== 'working' && permissionStore.hasPermission('AISMC-app-serviceProxy-repaired')"
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
        v-if="hasPendingQuality && activeTab !== 'working' && permissionStore.hasPermission('AISMC-app-serviceProxy-qualityInspection')"
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
        v-if="hasPendingFinal && activeTab === 'inspection' && permissionStore.hasPermission('AISMC-app-serviceProxy-finalInspection')"
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
        v-if="hasPendingDispatch && permissionStore.hasPermission('AISMC-app-serviceProxy-dispatchWorkers')"
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
import FinalCheckPopup from './FinalCheckPopup.vue'
import FaultInfoPopup from './FaultInfoPopup.vue'
import { filterByTag, handleFinalCheckFlow } from '../utils'
import { usePermissionStore } from '@/stores/permission'

const permissionStore = usePermissionStore()

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

const emit = defineEmits(['refresh', 'openBatchOperate'])

const showFinalCheckPopup = ref(false)
const showFaultInfoPopup = ref(false)

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
  return list.every(item => filterByTag(item, 4))
})

// 批量操作按钮 → 通知父组件打开弹窗
const handleDelete = () => emit('openBatchOperate', hasInProgress.value ? 2 : 1)
const handleStart = () => emit('openBatchOperate', 1)
const handleEnd = () => emit('openBatchOperate', 2)
const handleDispatch = () => emit('openBatchOperate', 0)
const handleRework = () => emit('openBatchOperate', 3)
const handleMore = () => emit('openBatchOperate', 0)

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
