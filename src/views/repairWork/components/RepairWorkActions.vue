<template>
  <!-- 派工弹层 -->
  <DispatchWorkPopup v-model="showDispatchPopup" @submit="handleDispatchSubmit" />

  <!-- 终检确认弹窗 -->
  <FinalCheckPopup v-model="showFinalCheckPopup" @submit="handleFinalCheckSubmit" />

  <!-- 批量操作弹窗 -->
  <BatchOperate
    v-model="showBatchOperate"
    :work-order="workOrder"
    :status-tags="statusTags"
    :show-void-btn="showVoidBtn"
    @batch-dispatch="handleBatchDispatch"
    @batch-start="handleBatchStart"
    @add-repair="handleAddRepair"
    @void="handleVoid"
  />

  <div class="repair-work-actions">
    <div class="actions-left">
      <span class="more-text" @click="handleMore">更多</span>
    </div>
    <div class="actions-right">
      <!-- 派工tab按钮 -->
      <template v-if="activeTab === 'dispatch'">
        <van-button
          class="action-btn delete-btn"
          plain
          type="primary"
          size="small"
          round
          @click="handleDelete"
        >
          删除派工
        </van-button>
        <van-button
          class="action-btn start-btn"
          plain
          type="primary"
          size="small"
          round
          @click="handleStart"
        >
          作业开始
        </van-button>
        <van-button
          v-if="showEndBtn"
          class="action-btn end-btn"
          plain
          type="primary"
          size="small"
          round
          @click="handleEnd"
        >
          作业结束
        </van-button>
        <van-button
          class="action-btn dispatch-btn"
          type="primary"
          size="small"
          round
          @click="handleDispatch"
        >
          派工
        </van-button>
      </template>

      <!-- 施工tab按钮 -->
      <template v-else-if="activeTab === 'working'">
        <van-button
          class="action-btn delete-btn"
          plain
          type="primary"
          size="small"
          round
          @click="handleDelete"
        >
          删除派工
        </van-button>
        <van-button
          class="action-btn end-btn"
          plain
          type="primary"
          size="small"
          round
          @click="handleEnd"
        >
          作业结束
        </van-button>
        <van-button
          class="action-btn start-btn"
          plain
          type="primary"
          size="small"
          round
          @click="handleStart"
        >
          作业开始
        </van-button>
      </template>

      <!-- 终检tab按钮 -->
      <template v-else-if="activeTab === 'inspection'">
        <van-button
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
          class="action-btn final-check-btn"
          type="primary"
          size="small"
          round
          @click="handleFinalCheck"
        >
          终检
        </van-button>
      </template>
    </div>
  </div>
</template>

<script setup>
/**
 * 维修工单操作按钮组件
 * 根据设计稿实现: https://mastergo.com/file/175060511907951?layer_id=1212:152672
 */
import { ref } from 'vue'
import DispatchWorkPopup from './DispatchWorkPopup.vue'
import BatchOperate from './BatchOperate.vue'
import FinalCheckPopup from './FinalCheckPopup.vue'

defineProps({
  // 工单信息
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
  // 维修项目列表
  repairItems: {
    type: Array,
    default: () => []
  },
  // 状态标签
  statusTags: {
    type: Array,
    default: () => [
      { label: '待派工', active: false },
      { label: '未作业', active: false },
      { label: '作业中', active: false },
      { label: '待质检', active: false },
      { label: '待终检', active: false }
    ]
  },
  // 是否显示作废按钮
  showVoidBtn: {
    type: Boolean,
    default: true
  },
  // 当前激活的tab: dispatch-派工, working-施工, finalCheck-终检
  activeTab: {
    type: String,
    default: 'dispatch'
  },
  // 是否显示作业结束按钮（派工tab根据状态控制）
  showEndBtn: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'delete',
  'start',
  'end',
  'dispatch',
  'rework',
  'finalCheck',
  'batchDispatch',
  'batchStart',
  'addRepair',
  'void',
  'refresh'
])

const showDispatchPopup = ref(false)
const showBatchOperate = ref(false)
const showFinalCheckPopup = ref(false)

const handleDelete = () => {
  emit('delete')
}

const handleStart = () => {
  emit('start')
}

const handleDispatch = () => {
  showDispatchPopup.value = true
}

const handleMore = () => {
  showBatchOperate.value = true
}

const handleDispatchSubmit = (data) => {
  console.log('派工数据:', data)
  emit('dispatch', data)
}

const handleBatchDispatch = (data) => {
  console.log('批量删除派工数据:', data)
  emit('batchDispatch', data)
}

const handleBatchStart = (data) => {
  console.log('批量开始作业数据:', data)
  emit('batchStart', data)
}

const handleAddRepair = () => {
  console.log('添加维修项目')
  emit('addRepair')
}

const handleVoid = () => {
  console.log('作废')
  emit('void')
}

const handleEnd = () => {
  emit('end')
}

const handleRework = () => {
  emit('rework')
}

const handleFinalCheck = () => {
  showFinalCheckPopup.value = true
}

const handleFinalCheckSubmit = (data) => {
  console.log('终检确认数据:', data)
  emit('finalCheck', data)
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
    /* token: #009100 */
    color: #009100;
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
  &.start-btn,
  &.end-btn,
  &.rework-btn {
    /* token: #009100 */
    color: #009100;
    border-color: #009100;
    background: transparent;
  }

  &.dispatch-btn,
  &.final-check-btn {
    /* token: #009100 */
    background: #009100;
    border-color: #009100;

    /* token: #FFFFFF */
    color: #fff;
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
