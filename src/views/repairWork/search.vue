<template>
  <div class="search-page">
    <!-- 搜索头部 -->
    <div class="search-header">
      <!-- 返回按钮 -->
      <div class="back-btn" @click="handleBack">
        <van-icon name="arrow-left" size="24" color="#191A1B" />
      </div>

      <!-- 搜索输入框 -->
      <div class="search-input-wrapper">
        <div class="search-input-container">
          <van-icon name="search" size="16" color="#191A1B" class="search-icon" />
          <input
            v-model="searchValue"
            type="search"
            class="search-input"
            placeholder="输入施工单号/VIN/车牌/车主"
            placeholder-style="color: #888888;"
            @keyup.enter="handleSearch"
          />
          <!-- 搜索按钮 -->
          <div class="search-btn" @click="handleSearch">
            搜索
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果列表 -->
    <div class="search-result" v-if="hasSearched">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
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
              :active-tab="getTabFromStatus(item.orderStatus)"
              @refresh="onRefresh"
            />
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <Empty v-if="!loading && workOrderList.length === 0" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
import { useGlobalStore } from '@/stores/global'
import { goBack } from '@/libs/utils/app'
import { getRecord } from '../../api/repairWork'
import { RepairOrderStatusEnum, PAGESIZE } from './constant'
import RepairWorkCard from './components/RepairWorkCard.vue'
import Empty from './components/Empty.vue'

const globalStore = useGlobalStore()

// 设置页面标题
globalStore.title = '搜索'

// 搜索相关
const searchValue = ref('')
const hasSearched = ref(false)

// 列表数据
const workOrderList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)

// 根据 orderStatus 推导 activeTab
const getTabFromStatus = (orderStatus) => {
  if (orderStatus <= RepairOrderStatusEnum.PENDING_DISPATCH) return 'dispatch'
  if (orderStatus <= RepairOrderStatusEnum.UNDER_CONSTRUCTION) return 'working'
  return 'inspection'
}

// 返回
const handleBack = () => {
  goBack()
}

// 搜索
const handleSearch = () => {
  const value = searchValue.value.trim()
  if (!value) return

  hasSearched.value = true
  loadData(true)
}

// 加载数据
const loadData = async(isRefresh = false) => {
  if (isRefresh) {
    currentPage.value = 1
    finished.value = false
  }

  loading.value = true

  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: PAGESIZE,
      appSearchKeyWord: searchValue.value.trim(),
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
      orderStatusList: [RepairOrderStatusEnum.PENDING_DISPATCH, RepairOrderStatusEnum.UNDER_CONSTRUCTION, RepairOrderStatusEnum.PENDING_FINAL_INSPECTION]
    }

    const resData = await getRecord(params)
    if (resData.code === 200) {
      const res = resData.data || {}
      const records = res.records || []

      if (isRefresh) {
        workOrderList.value = records
      } else {
        workOrderList.value.push(...records)
      }

      const totalPage = res.totalPage || res.pages || 1
      if (currentPage.value >= totalPage || records.length < PAGESIZE) {
        finished.value = true
      } else {
        currentPage.value++
      }
    } else {
      showToast(resData.message)
      finished.value = true
    }
  } catch (error) {
    console.error('搜索失败:', error)
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
</script>

<style lang="scss" scoped>
.search-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7;
}

.search-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: calc(8px + var(--safe-area-top, env(safe-area-inset-top, 0px))) 12px 8px;
  background-color: #ffffff;
  box-shadow: 0px 0px 4px 0px rgba(57, 61, 58, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.search-input-wrapper {
  flex: 1;
  height: 30px;
}

.search-input-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-left: 8px;
  background-color: rgba(216, 216, 216, 0.3);
  border-radius: 15px;
  gap: 6px;
}

.search-icon {
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--leap-color-default);

  &::placeholder {
    color: var(--leap-color-default-light-2);
  }
}

.search-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 26px;
  background-color: var(--leap-color-primary);
  border-radius: 13px;
  font-size: 12px;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #ffffff;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }
}

.search-result {
  padding: 12px;

  .card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
