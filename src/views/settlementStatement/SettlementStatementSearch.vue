<template>
  <div class="settlement-search">
    <!-- 自定义搜索头部 -->
    <div class="search-header">
      <!-- 返回箭头 -->
      <div class="back-btn" @click="handleCancel">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15.5 19L8 12L15.5 5" stroke="#191A1B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- 搜索框 -->
      <div class="search-input-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="#999" stroke-width="1.3"/>
          <path d="M11 11L14 14" stroke="#999" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchValue"
          class="search-input"
          placeholder="请输入工单号/车牌号/VIN"
          @search="handleSearch"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- 搜索按钮 -->
      <div class="search-btn" @click="handleSearch">搜索</div>
    </div>

    <!-- 搜索历史 -->
    <div v-if="!searchValue && searchHistory.length" class="search-section">
      <div class="section-header">
        <span class="section-title">搜索历史</span>
        <van-icon name="delete-o" @click="clearHistory" />
      </div>
      <div class="history-list">
        <span
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-tag"
          @click="handleHistoryClick(item)"
        >
          {{ item }}
        </span>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchValue" class="search-result">
      <RefreshList
        :requestData="requestData"
        :has-no-data="resultList.length === 0"
        @setData="setData"
      >
        <ListItem
          v-for="item in resultList"
          :key="item.id"
          @click="goToDetail(item)"
          class="result-item"
        >
          <template #header>
            <div class="item-header">
              <span class="order-no">{{ item.code }}</span>
              <span class="status-tag" :class="getStatusClass(item.orderStatus)">
                {{ item.orderStatusLabel }}
              </span>
            </div>
          </template>

          <template #card-info>
            <div class="card-body">
              <!-- 车牌行 -->
              <div class="plate-row">
                <span class="plate-number">{{ item.carPlate }}</span>
                <!-- 预警图标 - 根据 alarmLevel 显示不同颜色: 10=绿色, 20=橙色, 30=红色 -->
                <svg
                  v-if="item.alarmLevel"
                  class="vehicle-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 15.35 13.88"
                  fill="none"
                >
                  <path :fill="getAlarmColor(item.alarmLevel)" d="M7.3351851 0C7.9718513 0 8.5651855 0.31133342 8.9285183 0.83133328L8.998518 0.93799996L14.407852 9.9700003C15.123848 11.210074 14.297827 12.772247 12.869853 12.878666L12.739853 12.883999L1.9231861 12.883999C0.49417353 12.867918 -0.42892668 11.36636 0.20185265 10.083999L0.26785263 9.9606657L5.6745195 0.93533206C6.0265875 0.35477138 6.6562138 0.00014813742 7.3351851 0ZM7.3418517 8.8866673L7.257185 8.8913336C6.9218178 8.9312248 6.6692615 9.2156019 6.6692615 9.5533333C6.6692615 9.8910656 6.9218178 10.175444 7.257185 10.215334L7.3351851 10.22L7.4198513 10.215334C7.7552185 10.175442 8.0077753 9.8910656 8.0077753 9.5533333C8.0077753 9.2156019 7.7552185 8.9312248 7.4198513 8.8913336L7.3418517 8.8866673ZM7.3351851 4.2200003C6.9972014 4.2200446 6.7127285 4.4730048 6.6731849 4.8086672L6.6685181 4.8866668L6.6685181 7.5533333L6.6731849 7.6313334C6.7130756 7.9667006 6.9974532 8.2192574 7.3351851 8.2192574C7.6729164 8.2192574 7.957294 7.9667006 7.9971848 7.6313334L8.001852 7.5533333L8.001852 4.8866668L7.9971848 4.8086672C7.9576411 4.4730048 7.6731682 4.2200446 7.3351851 4.2200003Z"/>
                </svg>
                <!-- 业务类型标签 -->
                <span v-if="item.warrantyTypeCollect" class="svc-tag">{{ item.warrantyTypeCollect }}</span>
              </div>

              <!-- VIN -->
              <div class="vehicle-line">
                {{ item.vehProfileVin }}
              </div>

              <!-- 信息行 -->
              <div class="info-rows">
                <div class="info-row">
                  <span class="info-label">车主</span>
                  <div class="info-value-wrap">
                    <span class="info-value">{{ item.customerName }}</span>
                  </div>
                </div>
                <div class="info-row">
                  <span class="info-label">客户经理</span>
                  <span class="info-value">{{ item.serviceOwnerName }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">开单时间</span>
                  <span class="info-value">{{ item.createTime }}</span>
                </div>
              </div>
            </div>
          </template>
        </ListItem>

        <!-- 空状态 -->
        <template #empty>
          <div class="empty-state">
            <img class="empty-image" src="@/libs/assets/image/no-data.png" alt="没有数据" />
            <p class="empty-text">未找到相关内容</p>
          </div>
        </template>
      </RefreshList>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import RefreshList from '@/libs/components/RefreshList.vue'
import ListItem from '@/components/ListItem.vue'
import { getSettlementStatementPage } from '@/api/settlementStatement'

const router = useRouter()
const route = useRoute()

// 搜索值
const searchValue = ref('')
const resultList = ref([])

// 从本地存储获取搜索历史
const searchHistory = ref([])
try {
  const history = localStorage.getItem('settlement_search_history')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
} catch (e) {
  console.error('读取搜索历史失败', e)
}

// 状态映射：从路由参数获取tab状态
const statusMap = {
  pending: '160', // 待交车
  completed: '180' // 已交车
}

// 从路由获取当前tab状态，默认为pending
const currentTab = ref(route.query.tab || 'pending')

// requestData 配置
const requestData = reactive({
  data: {
    appSearchKeyWord: '',
    pageNum: 1,
    pageSize: 10,
    orderStatus: statusMap[currentTab.value]
  },
  api: getSettlementStatementPage
})

// 监听搜索值变化
watch(searchValue, (newVal) => {
  if (newVal) {
    requestData.data.appSearchKeyWord = newVal
    requestData.data.pageNum = 1
  }
})

// 格式化金额
const formatPrice = (price) => {
  if (typeof price !== 'number' || !price) return '0.00'
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取状态样式类
const getStatusClass = (status) => {
  // 根据orderStatus返回对应样式
  if (status === 160) return 'status-orange'
  if (status === 180) return 'status-green'
  return 'status-gray'
}

// 根据预警等级返回对应颜色
const getAlarmColor = (alarmLevel) => {
  const colorMap = {
    '10': '#009100', // 绿色
    '20': '#C8A12B', // 橙色
    '30': '#B91919' // 红色
  }
  return colorMap[alarmLevel] || '#009100'
}

// 保存搜索历史
const saveSearchHistory = (keyword) => {
  if (!keyword) return
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  searchHistory.value.unshift(keyword)
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  try {
    localStorage.setItem('settlement_search_history', JSON.stringify(searchHistory.value))
  } catch (e) {
    console.error('保存搜索历史失败', e)
  }
}

// 处理搜索
const handleSearch = () => {
  if (!searchValue.value.trim()) {
    showToast('请输入搜索关键词')
    return
  }
  saveSearchHistory(searchValue.value.trim())
  requestData.data.appSearchKeyWord = searchValue.value.trim()
  requestData.data.pageNum = 1
}

// 处理清除
const handleClear = () => {
  searchValue.value = ''
  resultList.value = []
}

// 处理取消
const handleCancel = () => {
  router.back()
}

// 处理历史点击
const handleHistoryClick = (item) => {
  searchValue.value = item
  handleSearch()
}

// 清除历史
const clearHistory = () => {
  searchHistory.value = []
  try {
    localStorage.removeItem('settlement_search_history')
  } catch (e) {
    console.error('清除搜索历史失败', e)
  }
}

// 设置数据
const setData = (res) => {
  const list = Array.isArray(res.list) ? res.list : []
  if (res.isRefresh) {
    resultList.value = [...list]
  } else {
    resultList.value.push(...list)
  }
}

// 跳转到详情
const goToDetail = (item) => {
  // 待交车状态：不跳转（搜索页主要用于搜索，结算操作回到列表页进行）
  // 已交车状态：跳转到售后结算单详情页
  if (currentTab.value === 'completed') {
    router.push({
      path: '/settlement-statement/after-sales',
      query: { id: item.id }
    })
  }
}

// 初始化
if (route.params.initialValue) {
  searchValue.value = route.params.initialValue
  handleSearch()
}
</script>

<style lang="scss" scoped>
.settlement-search {
  min-height: 100vh;
  background-color: #f5f5f5;

  .search-header {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #fff;
    gap: 8px;

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      cursor: pointer;
    }

    .search-input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: 30px;
      background: rgba(216, 216, 216, 0.3);
      border-radius: 15px;
      gap: 8px;

      .search-icon {
        flex-shrink: 0;
      }

      .search-input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
        line-height: 1;

        &::placeholder {
          color: #999;
        }
      }
    }

    .search-btn {
      padding: 0 16px;
      height: 26px;
      background: #009100;
      border-radius: 13px;
      font-family: 'PingFang SC';
      font-size: 12px;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      cursor: pointer;
    }
  }

  .search-section {
    padding: 16px;
    background: #fff;
    margin-bottom: 12px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .section-title {
        font-size: 14px;
        color: #999;
      }

      .van-icon {
        font-size: 16px;
        color: #999;
      }
    }

    .history-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .history-tag {
        padding: 6px 12px;
        background: #f5f5f5;
        border-radius: 16px;
        font-size: 13px;
        color: #666;
      }
    }
  }

  .search-result {
    padding: 12px;

    .result-item {
      margin-bottom: 12px;
      background: #ffffff;
      border-radius: 6px;
      padding: 12px;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-bottom: 8px;
      border-bottom: 0.5px solid #e6e6e5;

      .order-no {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
      }

      .status-tag {
        font-family: 'PingFang SC';
        font-size: 12px;
        font-weight: 500;

        &.status-orange {
          color: #c8a12b;
        }

        &.status-green {
          color: #009100;
        }

        &.status-gray {
          color: #999999;
        }
      }
    }

    .card-body {
      padding-top: 8px;

      .plate-row {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 2px;
        flex-wrap: nowrap;
        overflow: visible;

        .plate-number {
          font-family: 'PingFang SC';
          font-size: 16px;
          font-weight: 500;
          color: #191a1b;
          white-space: nowrap;
        }

        .vehicle-icon {
          width: 16px;
          height: 16px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .svc-tag {
          padding: 1px 4px;
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #191a1b;
          background: #ffffff;
          border: 0.5px solid #191a1b;
          border-radius: 4px;
          flex-shrink: 0;
          white-space: nowrap;
          margin-left: 12px;
        }
      }

      .vehicle-line {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
        margin-bottom: 8px;
      }

      .info-rows {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;

          .info-label {
            color: #545454;
            width: 56px;
            flex-shrink: 0;
          }

          .info-value-wrap {
            display: flex;
            align-items: center;
            gap: 4px;
            flex: 1;
          }

          .info-value {
            color: #191a1b;
          }
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 0;

      .empty-image {
        width: 200px;
        height: 120px;
        margin-bottom: 16px;
      }

      .empty-text {
        font-size: 14px;
        color: #999;
      }
    }
  }
}
</style>
