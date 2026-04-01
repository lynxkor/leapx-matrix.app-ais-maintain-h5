<template>
  <div class="repair-work-page">
    <!-- 顶部标签页 -->
     <van-sticky offset-top="44">
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
            :key="item.id"
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
import RepairWorkCard from './components/RepairWorkCard.vue'
import Empty from './components/Empty.vue'
import { getList } from '../../api/repairWork'
import { TabStatusMap, PAGESIZE } from './constant'
import { formatDateTime } from '@/libs/utils'

const router = useRouter()

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
    return { mineFlag: 1 }
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
      orderStatus: TabStatusMap[activeTab.value],
      itemFlag: 1,
      sortColumns: [
        {
          'column': 'order_status',
          'sort': 'ASC'
        },
        {
          'column': 'create_time',
          'sort': 'DESC'
        }
      ],
      ...getFilterParams(activeFilter.value)
    }

    const resData = await getList(params)
    const res = resData.data || {}
    const records = res.records || []
    if (isRefresh) {
      workOrderList.value = records
    } else {
      workOrderList.value.push(...records)
    }

    // 判断是否还有更多数据
    const totalPage = res.totalPage || res.pages || 1
    if (currentPage.value >= totalPage || records.length < PAGESIZE) {
      finished.value = true
    } else {
      currentPage.value++
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
  router.push('/repairWork/search')
}

// 监听标签页切换
watch(activeTab, () => {
  onRefresh()
})
</script>

<style lang="scss" scoped>
.repair-work-page {
  background-color: #f5f5f5;

  :deep(.work-tabs) {
    .van-tab {
      font-size: 14px;
      font-weight: 500;
      color: #545454;

      &.van-tab--active {
        color: var(--leap-color-primary);
        font-weight: 600;
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
    position: sticky;
    top: 44px;
    z-index: 99;

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
    min-height: calc(100vh - 140px);
    padding: 12px;

    .card-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>
