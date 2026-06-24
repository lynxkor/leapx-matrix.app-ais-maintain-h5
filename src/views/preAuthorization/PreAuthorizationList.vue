<template>
  <div class="pre-auth-list">
    <!-- 搜索过滤头部 - 固定定位 -->
    <div class="filter-fixed">
      <FilterHeader
        ref="filterHeaderRef"
        :showSort="false"
        :showScan="false"
        :placeholder="'请输入门店名称/预授权单号/VIN'"
        :filter-list="filterList"
        :search-page-route="'preAuthorizationSearch'"
        @search="onSearch"
        @filterSearch="onFilterSearch"
      />
    </div>

    <!-- 预授权列表 -->
    <div class="list-container">
      <RefreshList
        ref="refreshListRef"
        :requestData="requestData"
        :has-no-data="dataList.length === 0"
        @setData="setData"
        @resetFilters="handleResetFilter"
      >
        <ListItem
          v-for="item in dataList"
          :key="item.id"
          @click="goToDetail(item)"
          class="list_item_contaniner"
        >
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
                <span class="card-info-des">
                  {{ item.vehProfileVin }}
                  <img
                    v-if="item.vehProfileVin"
                    :src="copyIcon"
                    class="copy-icon"
                    @click.stop="handleCopyVin(item.vehProfileVin)"
                  />
                </span>
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
                <span class="card-info-title">预计交车</span>
                <span class="card-info-des">{{ item.expectFinishAt }}</span>
              </van-col>
            </van-row>
          </template>

          <template #btn-content>
            <ais-button type="primary" round size="large" plain @click.stop="handleContact(item)">
              联系创建人
            </ais-button>
          </template>
        </ListItem>
      </RefreshList>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar" v-if="permissionStore.hasPermission('AISMC-app-preAuth-addOrUpdate')">
      <van-button class="create-btn" type="primary" @click="createAuthorization"> 新建 </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import FilterHeader from '@/libs/components/FilterHeader.vue'
import RefreshList from '@/libs/components/RefreshList.vue'
import ListItem from '@/components/ListItem.vue'
import AisButton from '@/components/AisButton.vue'
import { preAuthPage, preAuthGetStoreArea } from '@/api/authorization'
import { getEnumValue } from '@/libs/api/common'
import { callPhone } from '@/libs/utils/nativeFn'
import { copyText } from '@/libs/utils'
import copyIcon from '@/libs/assets/image/copy_icon.svg'
import { usePageSafeArea } from '@/utils/safeArea'
import { usePermissionStore } from '@/stores/permission'

const router = useRouter()
const permissionStore = usePermissionStore()

usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })

// 响应式数据
const activeTab = ref('all')
const dataList = ref([])
const showEmpty = ref(false)
const filterHeaderRef = ref(null)
const refreshListRef = ref(null)

// FilterHeader 配置
const filterList = ref([
  {
    title: '门店所属区域',
    key: 'dealerUnitIdList',
    nodeType: 'multiple',
    default: [],
    options: []
  },
  {
    title: '预授权类型',
    key: 'preAuthTypeList',
    nodeType: 'multiple',
    default: [],
    options: [
      { label: '技术预授权', value: 1 },
      { label: '保修预授权', value: 2 }
    ]
  },
  {
    title: '状态',
    key: 'approvalStatusList',
    nodeType: 'multiple',
    default: [],
    options: []
  }
])

// 获取门店所属区域数据
const getStoreAreaOptions = async() => {
  try {
    const res = await preAuthGetStoreArea()
    if (res?.data) {
      filterList.value[0].options = res.data.map((item) => ({
        label: item.orgName,
        value: item.orgCode
      }))
    }
  } catch (error) {
    console.error('获取门店所属区域失败', error)
  }
}

// 获取审核状态枚举
const getAuditStatusOptions = async() => {
  try {
    const res = await getEnumValue('AuditStatusEnum')
    if (res?.data) {
      filterList.value[2].options = res.data.map((item) => ({
        label: item.message,
        value: item.code
      }))
    }
  } catch (error) {
    console.error('获取审核状态枚举失败', error)
  }
}

onMounted(() => {
  getStoreAreaOptions()
  getAuditStatusOptions()
})

