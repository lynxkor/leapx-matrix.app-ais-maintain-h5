<template>
  <div class="search-page-wrapper">
    <!-- 自定义搜索框头部 -->
    <div class="search-header">
      <van-icon name="arrow-left" size="16" color="#191A1B" @click="goBack" />
      <van-search
        v-model="appSearchKeyWord"
        shape="round"
        :autofocus="true"
        placeholder="输入VIN/车牌号"
        @update:model-value="onInputChange"
        @search="onLocalSearch"
        class="page-search-input"
      >
        <template #left-icon>
          <van-icon name="search" size="16" color="#191A1B" />
        </template>
        <template #right-icon>
          <div class="search-inner-btn" @click="onLocalSearch(appSearchKeyWord)">搜索</div>
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
        <div
          v-for="item in searchResults"
          :key="item.id"
          class="search-result-item"
          @click="onCardClick(item)"
        >
          <span class="result-text" v-html="highlightKeyword(getResultText(item))"></span>
          <van-icon name="arrow" size="16" color="#888888" />
        </div>
      </div>

      <!-- 无搜索结果 -->
      <div class="no-results-wrapper" v-else-if="hasSearched">
        <div class="no-results-content">
          <img src="@/assets/image/noList.png" alt="无搜索结果" class="no-results-img" />
          <!-- <p class="no-results-text">没有找到相关内容</p> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalStore } from '@/stores/global'
import { getVehicleInfo } from '@/api/reception'
import { showToast } from 'vant'
import { usePageSafeArea } from '@/utils/safeArea'
// 列表项显示文本：车牌号/VIN/姓名
const getResultText = (item) => {
  const plateNo = item.vehiclePlateNo || '无车牌'
  const vin = item.vin || ''
  const name = item.vehicleProfileOwnerResp.ownerName || ''
  return `${plateNo}/${vin}/${name}`
}

// 高亮匹配字符（绿色）
const highlightKeyword = (text) => {
  if (!appSearchKeyWord.value) return text
  const keyword = appSearchKeyWord.value.trim()
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<span style="color:#009100">$1</span>')
}

const router = useRouter()
const globalStore = useGlobalStore()
usePageSafeArea()

// 返回上一页
const goBack = () => {
  router.back()
}

// 本地状态管理
const appSearchKeyWord = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const hasSearched = ref(false)

// 页面加载时
onMounted(async() => {
  globalStore.setTitle('')
})

const onInputChange = (val) => {
  const trimmedVal = val?.trim() || ''
  handleSearch(trimmedVal)
}

// 本地搜索框触发搜索
const onLocalSearch = (val) => {
  const trimmedVal = val?.trim() || ''
  if (!trimmedVal) {
    showToast('请输入搜索关键词')
    return
  }
  handleSearch(trimmedVal)
}

// 搜索处理
const handleSearch = async(keyword) => {
  if (!keyword) return

  searchLoading.value = true
  searchResults.value = []
  hasSearched.value = true

  try {
    const res = await getVehicleInfo({
      searchVin: keyword
    })
    if (res.code === 200) {
      searchResults.value = res.data || []
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
  // 使用 params 传递整个 item 对象// 将车辆信息存到sessionStorage
  sessionStorage.setItem('vehicleInfo', JSON.stringify(item))
  // 跳转到新建施工单页面
  router.push({
    name: 'workOrderCreate',
    query: {
      id: item.id
    }
    // params: {
    //   vehicleInfo: JSON.stringify(item)
    // }
  })
}
</script>

<style lang="scss" scoped>
.search-page-wrapper {
  --search-header-height: 44px;
  --safe-area-top: var(--page-safe-area-top, env(safe-area-inset-top, 0px));
  min-height: 100%;
}

// 自定义搜索头部样式
.search-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: calc(var(--search-header-height) + var(--safe-area-top));
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

.search-full-page {
  width: 100%;
  min-height: 100%;
  // background-color: #ffffff;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-top: calc(var(--search-header-height) + var(--safe-area-top));
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

// 搜索结果列表
.common-scroll-content {
  flex: 1;
  overflow-y: auto;
}

// 无搜索结果
.no-results-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;

  .no-results-content {

    .no-results-img {
      width: 230px;
      height: 180px;
      margin-bottom: 16px;
    }

    .no-results-text {
      font-size: 14px;
      color: #6C6E6C;
      margin-bottom: 8px;
    }

    .no-results-desc {
      font-size: 14px;
      color: #6c6e6c;
    }
  }
}

// 搜索结果列表项（设计图样式）
.search-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  background: #ffffff;
  border-bottom: 0.5px solid #e6e6e5;
  padding: 0 12px;
  cursor: pointer;

  .result-text {
    font-size: 14px;
    color: #191a1b;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
