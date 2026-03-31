<template>
  <!-- 终检确认弹窗 -->
  <FinalCheckPopup v-model="showFinalCheckPopup" :service-proxy-id="workOrder.id" @submit="handleFinalCheckSubmit" />

  <!-- 故障信息弹窗 -->
  <FaultInfoPopup
    v-model="showFaultInfoPopup"
    :service-proxy-id="workOrder.id"
    :order-no="workOrder.code"
    :order="workOrder"
    @submit="handleRefresh"
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
          class="action-btn"
          plain
          type="primary"
          size="small"
          round
          @click="handleStart"
        >
          作业开始
        </van-button>
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
          class="action-btn rework-btn"
          plain
          type="primary"
          size="small"
          round
          @click="handleRework"
        >
          质检
        </van-button>
        <van-button
          class="action-btn final-check-btn"
          type="primary"
          size="small"
          round
          @click="handleFinalCheckSubmit"
        >
          终检
        </van-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import BatchOperate from './BatchOperatePopup.vue'
import FinalCheckPopup from './FinalCheckPopup.vue'
import FaultInfoPopup from './FaultInfoPopup.vue'
import { finalInspection, finalInspectionDetail } from '../../../api/repairWork'
import { showFaultCheckDialog } from '../utils'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/libs/utils'

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

const serviceProxyId = computed(() => props.workOrder.id)

// 批量操作按钮 → 打开 BatchOperate 弹窗
const handleDelete = () => {
  defaultTagIndex.value = 2
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

// 终检弹窗
const handleFinalCheck = () => {
  showFinalCheckPopup.value = true
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
const handleFinalCheckSubmit = async(data) => {
  try {
    const resdata = await finalInspectionDetail(serviceProxyId.value)
    const res = resdata?.data || {}
    if (res.faultFlag && res.faultAlertRecordResps?.length === 0) {
      const result = await showFaultCheckDialog(serviceProxyId.value, () => emit('refresh'), props.workOrder)
      if (result?.action === 'fillFault') {
        showFaultInfoPopup.value = true
      }
    } else {
      // 有电池信息和追溯信息需要填写
      if (res.batteryFlag || res.tranceFlag) {
        handleFinalCheck()
      } else {
        // 不需要填写，直接终检
        showConfirmDialog({
          title: '提示',
          message: '确认要终检吗？'
        }).then(e => {
          const userStore = useUserStore()
          const submitData = {
            ...res,
            repairWorkRecordResps: res.repairWorkRecordResps,
            faultAlertRecordParams: res.faultAlertRecordResps,
            traceRecordParams: res.partsTraceRecordResps,
            currentFault: res.faultFlag === 1 ? 0 : 1,
            id: serviceProxyId.value,
            finalCheckAt: formatDateTime(new Date()),
            finalCheckerId: userStore.userId,
            finalChecker: userStore.userName
          }
          finalInspection(submitData).then(target => {
            if (target.code === 200) {
              showToast('终检成功')
              emit('refresh')
            } else {
              showToast(target.message)
            }
          }).catch(res => {
            showToast(res.message)
            emit('refresh')
          })
        })
      }
    }
  } catch {
    showToast('终检失败')
  }
}

// 刷新回调
const handleRefresh = () => {
  showBatchOperate.value = false
  showFaultInfoPopup.value = false
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
