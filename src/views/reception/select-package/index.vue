<template>
  <div class="select-package">
    <!-- Tab导航 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="44px" @change="onTabChange">
      <van-tab title="维修套餐" name="repair">
        <div class="tab-content">
          <!-- 搜索框 -->
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入套餐代码、名称"
              shape="round"
              :autofocus="false"
              @search="onSearch"
              @clear="onSearchClear"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <!-- 列表 -->
          <div class="package-list">
            <div
              v-for="item in packageList"
              :key="item.spellCode"
              class="package-item"
              @click="onPackageClick(item)"
            >
              <div class="item-info">
                <div class="item-name">{{ item.packageName }}</div>
                <div class="item-code">{{ item.spellCode }}</div>
              </div>
              <div v-if="item.selected" class="item-status">已选</div>
            </div>
            <div v-if="packageList.length === 0 && !loading" class="no-data">
              <img src="@/assets/image/noList.png" alt="" />
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="权益套餐" name="equity">
        <div class="tab-content">
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入套餐代码、名称"
              shape="round"
              @search="onSearch"
              @clear="onSearchClear"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <div class="package-list">
            <div
              v-for="(item, index) in equityList"
              :key="index"
              class="package-item"
              @click="onEquityClick(item)"
            >
              <div class="item-info">
                <div class="item-name">
                  {{ item.rightsName }}({{ item.usedTimes }}/{{ item.totalRemainTimes }})
                </div>
                <div class="item-code">{{ item.rightsCode }}</div>
              </div>
              <div v-if="item.selected" class="item-status">已选</div>
            </div>
            <div v-if="equityList.length === 0 && !loading" class="no-data">
              <img src="@/assets/image/noList.png" alt="" />
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="商城订单" name="mall">
        <div class="tab-content">
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入套餐代码、名称"
              shape="round"
              @search="onSearch"
              @clear="onSearchClear"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <div class="package-list">
            <div
              v-for="(item, index) in mallList"
              :key="index"
              class="package-item"
              @click="onMallClick(item)"
            >
              <div class="item-info">
                <div class="item-name">{{ item.interestsGoodsName }}</div>
                <div class="item-code">{{ item.interestsGoodsCode }}</div>
              </div>
            </div>
            <div v-if="mallList.length === 0 && !loading" class="no-data">
              <img src="@/assets/image/noList.png" alt="" />
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="免保项目" name="free">
        <div class="tab-content">
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入套餐代码、名称"
              shape="round"
              @search="onSearch"
              @clear="onSearchClear"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <div class="package-list">
            <div
              v-for="(item, index) in freeList"
              :key="index"
              class="package-item"
              @click="onFreeClick(item)"
            >
              <div class="item-info">
                <div class="item-name">{{ item.repairItemName }}</div>
                <div class="item-code">{{ item.repairItemCode }}</div>
              </div>
            </div>
            <div v-if="freeList.length === 0 && !loading" class="no-data">
              <img src="@/assets/image/noList.png" alt="" />
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="服务活动" name="service">
        <div class="tab-content">
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入套餐代码、名称"
              shape="round"
              @search="onSearch"
              @clear="onSearchClear"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <div class="package-list">
            <div
              v-for="(item, index) in serviceList"
              :key="index"
              class="package-item"
              @click="onServiceClick(item)"
            >
              <div class="item-info">
                <div class="item-name">{{ item.activityName }}</div>
                <div class="item-code">{{ item.schemeName }}</div>
              </div>
            </div>
            <div v-if="serviceList.length === 0 && !loading" class="no-data">
              <img src="@/assets/image/noList.png" alt="" />
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 全屏Loading -->
    <van-overlay :show="loading">
      <div class="loading-wrapper">
        <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
      </div>
    </van-overlay>

    <!-- 维修套餐详情弹窗 -->
    <ais-popup
      :show="showPackageDetail"
      position="bottom"
      closeable
      close-icon="cross"
      close-icon-position="top-left"
      title="维修套餐"
      @close="showPackageDetail = false"
    >
      <template #content>
        <!-- 套餐信息 -->
        <div class="package-info">
          <div class="package-name">{{ selectedPackage.name }}</div>
          <div class="package-code">{{ selectedPackage.code }}</div>
        </div>
        <!-- 内容区域 -->
        <div class="package-detail">
          <!-- 维修项目列表 -->
          <div
            v-for="(item, index) in selectedPackage.itemRespList"
            :key="index"
            class="repair-card"
          >
            <div class="repair-card-content">
              <div class="repair-left">
                <div class="repair-name-row">
                  <span class="repair-name">{{ item.repairItemName }}</span>
                  <!-- <span class="repair-tag">{{ item.repairItemTypeName }}</span> -->
                </div>
                <div class="repair-code">{{ item.repairItemCode }}</div>
                <div class="repair-category">{{ item.repairItemTypeName }}</div>
              </div>
              <div class="repair-right">
                <div class="repair-price">¥{{ item.price }}</div>
                <div class="repair-discount" v-if="Number(item.discountAmount) > 0">
                  优惠 ¥{{ item.discountAmount }}
                </div>
              </div>
            </div>
            <div class="repair-card-bottom">
              <div class="repair-info-row">
                <span class="info-item">
                  <span class="info-value">¥{{ item.price }}</span>
                </span>
                <span class="info-item">
                  <span class="info-label">实际金额</span>
                  <span class="info-value">¥{{ item.actualAmount }}</span>
                </span>
              </div>
            </div>
            <!-- 维修配件列表 -->
            <div v-if="expandedPartsIndex === index" class="parts-list">
              <div v-for="(part, pIndex) in item.partRespList" :key="pIndex" class="part-card">
                <div class="part-card-content">
                  <div class="part-left">
                    <div class="part-name-row">
                      <span class="part-name">{{ part.partsName }}</span>
                      <!-- <span class="part-tag">{{ part.repairItemTypeName }}</span> -->
                    </div>
                    <div class="part-code">{{ part.partsCode }}</div>
                    <div class="part-category">{{ part.repairItemTypeName }}</div>
                  </div>
                  <div class="part-right">
                    <div class="part-price">¥{{ part.price }}</div>
                    <div class="part-discount">优惠 ¥{{ part.discountAmount }}</div>
                  </div>
                </div>
                <div class="part-card-bottom">
                  <div class="part-info-row">
                    <span class="info-item">
                      <span class="info-value">¥{{ part.price || '0.00' }}</span>
                    </span>
                    <span class="info-item">
                      <span class="info-label">数量</span>
                      <span class="info-value">x{{ part.quantity }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 展开/收起查看配件按钮 -->
            <div
              v-if="item.partRespList && item.partRespList.length > 0"
              class="expand-btn"
              @click="togglePartsExpand(index)"
            >
              <span class="expand-text">{{
                expandedPartsIndex === index ? '收起维修配件' : '查看维修配件'
              }}</span>
              <van-icon
                :name="expandedPartsIndex === index ? 'arrow-up' : 'arrow-down'"
                size="12"
                color="#009100"
              />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="detail-actions" :class="{ 'single-btn': isPackageSelected }">
          <div v-if="isPackageSelected" class="cancel-btn" @click="showPackageDetail = false">
            取消选择
          </div>
          <div v-else class="confirm-btn full-btn" @click="onConfirmPackage">选择</div>
        </div>
      </template>
    </ais-popup>

    <!-- 服务活动详情弹窗 -->
    <ais-popup
      :show="showServiceDetail"
      position="bottom"
      closeable
      close-icon="cross"
      close-icon-position="top-left"
      title="服务活动"
      @close="showServiceDetail = false"
    >
      <template #content>
        <!-- 活动信息 -->
        <div class="package-info">
          <div class="package-name">{{ selectedService.activityResponse.activityName }}</div>
        </div>
        <!-- 内容区域 -->
        <div class="package-detail">
          <!-- 活动维修配件列表 -->
          <div
            v-for="(part, index) in selectedService.itemResponseList"
            :key="index"
            class="repair-card"
          >
            <div class="repair-card-content">
              <div class="repair-left">
                <div class="repair-name-row">
                  <span class="repair-name">{{ part.repairItemName }}</span>
                  <span class="repair-tag">{{ part.repairItemTypeName }}</span>
                </div>
                <div class="repair-code">{{ part.partsCode }}</div>
                <div class="repair-category">{{ part.checkoutTypeName }}</div>
              </div>
              <div class="repair-right">
                <div class="repair-price">¥{{ part.claimPrice }}</div>
                <div class="repair-discount">优惠 ¥{{ part.discountAmount }}</div>
              </div>
            </div>
            <div class="repair-card-bottom">
              <div class="repair-info-row">
                <span class="info-item">
                  <span class="info-value">¥{{ part.price }}</span>
                </span>
                <span class="info-item">
                  <span class="info-label">数量</span>
                  <span class="info-value">x{{ part.quantity }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="detail-actions" :class="{ 'single-btn': isServiceSelected }">
          <div v-if="isServiceSelected" class="cancel-btn" @click="showServiceDetail = false">
            取消选择
          </div>
          <div v-else class="confirm-btn full-btn" @click="onConfirmService">选择</div>
        </div>
      </template>
    </ais-popup>

    <!-- 免保项目详情弹窗 -->
    <ais-popup
      :show="showFreeDetail"
      position="bottom"
      closeable
      close-icon="cross"
      close-icon-position="top-left"
      title="免保项目"
      @close="showFreeDetail = false"
    >
      <template #content>
        <!-- 免保项目信息 -->
        <div class="package-info">
          <div class="package-name">{{ selectedFree.data.policyName }}</div>
          <div class="package-code">{{ selectedFree.data.repairItemCode }}</div>
        </div>
        <!-- 内容区域 -->
        <div class="package-detail">
          <!-- 配件列表 -->
          <div
            v-for="(part, index) in selectedFree.partDetailList"
            :key="index"
            class="repair-card"
          >
            <div class="repair-card-content">
              <div class="repair-left">
                <div class="repair-name-row">
                  <span class="repair-name">{{ part.partName }}</span>
                  <!-- <span class="repair-tag">{{ part.vehicleRegisteredModelName }}</span> -->
                </div>
                <div class="repair-code">{{ part.partCode }}</div>
              </div>
              <div class="repair-right">
                <div class="repair-price">x{{ part.partQuantity }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="detail-actions" :class="{ 'single-btn': isFreeSelected }">
          <div v-if="isFreeSelected" class="cancel-btn" @click="showFreeDetail = false">
            取消选择
          </div>
          <div v-else class="confirm-btn full-btn" @click="onConfirmFree">选择</div>
        </div>
      </template>
    </ais-popup>

    <!-- 商城订单详情弹窗 -->
    <ais-popup
      :show="showMallDetail"
      position="bottom"
      closeable
      close-icon="cross"
      close-icon-position="top-left"
      title="商城订单"
      @close="showMallDetail = false"
    >
      <template #content>
        <!-- 商品明细标题 -->
        <div class="mall-title">商品明细</div>
        <!-- 内容区域 -->
        <div class="package-detail">
          <!-- 商品维修项目列表 -->
          <div
            v-for="(item, index) in selectedMall.interestsGoodsResp.goodsRepairItemList"
            :key="index"
            class="repair-card"
          >
            <div class="repair-card-content">
              <div class="repair-left">
                <div class="repair-name-row">
                  <span class="repair-name">{{ item.repairItemName }}</span>
                  <span class="repair-tag">{{ item.repairItemTypeName }}</span>
                </div>
                <div class="repair-code">{{ item.repairItemCode }}</div>
                <div class="repair-category">{{ item.checkoutTypeName }}</div>
              </div>
              <div class="repair-right">
                <div class="repair-price">¥{{ item.receivableAmount }}</div>
                <div class="repair-discount" v-if="Number(item.discountAmount) > 0">
                  优惠 ¥{{ item.discountAmount }}
                </div>
              </div>
            </div>
            <div class="repair-card-bottom">
              <div class="repair-info-row">
                <span class="info-item">
                  <span class="info-label">工时费</span>
                  <span class="info-value">¥{{ item.workingHours || '0.00' }}</span>
                </span>
                <span class="info-item">
                  <span class="info-label">单价</span>
                  <span class="info-value">¥{{ item.unitPrice }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="detail-actions" :class="{ 'single-btn': isMallSelected }">
          <div v-if="isMallSelected" class="cancel-btn" @click="showMallDetail = false">
            取消选择
          </div>
          <div v-else class="confirm-btn full-btn" @click="onConfirmMall">选择</div>
        </div>
      </template>
    </ais-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import AisPopup from '@/libs/components/AisPopup.vue'
import {
  getSpecialPackageList,
  getSpecialPackageDetail,
  getSpecialEquityList,
  getSpecialGoodsList,
  getSpecialGoodsDetail,
  getSpecialFreeList,
  getSpecialActivityList,
  getSpecialActivityDetail,
  getSpecialFreeDetail,
} from '@/api/reception'
import './select-package.scss'

const router = useRouter()
const route = useRoute()

// Tab状态
const activeTab = ref('repair')

// 搜索值
const searchValue = ref('')

// Loading状态
const loading = ref(false)

// 弹窗状态
const showPackageDetail = ref(false)
const showServiceDetail = ref(false)
const showFreeDetail = ref(false)
const showMallDetail = ref(false)

// 维修项目折叠状态
const activeRepairItem = ref([])

// 配件展开状态
const expandedPartsIndex = ref(-1)

// 当前详情是否已选
const isPackageSelected = ref(false)
const isServiceSelected = ref(false)
const isFreeSelected = ref(false)
const isMallSelected = ref(false)

// 选中的套餐
const selectedPackage = reactive({
  name: '',
  code: '',
  totalPrice: '0.00',
  itemRespList: [],
})

// 选中的服务活动
const selectedService = reactive({
  activityResponse: {},
  itemResponseList: [],
})

// 选中的免保项目
const selectedFree = reactive({
  data: {},
  partDetailList: [],
})

// 选中的商城订单
const selectedMall = reactive({
  interestsGoodsResp: {},
})

// 展开/收起配件列表
const togglePartsExpand = (index) => {
  expandedPartsIndex.value = expandedPartsIndex.value === index ? -1 : index
}

// 维修套餐列表
const packageList = ref([])

// 权益套餐列表
const equityList = ref([])

// 商城订单列表
const mallList = ref([])

// 免保项目列表
const freeList = ref([])

// 服务活动列表
const serviceList = ref([])

// 页面加载时获取维修套餐列表
onMounted(() => {
  const id = route.query.serviceProxyId || route.query.id
  if (id) {
    loading.value = true
    getSpecialPackageList({ id })
      .then((res) => {
        if (res.code === 200 && res.data) {
          packageList.value = res.data.map((item) => ({
            ...item,
            selected: false,
          }))
        } else {
          showToast(res.message || '请求失败')
        }
      })
      .catch(() => {
        showToast('网络错误')
      })
      .finally(() => {
        loading.value = false
      })
  }
})

// 获取列表数据的通用函数
const fetchListData = (tabName, searchKey = '') => {
  const serviceProxyId = route.query.serviceProxyId || route.query.id
  if (!serviceProxyId) return

  const params = { id: serviceProxyId }
  if (searchKey) params.searchKey = searchKey

  let api
  switch (tabName) {
    case 'repair':
      api = getSpecialPackageList(params)
      break
    case 'equity':
      api = getSpecialEquityList(params)
      break
    case 'mall':
      api = getSpecialGoodsList(params)
      break
    case 'free':
      api = getSpecialFreeList(params)
      break
    case 'service':
      api = getSpecialActivityList(params)
      break
    default:
      return
  }

  loading.value = true
  api
    .then((res) => {
      if (res.code === 200 && res.data) {
        switch (tabName) {
          case 'repair':
            packageList.value = res.data.map((item) => ({ ...item, selected: false }))
            break
          case 'equity':
            equityList.value = res.data.map((item) => ({ ...item, selected: false }))
            break
          case 'mall':
            mallList.value = res.data.map((item) => ({ ...item, selected: false }))
            break
          case 'free':
            freeList.value = res.data.map((item) => ({ ...item, selected: false }))
            break
          case 'service':
            serviceList.value = res.data.map((item) => ({ ...item, selected: false }))
            break
        }
      } else {
        showToast(res.message || '请求失败')
      }
    })
    .catch(() => {
      showToast('网络错误')
    })
    .finally(() => {
      loading.value = false
    })
}

// Tab切换
const onTabChange = (name) => {
  searchValue.value = ''
  fetchListData(name)
}

// 搜索
const onSearch = (value) => {
  fetchListData(activeTab.value, value)
}

// 清空搜索
const onSearchClear = () => {
  searchValue.value = ''
}

// 点击维修套餐
const onPackageClick = (item) => {
  const serviceProxyId = route.query.id
  getSpecialPackageDetail({ id: serviceProxyId, packageId: item.id }).then((res) => {
    if (res.code === 200) {
      const data = res.data
      selectedPackage.name = data.packageName || ''
      selectedPackage.code = data.code || ''
      selectedPackage.totalPrice = data.totalAmount || '0.00'
      selectedPackage.itemRespList = data.itemRespList || []
      activeRepairItem.value = []
      expandedPartsIndex.value = -1
    }
  })
  isPackageSelected.value = !!item.selected
  showPackageDetail.value = true
}

// 点击权益套餐
const onEquityClick = (item) => {
  selectedPackage.name = item.name
  selectedPackage.code = item.code
  selectedPackage.totalPrice = '0.00'
  selectedPackage.projects = [
    {
      name: '免费保养一次',
      tag: '',
      code: '',
      category: '',
      price: '0.00',
      discount: 0,
      originalPrice: '0.00',
      qty: '1.00',
      actualQty: '1',
      returnQty: '0',
    },
  ]
  isPackageSelected.value = !!item.selected
  showPackageDetail.value = true
}

// 点击商城订单
const onMallClick = (item) => {
  const serviceProxyId = route.query.serviceProxyId || route.query.id
  getSpecialGoodsDetail({
    id: serviceProxyId,
    packageId: item.id,
  }).then((res) => {
    if (res.code === 200) {
      const data = res.data
      selectedMall.interestsGoodsResp = data.interestsGoodsResp || {}
    }
  })
  isMallSelected.value = !!item.selected
  showMallDetail.value = true
}

// 点击免保项目
const onFreeClick = (item) => {
  const serviceProxyId = route.query.serviceProxyId || route.query.id
  getSpecialFreeDetail({
    id: serviceProxyId,
    packageId: item.id,
  }).then((res) => {
    if (res.code === 200) {
      const data = res.data
      selectedFree.data = data || {}
      selectedFree.partDetailList = data.partDetailList || []
    }
  })
  isFreeSelected.value = !!item.selected
  showFreeDetail.value = true
}

// 点击服务活动
const onServiceClick = (item) => {
  const serviceProxyId = route.query.serviceProxyId || route.query.id
  getSpecialActivityDetail({
    activityId: item.activityId,
    id: serviceProxyId,
    packageId: item.id,
  }).then((res) => {
    if (res.code === 200) {
      const data = res.data
      selectedService.activityResponse = data.activityResponse || {}
      selectedService.itemResponseList = data.itemResponseList || []
    }
  })
  isServiceSelected.value = !!item.selected
  showServiceDetail.value = true
}

// 确认选择套餐
const onConfirmPackage = () => {
  showToast('已添加: ' + selectedPackage.name)
  showPackageDetail.value = false
  router.back()
}

// 确认选择服务活动
const onConfirmService = () => {
  showToast('已添加: ' + selectedService.activityResponse.activityName)
  showServiceDetail.value = false
  router.back()
}

// 确认选择免保项目
const onConfirmFree = () => {
  showToast('已添加: ' + selectedFree.data.policyName)
  showFreeDetail.value = false
  router.back()
}

// 确认选择商城订单
const onConfirmMall = () => {
  showToast('已添加: ' + selectedMall.interestsGoodsResp.commodityName)
  showMallDetail.value = false
  router.back()
}
</script>
