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

const props = defineProps({
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

// 维修项目操作
const handleDeleteItem = (item) => {
  console.log('删除维修项目:', props.workOrder, item)
}

const handleStartItem = (item) => {
  console.log('开始维修项目:', props.workOrder, item)
}

const handleEndItem = (item) => {
  console.log('结束维修项目:', props.workOrder, item)
}

const handleQualityItem = (item) => {
  console.log('质检维修项目:', props.workOrder, item)
}

// 工单操作
const handleDeleteWork = () => {
  console.log('删除工单:', props.workOrder)
}

const handleStartWork = () => {
  console.log('开始工单:', props.workOrder)
}

const handleDispatch = () => {
  console.log('派工:', props.workOrder)
  // TODO: 打开派工弹窗
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
      border-bottom: 0.5px solid var(--leap-color-default-light-4);

      .order-number-wrapper {
        display: flex;
        align-items: center;
        gap: 2px;

        .order-number {
          color: var(--leap-color-default);
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
          background-color: rgba(25, 26, 27, 0.06);
          color: var(--leap-color-default);
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
          color: var(--leap-color-warning);
        }

        &.status-working {
          color: var(--leap-color-primary);
        }

        &.status-finished {
          color: var(--leap-color-default-light-2);
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
          color: var(--leap-color-default);
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
          color: var(--leap-color-default);
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
