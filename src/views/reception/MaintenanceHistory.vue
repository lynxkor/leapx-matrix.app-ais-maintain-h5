<template>
  <div class="maintenance-history">
    <!-- 车辆信息头部 - 固定在nav bar下面 -->
    <div class="vehicle-header" v-if="vehicleInfo.vin">
      <div class="vin-text">{{ vehicleInfo.vin }}</div>
    </div>

    <!-- 列表内容 -->
    <div class="common-scroll-content" ref="scrollEle">
      <RefreshList
        ref="refreshListRef"
        :requestData="requestData"
        :needRefresh="needRefresh"
        @setData="onSetData"
      >
        <div v-if="list.length > 0" class="list-wrapper">
          <div v-for="item in list" :key="item.id" class="history-card" @click="onCardClick(item)">
            <div class="card-header">
              <span class="order-no">{{ item.serviceProxyCode }}</span>
              <div class="status-wrapper">
                <span class="status-text">已交车</span>
                <van-icon name="arrow" size="12" color="#6C6E6C" />
              </div>
            </div>
            <div class="card-content">
              <div class="info-row">
                <span class="label">服务门店</span>
                <span class="value">{{ item.dealerName }}</span>
              </div>
              <div class="info-row">
                <span class="label">工单时间</span>
                <span class="value">{{ item.orderTime }}</span>
              </div>
              <div class="info-row">
                <span class="label">进店里程</span>
                <span class="value">{{ item.mileage }}</span>
              </div>
              <div class="info-row">
                <span class="label">客户经理</span>
                <span class="value">{{ item.creatorName }}</span>
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
          <!-- loading -->
          <van-overlay :show="popupLoading" class="popup-loading">
            <div class="loading-wrapper">
              <van-loading size="24px" vertical color="#009100">加载中...</van-loading>
            </div>
          </van-overlay>
          <!-- 顶部信息卡片 -->
          <div class="info-card">
            <div class="card-header">
              <span class="order-no">{{ popupData.serviceProxyCode }}</span>
              <span class="status-text">已交车</span>
            </div>
            <div class="card-info-list">
              <div class="info-row">
                <span class="label">服务门店</span>
                <span class="value">{{ popupData.dealerName }}</span>
              </div>
              <div class="info-row">
                <span class="label">工单时间</span>
                <span class="value">{{ popupData.orderTime }}</span>
              </div>
              <div class="info-row">
                <span class="label">进店里程</span>
                <span class="value">{{ popupData.mileage }}km</span>
              </div>
              <div class="info-row">
                <span class="label">客户经理</span>
                <span class="value">{{ popupData.creatorName }}</span>
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
                <span class="item-name">{{ item.repairItemName }}</span>
                <span
                  class="payment-tag"
                  :class="item.checkoutTypeName === '保险' ? 'insurance' : 'self-pay'"
                >
                  {{ item.checkoutTypeName }}
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
                <span class="item-name">{{ item.partsName }}</span>
                <span
                  class="payment-tag"
                  :class="item.checkoutTypeName === '保险' ? 'insurance' : 'self-pay'"
                >
                  {{ item.checkoutTypeName }}
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import RefreshList from '@/libs/components/RefreshList.vue'
import AisPopup from '@/libs/components/AisPopup.vue'
import { getDetail, getHistoryDetail } from '@/api/reception'
import { showToast } from 'vant'

const route = useRoute()
const needRefresh = ref(false)
const refreshListRef = ref(null)

// 车辆信息
const vehicleInfo = reactive({
  vin: '',
  plateNo: '',
  vehicleModel: ''
})

// 弹框控制
const showPopup = ref(false)
const popupLoading = ref(false)
const popupData = reactive({
  serviceProxyCode: '',
  status: '',
  statusDesc: '',
  dealerName: '',
  orderTime: '',
  mileage: '',
  netMileage: '',
  serviceAdvisorName: '',
  repairItems: [],
  repairParts: []
})
const list = ref([])

// 请求详情
const fetchDetail = () => {
  const id = route.query.id
  if (!id) return
}

// RefreshList适配：包装api使其接受对象但内部提取id
const requestData = reactive({
  api: (params) => getDetail(params.id),
  data: { id: route.query.id }
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
// 页面加载时获取详情
onMounted(() => {
  const { vin } = route.query
  if (vin) {
    vehicleInfo.vin = vin
  }
  fetchDetail()
})

// 卡片点击 - 显示弹框
const onCardClick = (item) => {
  popupData.serviceProxyCode = item.code || item.serviceProxyCode || ''
  popupData.status = item.status || ''
  popupData.statusDesc = item.statusDesc || ''
  popupData.dealerName = item.dealerName || ''
  popupData.orderTime = item.createTime || ''
  popupData.mileage = item.mileage || ''
  popupData.netMileage = item.netMileage || ''
  popupData.serviceAdvisorName = item.serviceAdvisorName || ''
  popupData.repairItems = []
  popupData.repairParts = []
  popupData.creatorName = item.creatorName
  showPopup.value = true
  popupLoading.value = true
  getHistoryDetail(item.id)
    .then((res) => {
      if (res.code === 200) {
        popupData.repairItems = res.data?.costCountResp?.repairItemRespList || []
        popupData.repairParts = res.data?.costCountResp?.sparePartRespList || []
      } else {
        showToast(res.msg || '接口异常')
      }
    })
    .finally(() => {
      popupLoading.value = false
    })
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
    padding: 8px 12px;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 1;

    .vin-text {
      font-size: 14px;
      color: #888;
      line-height: 17px;
      text-align: center;
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

  .popup-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    z-index: 1;

    .loading-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  }
}
</style>
