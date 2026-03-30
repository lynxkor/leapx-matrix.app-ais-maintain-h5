<template>
  <!-- 终检确认弹窗 -->
  <FinalCheckPopup v-model="showFinalCheckPopup" @submit="handleFinalCheckSubmit" />

  <!-- 批量操作弹窗 -->
  <BatchOperate
    v-model="showBatchOperate"
    :work-order="workOrder"
    :repair-items="repairItems"
    @refresh="handleRefresh"
  />

  <div class="repair-work-actions">
    <div class="actions-left">
      <span class="more-text" @click="handleMore">更多</span>
    </div>
    <div class="actions-right">
      <!-- 派工tab按钮 -->
      <template v-if="activeTab === 'dispatch'">
        <!-- <van-button
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
        </van-button> -->
        <!-- <van-button
          v-if="showEndBtn"
          class="action-btn end-btn"
          plain
          type="primary"
          size="small"
          round
          @click="handleEnd"
        >
          作业结束
        </van-button> -->
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
import { ref, computed } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import BatchOperate from './BatchOperatePopup.vue'
import FinalCheckPopup from './FinalCheckPopup.vue'
import { repaired, finalInspection } from '../../../api/repairWork'

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

const serviceProxyId = computed(() => props.workOrder.id)

// 批量操作按钮 → 打开 BatchOperate 弹窗
const handleDelete = () => {
  showBatchOperate.value = true
}

const handleStart = () => {
  showBatchOperate.value = true
}

const handleEnd = () => {
  showBatchOperate.value = true
}

// 派工弹窗
const handleDispatch = () => {
  showBatchOperate.value = true
}

// 终检弹窗
const handleFinalCheck = () => {
  showFinalCheckPopup.value = true
}

// 返修
const handleRework = () => {
  showConfirmDialog({
    title: '确认返修',
    message: '确定要对该工单进行返修吗？',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(async() => {
      try {
        await repaired({ serviceProxyId: serviceProxyId.value })
        showToast('返修成功')
        emit('refresh')
      } catch {
        showToast('操作失败')
      }
    })
    .catch(() => {})
}

// 更多 → 批量操作
const handleMore = () => {
  showBatchOperate.value = true
}

// 终检弹窗提交
const handleFinalCheckSubmit = async(data) => {
  try {
    await finalInspection({ serviceProxyId: serviceProxyId.value, ...data })
    showToast('终检成功')
    showFinalCheckPopup.value = false
    emit('refresh')
  } catch {
    showToast('终检失败')
  }
}

// 刷新回调
const handleRefresh = () => {
  showBatchOperate.value = false
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

  &.start-btn,
  &.dispatch-btn,
  &.final-check-btn {
    background: var(--leap-color-primary);
    border-color: var(--leap-color-primary);
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
