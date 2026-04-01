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
              <span class="order-no">{{ item.settlementNo }}</span>
              <span class="status-tag" :class="getStatusClass(item.status)">
                {{ getStatusText(item.status) }}
              </span>
            </div>
          </template>

          <template #card-info>
            <van-row class="card-info">
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">工单号</span>
                <span class="card-info-des">{{ item.workOrderNo }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">VIN</span>
                <span class="card-info-des">{{ item.vin }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">门店</span>
                <span class="card-info-des">{{ item.storeName }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">金额</span>
                <span class="card-info-des price">¥{{ formatPrice(item.settlementAmount) }}</span>
              </van-col>
            </van-row>
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

// 模拟数据
const mockData = [
  {
    id: 1,
    settlementNo: 'JS-260401141948383401',
    status: 'pending',
    workOrderNo: 'WO-20250401001',
    vin: 'LFV3H6686RKYM3393',
    storeName: '杭州服务中心芯图大厦店',
    settlementAmount: 2580.50
  },
  {
    id: 2,
    settlementNo: 'JS-260401141948383402',
    status: 'completed',
    workOrderNo: 'WO-20250401002',
    vin: 'LFV3H6686RKYM3394',
    storeName: '上海浦东服务中心',
    settlementAmount: 3850.00
  }
]

// requestData 配置
const requestData = reactive({
  data: {
    keyWord: '',
    pageNum: 1,
    pageSize: 10
  },
  api: () => Promise.resolve({ code: 200, data: mockData })
})

// 监听搜索值变化
watch(searchValue, (newVal) => {
  if (newVal) {
    requestData.data.keyWord = newVal
    requestData.data.pageNum = 1
  }
})

// 格式化金额
const formatPrice = (price) => {
  if (typeof price !== 'number') return '0.00'
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待结算',
    processing: '结算中',
    completed: '已结算',
    rejected: '已驳回'
  }
  return statusMap[status] || '未知'
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    pending: 'status-orange',
    processing: 'status-blue',
    completed: 'status-green',
    rejected: 'status-red'
  }
  return classMap[status] || ''
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
  requestData.data.keyWord = searchValue.value.trim()
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
  router.push(`/settlement-statement/${item.id}`)
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
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .order-no {
        font-family: 'PingFang SC';
        font-size: 16px;
        font-weight: 500;
        color: #191a1b;
      }

      .status-tag {
        font-family: 'PingFang SC';
        font-size: 12px;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: 4px;

        &.status-orange {
          color: #ff6b00;
          background: rgba(255, 107, 0, 0.1);
        }

        &.status-blue {
          color: #2261dd;
          background: rgba(34, 97, 221, 0.1);
        }

        &.status-green {
          color: #009100;
          background: rgba(0, 145, 0, 0.1);
        }

        &.status-red {
          color: #ee0a24;
          background: rgba(238, 10, 36, 0.1);
        }
      }
    }

    .card-info {
      margin-top: 8px;

      .card-info-col {
        font-family: 'PingFang SC';
        font-size: 14px;
        padding: 4px 0;
        display: flex;
        gap: 12px;

        .card-info-title {
          color: #545454;
          width: 60px;
          flex-shrink: 0;
        }

        .card-info-des {
          color: #191a1b;
          flex: 1;

          &.price {
            color: #ff6b00;
            font-weight: 500;
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
