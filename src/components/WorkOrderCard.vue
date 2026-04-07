<!-- d:\programs\ais\app-ais-maintenance-h5\src\components\WorkOrderCard.vue -->
<template>
  <div @click="onCardClick">
    <!-- 卡片头部 -->
    <div class="card-header">
      <span class="order-no">{{ item.orderNo }}</span>
      <span :class="['status-tag', `status-${item.status}`]">{{ item.statusText }}</span>
    </div>

    <!-- 车辆信息 -->
    <div class="vehicle-info">
      <div class="plate-row">
        <span class="plate-no">{{ item.carPlate || '无车牌' }}</span>
        <div class="tag-list">
          <span v-if="item.alarmLevel == 20" style="height: 20px">
            <img src="@/assets/image/warning-green.png" alt="" />
          </span>
          <span v-if="item.alarmLevel == 30">
            <img src="@/assets/image/warning-yellow.png" alt="" />
          </span>
          <span v-if="item.alarmLevel == 40">
            <img src="@/assets/image/warning-red.png" alt="" />
          </span>
          <span v-if="item.repairItemTypeDetailCollect" class="info-tag">{{
            item.repairItemTypeDetailCollect
          }}</span>
        </div>
      </div>
      <div class="vehicle-model">{{ item.vehModelName }} · {{ item.vehProfileVin }}</div>
    </div>

    <!-- 详细信息 -->
    <div class="detail-info">
      <div class="info-row">
        <span class="label">车主</span>
        <div class="value-wrapper">
          <span class="value">{{ item.customerName }}</span>
          <span v-if="item.isAppointment" class="appointment-tag">预约客户</span>
        </div>
      </div>
      <div class="info-row">
        <span class="label">客户经理</span>
        <span class="value">{{ item.dedicatedServiceManager }}</span>
      </div>
      <div class="info-row">
        <span class="label">预计交车</span>
        <span class="value">{{ item.expectFinishAt }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// 定义 props
const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// 定义 emits
const emit = defineEmits(['click'])

// 卡片点击事件
const onCardClick = () => {
  emit('click', props.item)
}
</script>

<style lang="scss" scoped>
.work-order-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .order-no {
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
    }

    .status-tag {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;

      &.status-pending {
        color: #c8a12b;
      }

      &.status-completed {
        color: #6c6e6c;
      }
    }
  }

  .vehicle-info {
    margin-bottom: 8px;

    .plate-row {
      display: flex;
      align-items: center;
      margin-bottom: 4px;

      .plate-no {
        font-size: 16px;
        font-weight: 500;
        color: #191a1b;
        margin-right: 8px;
      }

      .tag-list {
        display: flex;
        gap: 4px;
        align-items: center;

        .info-tag {
          font-size: 10px;
          padding: 1px 4px;
          height: 20px;
          background: #fff;
          color: #191a1b;
          border: 0.5px solid #191a1b;
          border-radius: 4px;
        }
      }
    }

    .vehicle-model {
      font-size: 12px;
      color: #545454;
    }
  }

  .detail-info {
    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 68px;
        font-size: 14px;
        color: #545454;
        flex-shrink: 0;
      }

      .value-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;

        .value {
          font-size: 14px;
          color: #191a1b;
        }

        .appointment-tag {
          font-size: 10px;
          padding: 1px 4px;
          border-radius: 4px;
          background: #f2f2f2;
          color: #191a1b;
        }
      }

      .value {
        font-size: 14px;
        color: #191a1b;
      }
    }
  }
}
</style>
