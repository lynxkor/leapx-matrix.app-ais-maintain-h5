<template>
  <div class="maintenance-history">
    <!-- 车辆信息头部 -->
    <div class="vehicle-header" v-if="vehicleInfo.vin">
      <div class="plate-row">
        <span class="plate-no">{{ vehicleInfo.plateNo }}</span>
      </div>
      <div class="vehicle-model">{{ vehicleInfo.vehicleModel }} · {{ vehicleInfo.vin }}</div>
    </div>

    <!-- 列表内容 -->
    <div class="common-scroll-content" ref="scrollEle">
      <RefreshList :requestData="requestData" :needRefresh="needRefresh" @setData="onSetData">
        <div v-if="list.length > 0" class="list-wrapper">
          <div v-for="item in list" :key="item.id" class="history-card" @click="onCardClick(item)">
            <div class="card-header">
              <span class="order-no">{{ item.orderNo }}</span>
              <div class="status-wrapper">
                <span class="status-text">{{ item.status }}</span>
                <van-icon name="arrow" size="12" color="#6C6E6C" />
              </div>
            </div>
            <div class="card-content">
              <div class="info-row">
                <span class="label">服务门店</span>
                <span class="value">{{ item.serviceStore }}</span>
              </div>
              <div class="info-row">
                <span class="label">工单时间</span>
                <span class="value">{{ item.workOrderTime }}</span>
              </div>
              <div class="info-row">
                <span class="label">进店里程</span>
                <span class="value">{{ item.mileage }}</span>
              </div>
              <div class="info-row">
                <span class="label">客户经理</span>
                <span class="value">{{ item.customerManager }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-list">
          <img src="@/assets/image/noList.png" alt="" />
        </div>
      </RefreshList>
    </div>

    <!-- 维修详情弹框 -->
    <AisPopup v-model:show="showPopup" title="维修详情" style="height: 70%">
      <template #content>
        <div class="popup-content">
          <!-- 顶部信息卡片 -->
          <div class="info-card">
            <div class="card-header">
              <span class="order-no">{{ popupData.orderNo }}</span>
              <span class="status-text">{{ popupData.status }}</span>
            </div>
            <div class="card-info-list">
              <div class="info-row">
                <span class="label">服务门店</span>
                <span class="value">{{ popupData.serviceStore }}</span>
              </div>
              <div class="info-row">
                <span class="label">工单时间</span>
                <span class="value">{{ popupData.workOrderTime }}</span>
              </div>
              <div class="info-row">
                <span class="label">进店里程</span>
                <span class="value">{{ popupData.mileage }}</span>
              </div>
              <div class="info-row">
                <span class="label">客户经理</span>
                <span class="value">{{ popupData.customerManager }}</span>
              </div>
            </div>
          </div>

          <!-- 维修项目 -->
          <div class="section" v-if="popupData.repairItems.length > 0">
            <div class="section-title">维修项目</div>
            <div class="item-list">
              <div
                v-for="(item, index) in popupData.repairItems"
                :key="'repair-' + index"
                class="item-row"
              >
                <span class="item-name">{{ item.name }}</span>
                <span
                  class="payment-tag"
                  :class="item.paymentType === '保险' ? 'insurance' : 'self-pay'"
                >
                  {{ item.paymentType }}
                </span>
              </div>
            </div>
          </div>

          <!-- 维修配件 -->
          <div class="section" v-if="popupData.repairParts.length > 0">
            <div class="section-title">维修配件</div>
            <div class="item-list">
              <div
                v-for="(item, index) in popupData.repairParts"
                :key="'part-' + index"
                class="item-row"
              >
                <span class="item-name">{{ item.name }}</span>
                <span
                  class="payment-tag"
                  :class="item.paymentType === '保险' ? 'insurance' : 'self-pay'"
                >
                  {{ item.paymentType }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </AisPopup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import RefreshList from '@/libs/components/RefreshList.vue'
import AisPopup from '@/libs/components/AisPopup.vue'
import { getMaintenanceHistoryList } from '@/api/workOrder'

const route = useRoute()
const needRefresh = ref(false)

// 车辆信息
const vehicleInfo = reactive({
  vin: '',
  plateNo: '',
  vehicleModel: ''
})

// 列表数据
const list = ref([])

// 弹框控制
const showPopup = ref(false)
const popupData = reactive({
  orderNo: '',
  status: '',
  serviceStore: '',
  workOrderTime: '',
  mileage: '',
  customerManager: '',
  repairItems: [],
  repairParts: []
})

// 请求参数
const requestData = computed(() => ({
  api: getMaintenanceHistoryList,
  data: {
    vin: vehicleInfo.vin,
    pageNum: 1,
    pageSize: 10
  }
}))

// 页面加载时获取车辆信息
onMounted(() => {
  const { vin, plateNo, vehicleModel } = route.query
  if (vin) {
    vehicleInfo.vin = vin
    vehicleInfo.plateNo = plateNo || ''
    vehicleInfo.vehicleModel = vehicleModel || ''
  }
})

// 设置列表数据
const onSetData = (data) => {
  if (data.isRefresh) {
    list.value = data.list
  } else {
    list.value.push(...data.list)
  }
  needRefresh.value = false
}

// 卡片点击 - 显示弹框
const onCardClick = (item) => {
  popupData.orderNo = item.orderNo || ''
  popupData.status = item.status || ''
  popupData.serviceStore = item.serviceStore || ''
  popupData.workOrderTime = item.workOrderTime || ''
  popupData.mileage = item.mileage || ''
  popupData.customerManager = item.customerManager || ''
  popupData.repairItems = item.repairItems || []
  popupData.repairParts = item.repairParts || []
  showPopup.value = true
}
</script>

<style lang="scss" scoped>
.maintenance-history {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f7f7;

  .vehicle-header {
    background: #ffffff;
    padding: 12px;
    flex-shrink: 0;

    .plate-row {
      display: flex;
      align-items: center;
      margin-bottom: 4px;

      .plate-no {
        font-size: 18px;
        font-weight: 600;
        color: #191a1b;
      }
    }

    .vehicle-model {
      font-size: 12px;
      color: #545454;
    }
  }

  .common-scroll-content {
    overflow-y: auto;
    flex: 1;
  }

  .list-wrapper {
    padding: 12px 0;
  }
}

.history-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .order-no {
      font-size: 16px;
      font-weight: 600;
      color: #191a1b;
    }

    .status-wrapper {
      display: flex;
      align-items: center;
      gap: 0;

      .status-text {
        font-size: 12px;
        color: #6c6e6c;
      }
    }
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .info-row {
      display: flex;
      align-items: center;

      .label {
        width: 56px;
        font-size: 14px;
        color: #545454;
        flex-shrink: 0;
      }

      .value {
        font-size: 14px;
        color: #191a1b;
        margin-left: 12px;
      }
    }
  }
}

.no-list {
  height: 45vh;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 200px;
  }
}

.popup-content {
  .info-card {
    background: #ffffff;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .order-no {
        font-size: 16px;
        font-weight: 500;
        color: #191a1b;
      }

      .status-text {
        font-size: 12px;
        color: #6c6e6c;
      }
    }

    .card-info-list {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .info-row {
        display: flex;
        align-items: center;

        .label {
          width: 56px;
          font-size: 14px;
          color: #545454;
          flex-shrink: 0;
        }

        .value {
          font-size: 14px;
          color: #191a1b;
          margin-left: 12px;
        }
      }
    }
  }

  .section {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
      padding: 12px 12px 0;
      background: #ffffff;
      border-radius: 6px 6px 0 0;
    }

    .item-list {
      background: #ffffff;
      border-radius: 0 0 6px 6px;
      padding: 0 12px;

      .item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
        border-bottom: 0.5px solid #e6e6e5;

        &:last-child {
          border-bottom: none;
        }

        .item-name {
          font-size: 14px;
          color: #191a1b;
        }

        .payment-tag {
          font-size: 14px;
          color: #009100;
        }
      }
    }
  }
}
</style>
