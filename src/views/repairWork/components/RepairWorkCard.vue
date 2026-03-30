<template>
  <div class="repair-work-card">
    <!-- 工单基本信息 -->
    <div class="order-info">
      <!-- 顶部：工单号 + 状态标签 -->
      <div class="order-header">
        <div class="order-number-wrapper">
          <span class="order-number">{{ workOrder.code }}</span>
          <span v-if="workOrder.businessTypeLabel" class="order-tag">{{
            workOrder.businessTypeLabel
          }}</span>
        </div>
        <span class="order-status" :class="getStatusClass(workOrder.orderStatus)">{{
          workOrder.orderStatusLabel
        }}</span>
      </div>

      <!-- 车辆信息 -->
      <div class="vehicle-info">
        <div class="plate-number">
          <span class="plate-text">{{ workOrder.carPlate }}</span>
          <van-icon v-if="workOrder.alarmLevel >= 30" name="warning" color="#B91919" size="16" />
        </div>
        <div class="vehicle-model">
          {{ workOrder.vehModelName
          }}<template v-if="workOrder.vehProfileVin"> · {{ workOrder.vehProfileVin }}</template>
        </div>
      </div>

      <!-- 客户信息 -->
      <div class="customer-info">
        <div class="info-row">
          <span class="info-label">车主</span>
          <span class="info-value">{{ workOrder.customerName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">客户经理</span>
          <span class="info-value">{{ workOrder.dedicatedServiceManager }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">预计交车</span>
          <span class="info-value">{{ workOrder.expectFinishAt || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">创建时间</span>
          <span class="info-value">{{ workOrder.createTime }}</span>
        </div>
      </div>
    </div>

    <!-- 维修项目列表 -->
    <RepariItemList
      v-if="repairItems.length > 0"
      :repair-items="repairItems"
      :active-tab="activeTab"
      :service-proxy-id="workOrder.id"
      @refresh="handleRefresh"
    />

    <!-- 底部操作按钮 -->
    <div class="card-actions">
      <RepairWorkActions
        :active-tab="activeTab"
        :work-order="workOrder"
        :repair-items="repairItems"
        @refresh="handleRefresh"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import RepariItemList from './RepariItemList.vue'
import RepairWorkActions from './RepairWorkActions.vue'
import { RepairOrderStatusEnum } from '../constant'

const props = defineProps({
  workOrder: {
    type: Object,
    default: () => ({})
  },
  activeTab: {
    type: String,
    default: 'dispatch'
  }
})

const emit = defineEmits(['refresh'])

// 维修项目列表
const repairItems = computed(() => {
  return props.workOrder.costCountResp?.repairItemRespList || []
})

// 状态样式映射
const getStatusClass = (orderStatus) => {
  if (orderStatus >= RepairOrderStatusEnum.DELIVERED) return 'status-finished'
  if (orderStatus >= RepairOrderStatusEnum.UNDER_CONSTRUCTION) return 'status-working'
  return 'status-pending'
}

const handleRefresh = () => emit('refresh')
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
          color: var(--leap-color-warning);
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
