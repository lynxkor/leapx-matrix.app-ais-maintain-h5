<template>
  <div class="repair-work-card">
    <!-- 工单基本信息 -->
    <div class="order-info">
      <!-- 顶部：工单号 + 状态标签 -->
      <div class="order-header">
        <div class="order-number-wrapper">
          <span class="order-number">{{ workOrder.serviceProxyCode }}</span>
          <span class="order-tag">{{ workOrder.haveRework === '1' ? '内返' : '外返' }}</span>
        </div>
        <span class="order-status" :class="getStatusClass(workOrder.orderStatus)">{{
          workOrder.orderStatusLabel
        }}</span>
      </div>

      <!-- 车辆信息 -->
      <div class="vehicle-info">
        <div class="plate-number">
          <span class="plate-text">{{ workOrder.carPlate }}</span>
          <span v-for="item in (workOrder.alarmLevelList || [])" :key="item" :class="{'icon-label':true, 'warn': item === AlarmLevelEnum.WARNING, 'danger': item === AlarmLevelEnum.CRITICAL}"></span>
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
          <span class="info-value">{{ workOrder.serviceAdvisorName }}</span>
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
      :service-proxy-id="workOrder.serviceProxyId"
      :order-no="workOrder.serviceProxyCode"
      :has-fault="hasFault"
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
import { RepairOrderStatusEnum, AlarmLevelEnum } from '../constant'

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
  return props.workOrder.repairWorkRecordList || []
})

// 工单是否存在故障
const hasFault = computed(() => {
  const situation = props.workOrder.currentSituation
  return situation && situation > 10
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
  .icon-label {
    background: url('../../../assets/images/icon_label_20.svg') no-repeat center;
    width: 16px;
    height: 16px;
    &.warn {
      background: url('../../../assets/images/icon_label_30.svg') no-repeat center;
    }
    &.danger {
      background: url('../../../assets/images/icon_label_40.svg') no-repeat center;
    }
  }

  .card-actions {
    padding-top: 12px;
  }
}
</style>
