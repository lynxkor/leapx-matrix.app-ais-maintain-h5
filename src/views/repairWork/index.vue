<template>
  <div class="repair-work-page">
    <!-- 顶部标签页 -->
    <van-sticky :offset-top="navBarOffsetTop">
      <van-tabs v-model:active="activeTab" class="work-tabs">
        <van-tab title="派工" name="dispatch" />
        <van-tab title="施工" name="working" />
        <van-tab title="终检" name="inspection" />
      </van-tabs>
      <!-- 筛选条件 + 搜索 -->
      <div class="filter-bar">
        <div class="filter-tabs">
          <div
            v-for="filter in filters"
            :key="filter.value"
            class="filter-tab"
            :class="{ active: activeFilter === filter.value }"
            @click="handleFilterChange(filter.value)"
          >
            {{ filter.label }}
          </div>
        </div>
        <div class="search-box" @click="handleSearch">
          <van-icon name="search" size="16" color="#191A1B" />
          <span class="search-text">搜索</span>
        </div>
      </div>
    </van-sticky>

    <!-- 下拉刷新 + 列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="refresh-container">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="workOrderList.length > 0 ? '没有更多了' : ''"
        @load="onLoad"
      >
        <div class="card-list">
          <RepairWorkCard
            v-for="item in workOrderList"
            :key="item.serviceProxyId"
            :work-order="item"
            :active-tab="activeTab"
            @refresh="onRefresh"
          />
        </div>

        <!-- 空状态 -->
        <Empty v-if="!loading && workOrderList.length === 0" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import RepairWorkCard from './components/RepairWorkCard.vue'
import Empty from './components/Empty.vue'
import { getRecord } from '../../api/repairWork'
import { TabStatusMap, PAGESIZE } from './constant'
import { formatDateTime } from '@/libs/utils'
import { usePageSafeArea } from '@/utils/safeArea'

const router = useRouter()
const { navBarOffsetTop } = usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })

// 标签页
const activeTab = ref('dispatch')

// 筛选条件
const filters = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '7天内', value: 'week' },
  { label: '我的', value: 'mine' }
]
const activeFilter = ref('all')
import { useUserStore } from '@/stores/user'

// 列表数据
const workOrderList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)

// 根据筛选条件获取额外参数
const getFilterParams = (filterValue) => {
  const now = new Date()
  if (filterValue === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    return {
      createTimeStart: formatDateTime(start),
      createTimeEnd: formatDateTime(end)
    }
  }
  if (filterValue === 'week') {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    end.setHours(23, 59, 59, 999)
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    start.setHours(0, 0, 0, 0)
    return {
      createTimeStart: formatDateTime(start),
      createTimeEnd: formatDateTime(end)
    }
  }
  if (filterValue === 'mine') {
    const userStore = useUserStore()
    return { repairTechnicianId: userStore.userId }
  }
  return {}
}

// 加载数据
const loadData = async(isRefresh = false) => {
  if (isRefresh) {
    currentPage.value = 1
    finished.value = false
  }

  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: PAGESIZE,
      orderStatusList: [TabStatusMap[activeTab.value]],
      itemFlag: 1,
      sortColumns: [
        {
          column: 'create_time',
          sort: 'DESC'
        }
      ],
      ...getFilterParams(activeFilter.value)
    }

    const res = await getRecord(params)
    if (res.code === 200) {
      const data = res.data || {}
      const records = data.records || []
      if (isRefresh) {
        workOrderList.value = records
      } else {
        workOrderList.value.push(...records)
      }

      // 判断是否还有更多数据
      const totalPage = data.totalPage || data.pages || 1
      if (currentPage.value >= totalPage || records.length < PAGESIZE) {
        finished.value = true
      } else {
        currentPage.value++
      }
    } else {
      showToast(res.message)
      finished.value = true
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  loadData(true)
}

// 上拉加载
const onLoad = () => {
  if (!refreshing.value) {
    loading.value = true
    loadData()
  }
}

// 切换筛选
const handleFilterChange = (value) => {
  activeFilter.value = value
  onRefresh()
}

// 搜索
const handleSearch = () => {
  router.push({ path: '/repairWork/search', query: { tab: activeTab.value }})
}

// 监听标签页切换
watch(activeTab, () => {
  onRefresh()
})
</script>

<style lang="scss" scoped>
.repair-work-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
  height: 100%;

  :deep(.work-tabs) {
    .van-tab {
      font-size: 14px;
      font-weight: 500;
      color: #545454;

      &.van-tab--active {
        color: var(--leap-color-primary);
        .van-tab__text {
          font-weight: 500;
        }
      }
    }

    .van-tabs__line {
      background-color: var(--leap-color-primary);
      height: 2px;
      border-radius: 2px;
    }
  }

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: #fff;
    flex-shrink: 0;

    .filter-tabs {
      display: flex;
      gap: 8px;

      .filter-tab {
        height: 30px;
        padding: 2px 16px;
        background-color: var(--leap-color-default-light-5);
        border: 1px solid var(--leap-color-default-light-5);
        border-radius: 4px;
        font-family:
          'PingFang SC',
          -apple-system,
          BlinkMacSystemFont,
          sans-serif;
        font-size: 12px;
        font-weight: 400;
        line-height: 24px;
        color: var(--leap-color-default);
        cursor: pointer;
        transition: all 0.3s;

        &.active {
          background-color: transparent;
          border: 1px solid var(--leap-color-primary);
          color: var(--leap-color-primary);
        }
      }
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 30px;
      padding: 0 12px 0 8px;
      background-color: var(--leap-color-default-light-5);
      border-radius: 80px;
      cursor: pointer;

      .search-text {
        font-family:
          'PingFang SC',
          -apple-system,
          BlinkMacSystemFont,
          sans-serif;
        font-size: 12px;
        font-weight: 400;
        line-height: 20px;
        color: var(--leap-color-default);
      }
    }
  }

  .refresh-container {
    flex: 1;
    overflow-y: auto;
    padding: 12px;

    .card-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>
