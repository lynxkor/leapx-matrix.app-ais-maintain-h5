<template>
  <div class="search-page-wrapper">
    <!-- 自定义搜索框头部 -->
    <div class="search-header">
      <van-icon name="arrow-left" size="16" color="#191A1B" @click="goBack" />
      <van-search
        v-model="localSearchValue"
        shape="round"
        :autofocus="true"
        placeholder="输入预授权单号/预警信息/门店名称"
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
        <ListItem v-for="item in searchResults" :key="item.id" @click="goToDetail(item)">
          <template #header>
            <div class="item-header">
              <span class="order-no">{{ item.code }}</span>
              <span class="status-tag" :class="getStatusClass(item.approvalStatusLabel)">
                {{ item.approvalStatusLabel }}
              </span>
            </div>
          </template>

          <template #card-info>
            <van-row class="card-info">
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">VIN</span>
                <span class="card-info-des">{{ item.vehProfileVin }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">门店名称</span>
                <span class="card-info-des">{{ item.dealerName }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">保修时间</span>
                <span class="card-info-des"
                  >{{ item.guaranteeStartDate }} - {{ item.warrantyEndTime }}</span
                >
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">进店里程</span>
                <span class="card-info-des">{{ item.mileage }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">创建时间</span>
                <span class="card-info-des">{{ item.createTime }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">创建人</span>
                <span class="card-info-des">{{ item.creatorName }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">预计交车时间</span>
                <span class="card-info-des">{{ item.estimateDeliverTime }}</span>
              </van-col>
            </van-row>
          </template>

          <template #btn-content>
            <ais-button type="primary" round size="large" plain @click.stop="handleContact(item)">
              联系创建人
            </ais-button>
          </template>
        </ListItem>
        <!-- 没有更多了提示 -->
        <div class="no-more-tip">没有更多了</div>
      </div>

      <!-- 无搜索结果 -->
      <div class="no-results-wrapper" v-else-if="hasSearched">
        <div class="no-results-content">
          <img src="@/libs/assets/image/no-data.png" alt="无搜索结果" class="no-results-img" />
          <p class="no-results-text">没有找到相关内容</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import ListItem from '@/components/ListItem.vue'
import AisButton from '@/components/AisButton.vue'
import { preAuthList } from '@/api/authorization'
import { callPhone } from '@/libs/utils/nativeFn'
import { usePageSafeArea } from '@/utils/safeArea'

const router = useRouter()

usePageSafeArea()

// 返回上一页
const goBack = () => {
  router.back()
}

// 本地状态管理
const localSearchValue = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const hasSearched = ref(false)

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
    const res = await preAuthList({
      appSearchKeyWord: keyword,
      pageNum: 1,
      pageSize: 20
    })
    // 处理接口返回的数据结构
    searchResults.value = res?.data || []
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
    showToast('搜索失败，请稍后重试')
  } finally {
    searchLoading.value = false
  }
}

const getStatusClass = (label) => {
  if (!label) return ''
  if (label === '未提交') return 'status-blue'
  if (label === '审核中') return 'status-yellow'
  if (label === '审核通过') return 'status-green'
  if (label === '已驳回' || label === '已拒绝') return 'status-red'
  return ''
}

const handleContact = (item) => {
  const phone = item.creatorMobile
  if (phone) {
    callPhone(phone)
  } else {
    showToast('暂无联系电话')
  }
}

const goToDetail = (item) => {
  router.push(`/pre-authorization/detail/${item.id}`)
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
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 7px;
  box-sizing: border-box;
  z-index: 6000;

  :deep(.van-search) {
    padding: 0;
  }

  .page-search-input {
    flex: 1;
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
    }
  }
}

.search-full-page {
  width: 100%;
  min-height: 100%;
  background-color: #f7f7f7;
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
  padding: 12px 12px 0 12px;

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
    }
  }

  .card-info {
    box-sizing: border-box;
    margin-top: 6px;
    padding-bottom: 6px;

    .card-info-col {
      font-family: 'PingFang SC';
      font-size: 14px;
      padding: 6px 12px 0 0;
      display: flex;
      gap: 12px;

      .card-info-title {
        color: #545454;
        width: 90px;
        flex-shrink: 0;
      }

      .card-info-des {
        color: #191a1b;
        flex: 1;
        margin-left: 12px;
        word-break: break-all;
      }
    }
  }
}

.status-blue {
  color: #2261dd;
}

.status-yellow {
  color: #c8a12b;
}

.status-green {
  color: #009100;
}

.status-red {
  color: #E43122;
}

// 没有更多了
.no-more-tip {
  text-align: center;
  padding: 16px 0;
  font-size: 14px;
  color: #999;
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
</style>
