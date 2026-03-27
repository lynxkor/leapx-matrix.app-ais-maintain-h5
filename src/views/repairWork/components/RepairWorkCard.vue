<template>
  <div class="repair-work-card">
    <!-- 工单基本信息 -->
    <div class="order-info">
      <!-- 顶部：工单号 + 状态标签 -->
      <div class="order-header">
        <div class="order-number-wrapper">
          <span class="order-number">{{ workOrder.orderNo }}</span>
          <span v-if="workOrder.tag" class="order-tag">{{ workOrder.tag }}</span>
        </div>
        <span class="order-status" :class="`status-${workOrder.status}`">{{
          workOrder.statusText
        }}</span>
      </div>

      <!-- 车辆信息 -->
      <div class="vehicle-info">
        <div class="plate-number">
          <span class="plate-text">{{ workOrder.plateNumber }}</span>
          <van-icon name="warning" color="#B91919" size="16" />
        </div>
        <div class="vehicle-model">{{ workOrder.vehicleModel }}</div>
      </div>

      <!-- 客户信息 -->
      <div class="customer-info">
        <div class="info-row">
          <span class="info-label">车主</span>
          <span class="info-value">{{ workOrder.owner }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">客户经理</span>
          <span class="info-value">{{ workOrder.manager }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">预计交车</span>
          <span class="info-value">{{ workOrder.expectedDelivery }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">创建时间</span>
          <span class="info-value">{{ workOrder.createTime }}</span>
        </div>
      </div>
    </div>

    <!-- 维修项目列表 -->
    <RepariItemList
      :repair-items="repairItems"
      @delete="handleDeleteItem"
      @start="handleStartItem"
      @end="handleEndItem"
      @quality="handleQualityItem"
    />

    <!-- 底部操作按钮 -->
    <div class="card-actions">
      <RepairWorkActions
        :activeTab="activeTab"
        @delete="handleDeleteWork"
        @start="handleStartWork"
        @dispatch="handleDispatch"
      />
    </div>
  </div>
</template>

<script setup>
import RepariItemList from './RepariItemList.vue'
import RepairWorkActions from './RepairWorkActions.vue'

defineProps({
  workOrder: {
    type: Object,
    default: () => ({
      orderNo: '3318938923892839283',
      tag: '外返',
      status: 'pending',
      statusText: '待派工',
      plateNumber: '浙AA12345',
      vehicleModel: 'B10-510激光雷达版 · LFV3H6686RKYM3393',
      owner: '王小虎',
      manager: '王小丫',
      expectedDelivery: '2026-03-20 17:30',
      createTime: '2026-03-02 10:23'
    })
  },
  repairItems: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: 'diapatch'
  }
})

const emit = defineEmits([
  'delete-item',
  'start-item',
  'end-item',
  'quality-item',
  'delete-work',
  'start-work',
  'dispatch'
])

const handleDeleteItem = (item) => {
  emit('delete-item', item)
}

const handleStartItem = (item) => {
  emit('start-item', item)
}

const handleEndItem = (item) => {
  emit('end-item', item)
}

const handleQualityItem = (item) => {
  emit('quality-item', item)
}

const handleDeleteWork = () => {
  emit('delete-work')
}

const handleStartWork = () => {
  emit('start-work')
}

const handleDispatch = () => {
  emit('dispatch')
}
</script>

<style lang="scss" scoped>
.repair-work-card {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  box-sizing: border-box;

  .order-info {
    margin-bottom: 12px;

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 0.5px solid #e6e6e5;

      .order-number-wrapper {
        display: flex;
        align-items: center;
        gap: 2px;

        .order-number {
          /* token: #191A1B */
          color: #191a1b;
          font-family:
            'PingFang SC',
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
        }

        .order-tag {
          /* token: rgba(25, 26, 27, 0.06) */
          background-color: rgba(25, 26, 27, 0.06);

          /* token: #191A1B */
          color: #191a1b;
          font-family:
            'PingFang SC',
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
          font-size: 12px;
          font-weight: 400;
          line-height: 17px;
          padding: 1px 4px;
          border-radius: 4px;
        }
      }

      .order-status {
        font-family:
          'PingFang SC',
          -apple-system,
          BlinkMacSystemFont,
          sans-serif;
        font-size: 12px;
        font-weight: 500;
        line-height: 17px;

        &.status-pending {
          /* token: #C8A12B */
          color: #c8a12b;
        }

        &.status-working {
          /* token: #009100 */
          color: #009100;
        }

        &.status-finished {
          color: #888;
        }
      }
    }

    .vehicle-info {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;

      .plate-number {
        display: flex;
        align-items: center;
        gap: 4px;

        .plate-text {
          /* token: #191A1B */
          color: #191a1b;
          font-family:
            'PingFang SC',
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
          font-size: 16px;
          font-weight: 500;
          line-height: 22px;
        }
      }

      .vehicle-model {
        /* token: #545454 */
        color: #545454;
        font-family:
          'PingFang SC',
          -apple-system,
          BlinkMacSystemFont,
          sans-serif;
        font-size: 12px;
        font-weight: 400;
        line-height: 17px;
      }
    }

    .customer-info {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .info-row {
        display: flex;
        gap: 12px;

        .info-label {
          /* token: #545454 */
          color: #545454;
          font-family:
            'PingFang SC',
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          width: 56px;
          flex-shrink: 0;
        }

        .info-value {
          /* token: #191A1B */
          color: #191a1b;
          font-family:
            'PingFang SC',
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
        }
      }
    }
  }

  .card-actions {
    padding-top: 12px;
  }
}
</style>
