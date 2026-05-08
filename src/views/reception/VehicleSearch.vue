<template>
  <div class="vehicle-search-page">
    <!-- 搜索头部 -->
    <div class="search-header">
      <van-icon name="arrow-left" size="16" color="#191A1B" @click="goBack" />
      <van-search
        v-model="searchValue"
        shape="round"
        :autofocus="true"
        placeholder="请输入车牌号/VIN/车主姓名"
        @search="onSearch"
        class="page-search-input"
      >
        <template #left-icon>
          <van-icon name="search" size="16" color="#191A1B" />
        </template>
        <template #right-icon>
          <div class="search-inner-btn" @click="onSearch(searchValue)">搜索</div>
        </template>
      </van-search>
    </div>

    <div class="search-content">
      <!-- 搜索加载状态 -->
      <div class="search-loading-wrapper" v-if="searchLoading">
        <van-loading type="circular" color="#009100" />
        <span class="loading-text">搜索中...</span>
      </div>

      <!-- 搜索结果列表 -->
      <div class="common-scroll-content" v-else-if="searchResults.length > 0">
        <div
          v-for="item in searchResults"
          :key="item.id"
          class="vehicle-item"
          @click="onSelectVehicle(item)"
        >
          <van-highlight
            :keywords="searchValue"
            :source-string="`${item.plateNo}/${item.vin}/${item.owner}`"
            class="vehicle-text"
          />
          <van-icon name="arrow" size="12" color="#888888" />
        </div>
      </div>

      <!-- 无搜索结果 -->
      <div class="no-results-wrapper" v-else-if="hasSearched">
        <div class="no-results-content">
          <img src="@/assets/image/noList.png" alt="无搜索结果" class="no-results-img" />
          <p class="no-results-text">没有找到相关内容</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalStore } from '@/stores/global'
import { showToast } from 'vant'

const router = useRouter()
const globalStore = useGlobalStore()

// 返回上一页
const goBack = () => {
  router.back()
}

// 搜索状态
const searchValue = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const hasSearched = ref(false)

// 页面加载时
onMounted(async() => {
  globalStore.setTitle('')
})

// 搜索
const onSearch = async(val) => {
  if (!val || !val.trim()) {
    showToast('请输入搜索关键词')
    return
  }

  searchLoading.value = true
  hasSearched.value = true

  try {
    // TODO: 调用实际接口搜索车辆
    // 模拟搜索结果
    await new Promise((resolve) => setTimeout(resolve, 500))
    searchResults.value = [
      {
        id: '1',
        plateNo: '浙AA12345',
        vin: 'LFV3H6686RKYM3393',
        vehicleModel: 'B10-510激光雷达版',
        owner: '王小虎',
        ownerPhone: '13012345678',
        binder: '张小龙',
        binderPhone: '13012341234',
        isAppointment: true,
        warrantyDate: '2026-01-01 至 2029-12-31',
        mileage: '47004',
        battery: '74'
      },
      {
        id: '2',
        plateNo: '浙BB88888',
        vin: 'LFV3H6686RKYM3394',
        vehicleModel: 'C11-510激光雷达版',
        owner: '李四',
        ownerPhone: '13012345679',
        binder: '王五',
        binderPhone: '13012341235',
        isAppointment: false,
        warrantyDate: '2025-01-01 至 2028-12-31',
        mileage: '35000',
        battery: '80'
      }
    ]
  } catch (error) {
    console.error('搜索失败:', error)
    showToast('搜索失败，请稍后重试')
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

// 选择车辆
const onSelectVehicle = (item) => {
  // 跳转到新建施工单页面，并传递车辆信息
  router.push({
    path: '/reception/work-order/create',
    query: {
      vehicleInfo: JSON.stringify(item)
    }
  })
}
</script>

<style lang="scss" scoped>
.vehicle-search-page {
  --safe-area-top: env(safe-area-inset-top, 0px);
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f7f7;
}

// 搜索头部样式
.search-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: calc(44px + var(--safe-area-top));
  padding-top: var(--safe-area-top);
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 7px;
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

.search-content {
  flex: 1;
  padding-top: calc(44px + var(--safe-area-top));
  overflow-y: auto;
}

// 搜索加载状态
.search-loading-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 200px;

  .loading-text {
    font-size: 14px;
    color: #999;
  }
}

// 搜索结果列表
.common-scroll-content {
}

// 车辆搜索结果项样式
.vehicle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 12px;
  background: #ffffff;
  border-bottom: 0.5px solid #e6e6e5;

  .vehicle-text {
    font-size: 14px;
    color: #191a1b;

    // :deep(.van-highlight__mark) {
    //   color: #009100;
    // }
  }
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
  }
}
</style>
