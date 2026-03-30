<template>
  <div class="search-page-wrapper">
    <!-- 自定义搜索框头部 -->
    <div class="search-header">
      <van-icon name="arrow-left" size="16" color="#191A1B" @click="goBack" />
      <van-search
        v-model="localSearchValue"
        shape="round"
        :autofocus="true"
        placeholder="搜索"
        @search="onLocalSearch"
        class="page-search-input"
      >
        <template #left-icon>
          <van-icon name="search" size="16" color="#191A1B" />
        </template>
        <template #right-icon>
          <div class="search-inner-btn" @click="onLocalSearch(localSearchValue)">搜索</div>
        </template>
      </van-search>
    </div>

    <div class="search-full-page">
      <!-- 搜索加载状态 -->
      <div class="search-loading-wrapper" v-if="searchLoading">
        <van-loading type="circular" color="#009100" />
        <span class="loading-text">搜索中...</span>
      </div>

      <!-- 搜索结果列表 -->
      <div class="common-scroll-content" v-else-if="searchResults.length > 0">
        <list-item
          v-for="item in searchResults"
          :key="item.id"
          class="work-order-card"
          @click="onCardClick(item)"
        >
          <template #card-info>
            <!-- 卡片头部 -->
            <div class="card-header">
              <span class="order-no">{{ item.orderNo }}</span>
              <span :class="['status-tag', `status-${item.status}`]">{{ item.statusText }}</span>
            </div>

            <!-- 车辆信息 -->
            <div class="vehicle-info">
              <div class="plate-row">
                <span class="plate-no">{{ item.plateNo || '无车牌' }}</span>
                <div class="tag-list">
                  <span>
                    <img src="@/assets/image/warning-red.png" alt="" />
                  </span>
                  <span>
                    <img src="@/assets/image/warning-yellow.png" alt="" />
                  </span>
                  <span style="height: 20px">
                    <img src="@/assets/image/warning-green.png" alt="" />
                  </span>
                  <span v-for="tag in item.tags" :key="tag" class="info-tag">{{ tag }}</span>
                </div>
              </div>
              <div class="vehicle-model">{{ item.vehicleModel }} · {{ item.vin }}</div>
            </div>

            <!-- 详细信息 -->
            <div class="detail-info">
              <div class="info-row">
                <span class="label">车主</span>
                <div class="value-wrapper">
                  <span class="value">{{ item.owner }}</span>
                  <span v-if="item.isAppointment" class="appointment-tag">预约客户</span>
                </div>
              </div>
              <div class="info-row">
                <span class="label">客户经理</span>
                <span class="value">{{ item.manager }}</span>
              </div>
              <div class="info-row">
                <span class="label">预计交车</span>
                <span class="value">{{ item.expectedDelivery }}</span>
              </div>
            </div>
          </template>
        </list-item>
      </div>

      <!-- 无搜索结果 -->
      <div class="no-results-wrapper" v-else-if="hasSearched">
        <div class="no-results-content">
          <img src="../../libs/assets/image/no-data.png" alt="无搜索结果" class="no-results-img" />
          <p class="no-results-text">没有找到相关内容</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalStore } from '@/stores/global'
import { getWorkOrderList } from '@/api/workOrder'
import { showToast } from 'vant'
import ListItem from '@/components/ListItem.vue'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()

// 返回上一页
const goBack = () => {
  router.back()
}

// 本地状态管理
const localSearchValue = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const hasSearched = ref(false)

// 页面加载时
onMounted(async() => {
  globalStore.setTitle('')
})

// 本地搜索框触发搜索
const onLocalSearch = (val) => {
  if (!val || !val.trim()) {
    showToast('请输入搜索关键词')
    return
  }
  handleSearch(val.trim())
}

// 搜索处理
const handleSearch = async(keyword) => {
  if (!keyword) return

  searchLoading.value = true
  searchResults.value = []
  hasSearched.value = true

  try {
    const searchParams = {
      vinLastSix: keyword,
      pageNum: 1,
      pageSize: 100
    }

    const res = await getWorkOrderList({ pageNum: 1, pageSize: 10 })
    if (res.code === 200) {
      searchResults.value = res.data.records || []
    } else {
      searchResults.value = []
    }
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
    showToast('搜索失败，请稍后重试')
  } finally {
    searchLoading.value = false
  }
}

const onCardClick = (item) => {
  router.push({
    name: 'workOrderDetail',
    params: {
      id: item.id
    }
  })
}
</script>

<style lang="scss" scoped>
// 自定义搜索头部样式
.search-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  box-sizing: border-box;
  z-index: 6000;

  :deep(.van-search) {
    padding: 0;
  }

  .page-search-input {
    width: 100%;
    max-width: 375px;
    height: 30px;
    margin-left: 10px;

    :deep(.van-field__right-icon) {
      padding: 0;
    }

    :deep(.van-search__content) {
      background-color: rgba(216, 216, 216, 0.3);
      border-radius: 15px;
      padding-right: 4px;
    }

    :deep(.van-search__field) {
      background-color: transparent;
      min-height: 30px;
    }

    :deep(.van-field__control) {
      font-size: 12px;
      height: 30px;
      line-height: 30px;
    }

    :deep(.van-field__left-icon) {
      align-self: center;
    }

    .search-inner-btn {
      background-color: #009100;
      color: #ffffff;
      height: 26px;
      width: 52px;
      font-size: 12px;
      font-weight: 400;
      border-radius: 15px;
      padding: 4px 14px;
      white-space: nowrap;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 15px;
    }
  }
}

.search-full-page {
  width: 100%;
  min-height: 100%;
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
  padding-top: 44px;
}

// 搜索加载状态
.search-loading-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  .loading-text {
    font-size: 14px;
    color: #999;
  }
}

// 搜索结果列表 - 与 ListView.vue 一致
.common-scroll-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

// 无搜索结果
.no-results-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;

  .no-results-content {
    text-align: center;

    .no-results-img {
      width: 230px;
      height: 142px;
      margin-bottom: 16px;
      margin-top: 228px;
    }

    .no-results-text {
      font-size: 16px;
      color: #666;
      margin-bottom: 8px;
    }

    .no-results-desc {
      font-size: 14px;
      color: #6c6e6c;
    }
  }
}

.work-order-card {
  background: #ffffff;
  border-radius: 8px;
  margin-top: 12px;
  padding: 12px;
  box-shadow: 0px 0px 4px 0px rgba(57, 61, 58, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    border-bottom: 1px solid #e6e6e5;
    padding-bottom: 9px;
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
          background: rgba(25, 26, 27, 0.06);
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