// 当从其他页面返回时（keepAlive），滚动到顶部并刷新列表
onActivated(() => {
  nextTick(() => {
    // 滚动到顶部
    const container = document.querySelector('.layout-content')
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' })
    }
    // 刷新列表数据
    if (refreshListRef.value) {
      requestData.data.pageNum = 1
      refreshListRef.value.search(requestData.data)
    }
  })
})

// requestData 配置
const requestData = reactive({
  data: {
    pageNum: 1,
    pageSize: 10,
    dealerUnitIdList: [],
    preAuthTypeList: [],
    approvalStatusList: [],
    appSearchKeyWord: ''
  },
  api: (params) => preAuthPage(params)
})

// 方法定义
const onSearch = (params) => {
  // 更新 requestData.data 中的搜索关键词，但不触发自动查询
  requestData.data = {
    ...requestData.data,
    appSearchKeyWord: params.searchValue,
    pageNum: 1
  }
  // 手动触发搜索
  if (refreshListRef.value) {
    refreshListRef.value.search(requestData.data)
  }
}

const onFilterSearch = (filterParams) => {
  // 点击开始筛选时，手动调用 RefreshList 的 search 方法触发查询
  if (refreshListRef.value) {
    refreshListRef.value.search({
      ...requestData.data,
      ...filterParams,
      pageNum: 1
    })
  }
}

const setData = (res) => {
  // RefreshList emit: { list: records, isRefresh: current === 1 }
  const list = res?.list || []
  if (res?.isRefresh) {
    dataList.value = [...list]
  } else {
    dataList.value.push(...list)
  }
  showEmpty.value = dataList.value.length === 0
}

const handleResetFilter = () => {
  activeTab.value = 'all'
  requestData.data = {
    pageNum: 1,
    pageSize: 10,
    dealerUnitIdList: [],
    preAuthTypeList: [],
    approvalStatusList: [],
    appSearchKeyWord: ''
  }
  showEmpty.value = false
  // 重置 FilterHeader 的筛选条件
  if (filterHeaderRef.value) {
    filterHeaderRef.value.resetFilters()
  }
  nextTick(() => {
    refreshListRef.value?.search(requestData.data)
  })
}

const getStatusClass = (label) => {
  if (!label) return ''
  if (label === '未提交') return 'status-blue'
  if (label === '审核中' || label === '已过期') return 'status-yellow'
  if (label === '审核通过') return 'status-green'
  if (label === '已驳回' || label === '已拒绝' || label === '已作废') return 'status-red'
  return ''
}

const handleCopyVin = (vin) => {
  copyText(vin)
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

const createAuthorization = () => {
  router.push('/pre-authorization/create')
}
</script>

<style lang="scss" scoped>
.pre-auth-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
  height: 100%;
  min-height: 0;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    display: none;
  }

  .filter-fixed {
    flex-shrink: 0;
    background: #fff;
  }

  .filter-tabs {
    background: #fff;

    :deep(.van-tab) {
      font-size: 14px;
    }
  }

  .list-container {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px 12px 77px 12px;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
  }

  :deep(.pull-refresh-content) {
    min-height: 100%;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .order-no {
      font-family: 'PingFang SC';
      font-size: 16px;
      font-weight: 600;
      color: #191a1b;
    }

    .status-tag {
      font-family: 'PingFang SC';
      font-size: 12px;
      font-weight: 600;
    }
  }

  .card-info {
    box-sizing: border-box;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .card-info-col {
      font-family: 'PingFang SC';
      font-size: 14px;
      line-height: 20px;
      display: flex;
      gap: 12px;

      .card-info-title {
        color: #545454;
        width: 58px;
        flex-shrink: 0;
      }

      .card-info-des {
        color: #191a1b;
        flex: 1;
        word-break: break-all;
        margin-left: 12px;
        display: flex;
        align-items: center;

        .copy-icon {
          width: 14px;
          height: 14px;
          margin-left: 2px;
          cursor: pointer;
          flex-shrink: 0;
        }
      }
    }
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 48px;
    background: #ffffff;
    border-top: 0.5px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    padding-bottom: 29px;
    box-sizing: content-box;
    z-index: 100;

    .create-btn {
      width: 100%;
      height: 40px;
      background: #009100;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      color: #ffffff;
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
  color: #B91919;
}
</style>
