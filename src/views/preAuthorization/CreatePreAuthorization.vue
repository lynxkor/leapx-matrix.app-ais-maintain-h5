<template>
  <div class="create-pre-auth">
    <!-- Tab 导航 - 吸顶 -->
    <div ref="tabsNavRef" class="detail-tabs-nav">
      <div
        v-for="tab in tabs"
        :key="tab.name"
        :class="['tab-item', { active: activeTab == tab.name }]"
        @click="switchTab(tab.name)"
      >
        {{ tab.title }}
      </div>
    </div>
    <!-- 基础信息区域 -->
    <div id="tab-basic" :ref="setTabSectionRef('basic')" class="tab-content-section">
      <!-- 接车施工单卡片 -->
      <div class="main-card">
        <!-- 施工单 -->
        <div class="card-row work_order" @click="openConstructionPicker">
          <div class="section-title">接车施工单</div>
          <div class="work_box">
            <span class="row-label">施工单</span>
            <span class="row-value">
              {{ constructionNo || '请选择' }}
              <van-icon name="arrow" size="14" color="#888888" />
            </span>
          </div>
        </div>

        <!-- 预授权类型 -->
        <div class="card-row auth-type-row">
          <span class="row-label">预授权类型</span>
          <div class="type-chips">
            <div
              class="type-chip"
              :class="{ 'type-chip-active': authType === 'tech' }"
              @click="onAuthTypeChange('tech')"
            >
              技术预授权
            </div>
            <div
              class="type-chip"
              :class="{ 'type-chip-active': authType === 'warranty' }"
              @click="onAuthTypeChange('warranty')"
            >
              保修预授权
            </div>
          </div>
        </div>
      </div>

      <!-- 车辆信息卡片 -->
      <div v-if="showVehicleInfo" class="vehicle-info-card">
        <div class="vehicle-info-item">
          <span class="info-label">VIN</span>
          <span class="info-value">{{ vehicleInfo.vin }}</span>
        </div>
        <div class="vehicle-info-item">
          <span class="info-label">保修时间</span>
          <span class="info-value">{{ vehicleInfo.warrantyTime }}</span>
        </div>
        <div class="vehicle-info-item">
          <span class="info-label">进店里程</span>
          <span class="info-value">{{ vehicleInfo.mileage }}</span>
        </div>
        <div class="vehicle-info-item">
          <span class="info-label">车辆用途</span>
          <span class="info-value">{{ vehicleInfo.carPropertyLabel }}</span>
        </div>
        <div class="vehicle-info-item">
          <span class="info-label">终身质保</span>
          <span class="info-value">{{ vehicleInfo.lifetimeWarranty }}</span>
        </div>
        <div class="vehicle-info-item">
          <span class="info-label">服务门店</span>
          <span class="info-value">{{ vehicleInfo.serviceStore }}</span>
        </div>
        <div class="vehicle-info-item">
          <span class="info-label">门店所属区域</span>
          <span class="info-value">{{ vehicleInfo.storeArea }}</span>
        </div>
        <div class="vehicle-info-item warning-item" @click="warningExpanded = !warningExpanded">
          <span class="info-label">预警信息</span>
          <div class="info-value-wrap">
            <span class="info-value" :class="{ 'text-collapsed': !warningExpanded }">{{ vehicleInfo.alarmInfo }}</span>
            <van-icon
              v-if="vehicleInfo.alarmInfo && vehicleInfo.alarmInfo.length > 20"
              :name="warningExpanded ? 'arrow-up' : 'arrow-down'"
              size="16"
              color="#888888"
            />
          </div>
        </div>
      </div>

      <!-- 质量反馈报告卡片 -->
      <div class="quality-feedback-card">
        <div class="section-title">质量反馈报告</div>
        <div class="feedback-row" @click="openFeedbackPicker">
          <span class="row-label">质量反馈单号</span>
          <div class="row-value">
            <span class="feedback-no">{{ feedbackNo || '' }}</span>
            <van-icon name="arrow" size="14" color="#888888" />
          </div>
        </div>
        <div v-if="feedbackDesc" class="feedback-info-row">
          <span class="info-label">故障现象描述</span>
          <div class="info-value" :class="{ 'text-collapsed': !descExpanded }" @click="descExpanded = !descExpanded">
            {{ feedbackDesc }}
            <van-icon
              v-if="feedbackDesc.length > 20"
              :name="descExpanded ? 'arrow-up' : 'arrow-down'"
              size="14"
              color="#888888"
            />
          </div>
        </div>
        <div v-if="feedbackProcess" class="feedback-info-row no-border">
          <span class="info-label">故障排查流程</span>
          <div class="info-value" :class="{ 'text-collapsed': !processExpanded }" @click="processExpanded = !processExpanded">
            {{ feedbackProcess }}
            <van-icon
              v-if="feedbackProcess.length > 20"
              :name="processExpanded ? 'arrow-up' : 'arrow-down'"
              size="14"
              color="#888888"
            />
          </div>
        </div>
      </div>

      <!-- 申请原因卡片 -->
      <div class="reason-card">
        <div class="reason-header">申请原因</div>
        <van-field
          v-model="applyReason"
          type="textarea"
          placeholder="请输入申请原因"
          :rows="4"
          maxlength="500"
          autosize
          class="reason-textarea"
        />
      </div>
    </div>

    <!-- 项目零件区域 -->
    <div id="tab-parts" :ref="setTabSectionRef('parts')" class="tab-content-section">
      <!-- 维修项目卡片 -->
      <div class="repair-card">
        <div class="repair-card-header">维修项目</div>
        <div v-for="(item, index) in repairItems" :key="index" class="repair-item">
          <div class="repair-item-main">
            <div class="repair-item-left">
              <div class="repair-item-top">
                <span class="repair-name">{{ item.name }}</span>
                <span v-if="item.tag" class="repair-tag">{{ item.tag }}</span>
              </div>
              <div class="repair-part-no">{{ item.partNo }}</div>
              <div class="repair-type">{{ item.type }}</div>
            </div>
            <div class="repair-item-right">
              <div class="repair-price">¥{{ item.subtotal }}</div>
              <div class="repair-discount">优惠 ¥{{ item.discount }}</div>
            </div>
          </div>
          <div class="repair-item-bottom">
            <span class="repair-subtotal">¥{{ item.price }}</span>
            <span class="repair-quantity">x{{ item.workHour }}</span>
          </div>
        </div>
      </div>

      <!-- 维修配件卡片 -->
      <div class="parts-card">
        <div class="parts-card-header">维修配件</div>
        <div v-for="(item, index) in partsList" :key="index" class="parts-item">
          <div class="parts-item-main">
            <div class="parts-item-left">
              <div class="parts-item-top">
                <span class="parts-name">{{ item.name }}</span>
                <span v-if="item.tag" class="parts-tag">{{ item.tag }}</span>
              </div>
              <div class="parts-part-no">{{ item.partNo }}</div>
              <div class="parts-type">{{ item.type }}</div>
            </div>
            <div class="parts-item-right">
              <div class="parts-price">¥{{ item.subtotal }}</div>
              <div class="parts-discount">优惠 ¥{{ item.discount }}</div>
            </div>
          </div>
          <div class="parts-item-bottom">
            <span class="parts-subtotal">¥{{ item.price }}</span>
            <span class="parts-actual">实际领料 {{ item.actualQuantity }}</span>
            <span class="parts-return">退料 {{ item.returnQuantity }}</span>
            <span class="parts-quantity">x{{ item.quantity }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 附件信息区域 -->
    <div id="tab-attachments" :ref="setTabSectionRef('attachments')" class="tab-content-section">
      <div class="attachments-card">
        <div class="attachments-card-header">附件信息</div>

        <div v-for="(title, key) in attachmentTypeMap" :key="key" class="attachment-section">
          <div class="attachment-section-title">{{ title }}</div>
          <div class="attachment-list">
            <div v-for="(img, index) in attachmentData[key]" :key="index" class="attachment-item">
              <img :src="img.url" class="attachment-img" />
              <div class="attachment-delete" @click="deleteAttachment(key, index)">
                <van-icon name="cross" size="12" color="#ffffff" />
              </div>
            </div>
            <div class="attachment-upload" @click="uploadAttachment(key)" v-if="getAttachConfig(getAttachmentTypeLabel(key)).maxNum == null || attachmentData[key].length < getAttachConfig(getAttachmentTypeLabel(key)).maxNum">
              <van-icon name="photograph" size="24" color="#d8d8d8" />
              <span class="upload-text">上传</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部提交按钮 -->
    <div class="bottom-action">
      <div class="submit-btn" @click="handleSubmit" v-if="permissionStore.hasPermission('AISMC-app-preAuth-submit')">
        提交申请
      </div>
    </div>

    <!-- 施工单选择弹窗 -->
    <AisPopup
      v-model:show="showConstructionPicker"
      title="选择施工单"
      :closeable="true"
      position="bottom"
      :round="true"
    >
      <template #content>
        <div class="construction-popup">
          <div class="popup-header">
            <div class="search-box">
              <div class="search-icon-wrap">
                <van-icon name="search" size="16" color="#000" />
              </div>
              <input
                v-model="constructionSearchText"
                type="text"
                class="search-input"
                placeholder="输入施工单号/车牌号/VIN"
              />
              <div class="search-btn" @click="handleConstructionSearch">搜索</div>
            </div>
          </div>
          <van-list
            v-if="constructionList.length > 0"
            v-model:loading="constructionLoading"
            :finished="constructionFinished"
            finished-text=""
            class="popup-refresh-list"
            @load="onConstructionLoad"
          >
            <div
              v-for="item in constructionList"
              :key="item.id"
              class="construction-item"
              @click="onConstructionSelect(item)"
            >
              <div class="construction-header">
                <span class="construction-no">{{ item.code }}</span>
                <span class="construction-status" :class="'status-' + item.status">{{
                  item.statusText
                }}</span>
              </div>
              <div class="construction-vehicle">
                <span class="vehicle-plate">{{ item.carPlate }}</span>
                <div class="vehicle-icons" v-if="item.alarmLevel">
                  <svg class="icon" viewBox="0 0 16 16">
                    <path
                      :fill="getAlarmColor(item.alarmLevel)"
                      :stroke="getAlarmColor(item.alarmLevel)"
                      stroke-width="4"
                      stroke-linejoin="round"
                      d="M8 2L14 13H2Z"
                    />
                    <text
                      x="8"
                      y="12"
                      text-anchor="middle"
                      fill="#ffffff"
                      font-size="9"
                      font-weight="bold"
                    >
                      !
                    </text>
                  </svg>
                </div>
                <template v-if="item.repairItemTypeDetailCollect">
                  <span
                    v-for="(tag, index) in item.repairItemTypeDetailCollect.split('&').filter(Boolean)"
                    :key="index"
                    class="vehicle-tag"
                  >{{ tag }}</span>
                </template>
              </div>
              <div class="construction-vehicle-info">
                {{ item.vehModelName }} · {{ item.vehProfileVin }}
              </div>
              <div class="construction-detail">
                <div class="detail-row">
                  <span class="detail-label">送修人</span>
                  <span class="detail-value">{{ item.shuttleName }}</span>
                  <span v-if="item.custType" class="customer-tag">{{ { '10': '预约客户', '20': '随到客户' }[item.custType] || item.custType }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">客户经理</span>
                  <span class="detail-value">{{ item.creatorName }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">预计交车</span>
                  <span class="detail-value">{{ item.expectFinishAt }}</span>
                </div>
              </div>
            </div>
          </van-list>
          <div v-if="constructionSearched && !constructionLoading && constructionList.length === 0" class="construction-empty-wrap">
            <div class="construction-empty">
              <img src="@/libs/assets/image/no-data.png" alt="无搜索结果" class="construction-empty-img" />
              <p class="construction-empty-text">没有找到相关内容</p>
            </div>
          </div>
        </div>
      </template>
    </AisPopup>

    <!-- 质量反馈单号选择弹窗 -->
    <AisPopup
      v-model:show="showFeedbackPicker"
      title="质量反馈报告"
      :closeable="true"
      position="bottom"
      :round="true"
    >
      <template #content>
        <div class="feedback-popup">
          <div class="popup-header">
            <div class="search-box">
              <div class="search-icon-wrap">
                <van-icon name="search" size="16" color="#000" />
              </div>
              <input
                v-model="feedbackSearchText"
                type="text"
                class="search-input"
                placeholder="反馈单号"
              />
              <div class="search-btn" @click="handleFeedbackSearch">搜索</div>
            </div>
          </div>
          <RefreshList
            ref="feedbackRefreshListRef"
            class="popup-refresh-list"
            :requestData="feedbackRequestData"
            :has-no-data="feedbackList.length === 0"
            :show-reset-button="false"
            @setData="setFeedbackData"
          >
            <div
              v-for="item in feedbackList"
              :key="item.id"
              class="feedback-select-item"
              @click="onFeedbackSelect(item)"
            >
              <div class="feedback-serial" v-html="highlightSearch(item.code, feedbackSearchText)"></div>
              <div class="feedback-type" v-if="item.reportType">{{ qualityReportTypeMap[item.reportType] || item.reportType }}</div>
              <div class="feedback-desc" v-if="item.title">{{ item.title }}</div>
            </div>
          </RefreshList>
        </div>
      </template>
    </AisPopup>

    <!-- 保存确认弹窗 -->
    <van-dialog
      v-model:show="showSaveConfirmDialog"
      show-cancel-button
      confirm-button-text="保存"
      cancel-button-text="不保存"
      confirm-button-color="#009100"
      @confirm="onSaveConfirm"
      @cancel="onSaveCancel"
      class="save-confirm-dialog"
    >
      <div class="dialog-content">是否保存此次编辑？</div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import AisPopup from '@/components/AisPopup.vue'
import RefreshList from '@/libs/components/RefreshList.vue'
import {
  preAuthGetPreAuthInfoDetail,
  preAuthAddOrUpdate,
  preAuthGetConstructionList,
  preAuthGetQualityFeedbackList
} from '@/api/authorization'
import { uploadFileByUrl, deleteAttachmentConfig, getUploadConfig } from '@/libs/api/fileConfig'
import { batchUploadImageLimit } from '@/libs/utils/nativeFn'
import { usePageSafeArea } from '@/utils/safeArea'
import { getEnumValue } from '@/libs/api/common'
import { usePermissionStore } from '@/stores/permission'

const router = useRouter()
const permissionStore = usePermissionStore()
usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })
const PRE_AUTH_ATTACHMENT_CONFIG_CODE = 'mcs_preauth'
const uploadConfig = ref({})
const getAttachConfig = (attachType) => {
  const detailList = uploadConfig.value?.detailList || []
  return detailList.find((item) => item.attachType === attachType) || {}
}
const attachmentTypeMap = {
  vehicle: '车辆信息',
  license: '行驶证',
  fault: '故障信息',
  // finalRight: '终身权益',
  // firstMaintain: '首保凭证',
  maintainQuality: '保养质检',
  // oldParts: '施工旧件',
  oldPartInfo: '旧件信息',
  other: '其他'
}

const activeTab = ref('basic')
const currentBusinessId = ref('')
const currentUploadType = ref('')
const isUploadingAttachment = ref(false)
const isClickScrolling = ref(false)
const TAB_SYNC_TOLERANCE = 24
const tabsNavRef = ref(null)
const tabSectionRefs = {}
const PRE_AUTH_ACTION = {
  save: 0,
  submit: 1
}

// Tab 配置
const tabs = [
  { name: 'basic', title: '基础信息' },
  { name: 'parts', title: '项目零件' },
  { name: 'attachments', title: '附件信息' }
]

// IntersectionObserver 实例
let scrollContainer = null
let clickScrollCleanup = null

const setTabSectionRef = (tabName) => (el) => {
  if (el) {
    tabSectionRefs[tabName] = el
  } else {
    delete tabSectionRefs[tabName]
  }
}

const getTabSectionEl = (tabName) => {
  return tabSectionRefs[tabName] || null
}

/**
 * 获取滚动容器
 */
const getScrollContainer = () => {
  if (scrollContainer) return scrollContainer
  const container = document.querySelector('.layout-content')
  if (container) {
    scrollContainer = container
    return scrollContainer
  }
  return window
}

/**
 * 获取当前滚动位置
 */
const getScrollTop = () => {
  const container = getScrollContainer()
  if (container === window) {
    return window.scrollY || document.documentElement.scrollTop
  }
  return container.scrollTop
}

/**
 * 滚动到指定位置
 */
const scrollToPosition = (targetScrollTop, behavior = 'smooth') => {
  const container = getScrollContainer()
  if (container === window) {
    window.scrollTo({
      top: targetScrollTop,
      behavior
    })
  } else {
    container.scrollTo({
      top: targetScrollTop,
      behavior
    })
  }
}

const getElementScrollTop = (element) => {
  const container = getScrollContainer()
  if (container === window) {
    return element.getBoundingClientRect().top + (window.scrollY || document.documentElement.scrollTop)
  }
  return element.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
}

const getTabsNavHeight = () => {
  return tabsNavRef.value?.offsetHeight || 44
}

onMounted(async() => {
  window.getScanResult = handleNativeImage
  await nextTick()
  setupScrollListener()
  getUploadConfig({ configCode: PRE_AUTH_ATTACHMENT_CONFIG_CODE }).then((res) => {
    if (res?.code === 200 || res?.code === 0) {
      uploadConfig.value = res.data || {}
    }
  })
  getEnumValue('QualityReportTypeEnum').then((res) => {
    if (res?.code === 200) {
      const list = res.data || []
      const map = {}
      list.forEach((item) => {
        map[item.code] = item.message
      })
      qualityReportTypeMap.value = map
    }
  })
})

onUnmounted(() => {
  if (window.getScanResult === handleNativeImage) {
    window.getScanResult = null
  }
  if (clickScrollCleanup) {
    clickScrollCleanup()
    clickScrollCleanup = null
  }
  const container = getScrollContainer()
  if (container === window) {
    window.removeEventListener('scroll', handleScroll)
  } else if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})

// 监听滚动
const setupScrollListener = () => {
  const container = getScrollContainer()
  if (container === window) {
    window.addEventListener('scroll', handleScroll)
  } else {
    container.addEventListener('scroll', handleScroll)
  }
}

const handleScroll = () => {
  if (!isClickScrolling.value) {
    syncTabByScroll()
  }
}

// 根据滚动位置同步切换 tab
const scrollSyncTimeout = null
const syncTabByScroll = () => {
  const scrollTop = getScrollTop()
  const offset = getTabsNavHeight() + 12 + TAB_SYNC_TOLERANCE

  // 清除之前的定时器
  if (scrollSyncTimeout) {
    clearTimeout(scrollSyncTimeout)
  }

  // 找到当前应该激活的 tab
  let targetTab = null
  for (let i = tabs.length - 1; i >= 0; i--) {
    const tabEl = getTabSectionEl(tabs[i].name)
    if (!tabEl) continue

    const tabTop = getElementScrollTop(tabEl)
    if (scrollTop + offset >= tabTop) {
      targetTab = tabs[i].name
      break
    }
  }

  // 如果目标 tab 和当前 tab 不同，更新
  if (targetTab !== null && activeTab.value !== targetTab) {
    activeTab.value = targetTab
    scrollTabIntoView(targetTab)
  }
}

// 滚动指定 tab 到可视区域
const scrollTabIntoView = (tabName) => {
  const tabsNavEl = tabsNavRef.value
  if (!tabsNavEl) return

  const tabIndex = tabs.findIndex((tab) => tab.name === tabName)
  if (tabIndex === -1) return

  const tabItems = tabsNavEl.querySelectorAll('.tab-item')
  if (!tabItems[tabIndex]) return

  const targetTabEl = tabItems[tabIndex]
  const containerWidth = tabsNavEl.clientWidth
  const tabLeft = targetTabEl.offsetLeft
  const tabWidth = targetTabEl.offsetWidth
  const tabRight = tabLeft + tabWidth
  const currentScrollLeft = tabsNavEl.scrollLeft

  // 判断 tab 是否在可视区域内
  if (tabLeft < currentScrollLeft || tabRight > currentScrollLeft + containerWidth) {
    const targetScrollLeft = tabLeft - (containerWidth - tabWidth) / 2
    tabsNavEl.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth'
    })
  }
}

// 切换 Tab
const switchTab = (tabName) => {
  activeTab.value = tabName
  const targetEl = getTabSectionEl(tabName)
  if (!targetEl) return

  const finalScrollTop = Math.max(0, getElementScrollTop(targetEl) - getTabsNavHeight() - 12)
  const container = getScrollContainer()
  let scrollEndTimer = null

  if (clickScrollCleanup) {
    clickScrollCleanup()
    clickScrollCleanup = null
  }

  isClickScrolling.value = true

  const onScrollEnd = () => {
    if (scrollEndTimer) {
      clearTimeout(scrollEndTimer)
    }
    scrollEndTimer = setTimeout(() => {
      container.removeEventListener('scroll', onScrollEnd)
      isClickScrolling.value = false
      clickScrollCleanup = null
    }, 150)
  }

  container.addEventListener('scroll', onScrollEnd)
  clickScrollCleanup = () => {
    if (scrollEndTimer) {
      clearTimeout(scrollEndTimer)
    }
    container.removeEventListener('scroll', onScrollEnd)
    isClickScrolling.value = false
  }
  scrollToPosition(finalScrollTop, 'smooth')
}

// 表单数据
const constructionNo = ref('')
const constructionId = ref('')
const authType = ref('')
const feedbackNo = ref('')
const feedbackId = ref('')
const feedbackDesc = ref('')
const feedbackProcess = ref('')
const descExpanded = ref(false)
const processExpanded = ref(false)
const applyReason = ref('')

// 监听申请原因变化
watch(applyReason, () => {
  hasEdited.value = true
})

// 是否显示车辆信息
const showVehicleInfo = ref(false)

// 折叠状态
const warningExpanded = ref(false)

// 附件图片数据
const attachmentData = reactive({
  vehicle: [],
  license: [],
  fault: [],
  finalRight: [],
  firstMaintain: [],
  maintainQuality: [],
  oldParts: [],
  oldPartInfo: [],
  other: []
})

// 车辆信息数据
const vehicleInfo = ref({
  vin: '',
  warrantyTime: '',
  mileage: '',
  vehicleUse: '',
  lifetimeWarranty: '',
  serviceStore: '',
  storeArea: '',
  alarmInfo: ''
})

// 维修项目数据
const repairItems = ref([])

// 维修配件数据
const partsList = ref([])

// 选择器配置
const showConstructionPicker = ref(false)
const showFeedbackPicker = ref(false)
const showSaveConfirmDialog = ref(false)

// 页面是否有编辑
const hasEdited = ref(false)
const constructionSearchText = ref('')
const constructionList = ref([])
const constructionLoading = ref(false)
const constructionFinished = ref(true)
const constructionSearched = ref(false)
const constructionPageNum = ref(1)
const constructionPageSize = 10

const onConstructionLoad = async() => {
  try {
    const res = await preAuthGetConstructionList({
      pageNum: constructionPageNum.value,
      pageSize: constructionPageSize,
      appSearchKeyWord: constructionSearchText.value.trim()
    })
    const records = res?.data?.records || res?.data || []
    if (constructionPageNum.value === 1) {
      constructionList.value = [...records]
    } else {
      constructionList.value.push(...records)
    }
    constructionFinished.value = records.length < constructionPageSize
    constructionSearched.value = true
    if (!constructionFinished.value) {
      constructionPageNum.value++
    }
  } catch {
    constructionFinished.value = true
    constructionSearched.value = true
  } finally {
    constructionLoading.value = false
  }
}

const feedbackSearchText = ref('')
const feedbackList = ref([])
const qualityReportTypeMap = ref({})

// 监听质量反馈搜索词变化，实时搜索
watch(feedbackSearchText, (newVal) => {
  feedbackRequestData.data = {
    pageNum: 1,
    pageSize: 10,
    appSearchKeyWord: newVal,
    serviceProxyCode: constructionNo.value,
    _t: Date.now()
  }
})

// 质量反馈列表请求配置
const feedbackRequestData = reactive({
  data: {
    pageNum: 1,
    pageSize: 10,
    appSearchKeyWord: '',
    serviceProxyCode: '',
    orderStatus: 30
  },
  api: (params) => preAuthGetQualityFeedbackList(params)
})

// 设置质量反馈数据
const setFeedbackData = (res) => {
  const list = res?.list || []
  if (res?.isRefresh) {
    feedbackList.value = [...list]
  } else {
    feedbackList.value.push(...list)
  }
}

// 施工单搜索按钮点击
const handleConstructionSearch = () => {
  if (!constructionSearchText.value.trim()) {
    showToast('请输入搜索关键词')
    return
  }
  constructionList.value = []
  constructionSearched.value = false
  constructionPageNum.value = 1
  constructionFinished.value = false
  constructionLoading.value = true
  onConstructionLoad()
}

// 质量反馈搜索按钮点击
const handleFeedbackSearch = () => {
  feedbackRequestData.data = {
    pageNum: 1,
    pageSize: 10,
    appSearchKeyWord: feedbackSearchText.value,
    serviceProxyCode: constructionNo.value,
    _t: Date.now()
  }
}

// 高亮搜索匹配的文本
const highlightSearch = (text, searchText) => {
  if (!searchText || !text) return text
  const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<span class="highlight-match">$1</span>')
}

// 根据预警级别获取颜色 10=绿色, 20=黄色, 30=红色
const getAlarmColor = (alarmLevel) => {
  switch (alarmLevel) {
    case 10:
      return '#009100'
    case 20:
      return '#C8A12B'
    case 30:
      return '#B91919'
    default:
      return '#009100'
  }
}

const isSuccessResponse = (res) => res?.code === 0 || res?.code === 200

const validatePreAuthForm = () => {
  if (!constructionId.value) {
    showToast('请选择施工单')
    return false
  }
  if (!applyReason.value.trim()) {
    showToast('请填写申请原因')
    return false
  }
  return true
}

const getAttachmentListByType = () =>
  Object.keys(attachmentTypeMap).flatMap((type) => attachmentData[type] || [])

const buildAttachmentsPayload = () =>
  getAttachmentListByType().map((item) => ({
    ...(item.rawUploadData || {}),
    id: item.id || item.fileId || '',
    fileId: item.fileId || item.id || '',
    fileName: item.fileName || item.originalFilename || item.name || '',
    fileUrl: item.fileUrl || item.url || '',
    fileSize: item.fileSize || item.size || '',
    fileType: item.fileType || item.ext || '',
    attachType: item.attachType || '',
    configCode: item.configCode || PRE_AUTH_ATTACHMENT_CONFIG_CODE
  }))

const buildPreAuthPayload = (saveOrSubmit, attachments = buildAttachmentsPayload()) => {
  const payload = {
    serviceProxyId: constructionId.value,
    qualityOrderReportId: feedbackId.value,
    qualityOrderReport: feedbackNo.value,
    reason: applyReason.value,
    saveOrSubmit,
    attachments
  }
  if (currentBusinessId.value) {
    payload.id = currentBusinessId.value
  }
  return payload
}

const syncBusinessId = (res) => {
  const data = res?.data
  const businessId = typeof data === 'string'
    ? data
    : data?.preAuthId || data?.id || data?.businessId || res?.id || ''

  if (businessId) {
    currentBusinessId.value = businessId
  }

  return currentBusinessId.value
}

const savePreAuth = async({
  saveOrSubmit,
  attachments = buildAttachmentsPayload(),
  loadingMessage,
  successMessage = '',
  failureMessage,
  errorLogMessage,
  errorToastMessage,
  redirectAfterSuccess = false,
  resetEdited = false
}) => {
  if (!validatePreAuthForm()) return null

  try {
    showLoadingToast({ message: loadingMessage, forbidClick: true })

    const res = await preAuthAddOrUpdate(buildPreAuthPayload(saveOrSubmit, attachments))
    closeToast()

    if (isSuccessResponse(res)) {
      syncBusinessId(res)
      if (successMessage) {
        showToast(successMessage)
      }
      if (resetEdited) {
        hasEdited.value = false
      }
      if (redirectAfterSuccess) {
        router.back()
      }
      return res
    }

    showToast(res?.msg || failureMessage)
    return null
  } catch (error) {
    closeToast()
    console.error(errorLogMessage, error)
    showToast(errorToastMessage)
    return null
  }
}

const getAttachmentTypeLabel = (type) => attachmentTypeMap[type] || ''

const normalizeAttachmentItem = (item) => ({
  ...item,
  url: item.authFileUrl || item.fileUrl || item.url || '',
  name: item.fileName || item.name || ''
})

const normalizeUploadResult = (item, attachType) =>
  normalizeAttachmentItem({
    ...item,
    rawUploadData: item,
    id: item.id || item.fileId || '',
    fileId: item.fileId || item.id || '',
    fileName: item.fileName || item.originalFilename || item.name || '',
    fileUrl: item.fileUrl || item.url || '',
    fileSize: item.fileSize || item.size || '',
    fileType: item.fileType || item.ext || '',
    attachType,
    configCode: item.configCode || PRE_AUTH_ATTACHMENT_CONFIG_CODE,
    _localUploaded: true
  })

const handleNativeImage = async(rawFileUrl) => {
  const uploadType = currentUploadType.value
  currentUploadType.value = ''

  if (!uploadType) return

  let urlList = []
  if (typeof rawFileUrl === 'string') {
    if (rawFileUrl.startsWith('[')) {
      try {
        urlList = JSON.parse(rawFileUrl)
      } catch {
        urlList = [rawFileUrl]
      }
    } else {
      urlList = [rawFileUrl]
    }
  } else if (Array.isArray(rawFileUrl)) {
    urlList = rawFileUrl
  } else {
    return
  }

  if (!urlList.length) return
  if (!constructionId.value) {
    showToast('请先选择施工单')
    return
  }
  if (isUploadingAttachment.value) return

  const attachType = getAttachmentTypeLabel(uploadType)
  if (!attachType) {
    showToast('附件类型无效')
    return
  }

  try {
    isUploadingAttachment.value = true
    showLoadingToast({ message: '上传中...', forbidClick: true })

    const uploadItems = urlList.map((url) => ({
      fileUrl: url,
      configCode: PRE_AUTH_ATTACHMENT_CONFIG_CODE,
      attachType
    }))

    const uploadRes = await uploadFileByUrl(uploadItems)

    if (!isSuccessResponse(uploadRes)) {
      closeToast()
      showToast(uploadRes?.msg || '上传失败')
      return
    }

    const uploadData = uploadRes?.data
    const uploadedFiles = Array.isArray(uploadData) ? uploadData : (uploadData ? [uploadData] : [])
    if (!uploadedFiles.length) {
      closeToast()
      showToast('上传返回数据异常')
      return
    }

    attachmentData[uploadType].push(...uploadedFiles.map((item) => normalizeUploadResult(item, attachType)))
    closeToast()
    hasEdited.value = true
    showToast('上传成功')
  } catch (error) {
    closeToast()
    console.error('上传附件失败:', error)
    showToast('上传失败，请稍后重试')
  } finally {
    isUploadingAttachment.value = false
  }
}

// 提交申请
const handleSubmit = async() => {
  const attachments = buildAttachmentsPayload()
  await savePreAuth({
    saveOrSubmit: PRE_AUTH_ACTION.submit,
    attachments,
    loadingMessage: '提交中...',
    successMessage: '提交成功',
    failureMessage: '提交失败',
    errorLogMessage: '提交失败:',
    errorToastMessage: '提交失败，请稍后重试',
    redirectAfterSuccess: true,
    resetEdited: true
  })
}

// 方法
const openConstructionPicker = () => {
  constructionSearchText.value = ''
  constructionList.value = []
  constructionSearched.value = false
  showConstructionPicker.value = true
}

const openFeedbackPicker = () => {
  if (!constructionNo.value) {
    showToast('请先选择施工单')
    return
  }
  // 先更新请求参数，确保 RefreshList 挂载后首次请求就带上 serviceProxyCode
  feedbackRequestData.data = {
    pageNum: 1,
    pageSize: 10,
    appSearchKeyWord: '',
    serviceProxyCode: constructionNo.value,
    _t: Date.now()
  }
  feedbackSearchText.value = ''
  feedbackList.value = []
  showFeedbackPicker.value = true
}

const onAuthTypeChange = (type) => {
  authType.value = type
  hasEdited.value = true
}

const onConstructionSelect = async(item) => {
  // 调用API获取预填充详情
  try {
    showLoadingToast({ message: '加载中...', forbidClick: true })
    const res = await preAuthGetPreAuthInfoDetail(item.id)
    closeToast()

    if (res?.code !== 0 && res?.code !== 200) {
      showToast(res?.msg || res?.message || '获取信息失败')
      showVehicleInfo.value = false
      constructionId.value = ''
      constructionNo.value = ''
      return
    }

    constructionNo.value = item.code
    constructionId.value = item.id || item.serviceProxyId
    showConstructionPicker.value = false
    hasEdited.value = true

    if (res?.data) {
      showVehicleInfo.value = true
      const data = res.data
      // 更新车辆信息
      vehicleInfo.value = {
        vin: data.vehProfileVin || item.vehProfileVin || '',
        warrantyTime:
          data.guaranteeStartDate && data.warrantyEndTime
            ? `${data.guaranteeStartDate} 至 ${data.warrantyEndTime}`
            : '',
        mileage: data.mileage || item.mileage || '',
        carPropertyLabel: data.carPropertyLabel || item.carPropertyLabel || '',
        lifetimeWarranty: data.isLifetime === 1 ? '是' : '否',
        serviceStore: data.dealerName || item.dealerName || '',
        storeArea: data.orgName || data.dealerUnitName || item.orgName || item.dealerUnitName || '',
        alarmInfo: data.alarmInfo || item.alarmInfo || '无'
      }
      // 预授权类型: 1=技术预授权, 2=保修预授权
      authType.value = data.preAuthType === 1 ? 'tech' : 'warranty'

      // 维修项目数据
      repairItems.value = (data.spRepairItemResps || []).map((item) => ({
        name: item.repairItemName || '',
        partNo: item.repairItemCode || '',
        type: item.repairItemTypeName || '',
        price: item.price || '0',
        discount: item.discountAmount || '0',
        subtotal: item.repairAmount || '0',
        quantity: item.quantity || '0',
        workHour: item.workHour || '0',
        actualQuantity: item.actualQuantity || '0',
        returnQuantity: item.returnQuantity || '0',
        tag: ''
      }))

      // 维修配件数据
      partsList.value = (data.spSparePartResps || []).map((item) => ({
        name: item.partsName || '',
        partNo: item.partsCode || '',
        type: item.repairItemTypeName || '',
        tag: item.isOemPart === 1 ? '原厂件' : '',
        price: item.price || '0',
        discount: item.discountAmount || '0',
        subtotal: item.partsAmount || '0',
        quantity: item.quantity || '0',
        actualQuantity: item.actualPickNumber || '0',
        returnQuantity: item.refundedNumber || '0'
      }))
    }
  } catch (error) {
    closeToast()
    showToast(error.msg)
    showVehicleInfo.value = false
  }
}

const onFeedbackSelect = (item) => {
  feedbackNo.value = item.code
  feedbackId.value = item.id || ''
  feedbackDesc.value = item.title || ''
  feedbackProcess.value = item.diagnosisContent || ''
  showFeedbackPicker.value = false
  hasEdited.value = true
}

// 附件相关方法
const uploadAttachment = (type) => {
  const attachType = getAttachmentTypeLabel(type)
  const config = getAttachConfig(attachType)
  const maxNum = config.maxNum
  if (maxNum != null && (attachmentData[type] || []).length >= maxNum) {
    showToast(`最多上传${maxNum}个附件`)
    return
  }
  currentUploadType.value = type
  const maxSize = config.maxSize || 10
  const hasUploadNumber = (attachmentData[type] || []).length + 1
  batchUploadImageLimit(maxSize, maxNum, hasUploadNumber)
  hasEdited.value = true
}

const deleteAttachment = async(type, index) => {
  const item = attachmentData[type][index]
  if (!item) return

  if (item._localUploaded || (!item.id && !item.fileId)) {
    attachmentData[type].splice(index, 1)
    hasEdited.value = true
    showToast('删除成功')
    return
  }

  try {
    showLoadingToast({ message: '删除中...', forbidClick: true })

    // 调用删除接口
    const res = await deleteAttachmentConfig({
      id: item.id || item.fileId
    })

    closeToast()

    if (!isSuccessResponse(res)) {
      showToast(res?.msg || '删除失败')
      return
    }

    // 从列表中移除
    attachmentData[type].splice(index, 1)
    hasEdited.value = true
    showToast('删除成功')
  } catch (error) {
    closeToast()
    console.error('删除附件失败:', error)
    showToast('删除失败，请稍后重试')
  }
}

const onSaveConfirm = async() => {
  showSaveConfirmDialog.value = false
  const attachments = buildAttachmentsPayload()

  await savePreAuth({
    saveOrSubmit: PRE_AUTH_ACTION.save,
    attachments,
    loadingMessage: '保存中...',
    successMessage: '保存成功',
    failureMessage: '保存失败',
    errorLogMessage: '保存失败:',
    errorToastMessage: '保存失败，请稍后重试',
    redirectAfterSuccess: true,
    resetEdited: true
  })
}

const onSaveCancel = () => {
  showSaveConfirmDialog.value = false
  router.back()
}

// 暴露给 baseLayout 的返回拦截方法
defineExpose({
  onBeforeBack: () => {
    if (hasEdited.value) {
      showSaveConfirmDialog.value = true
      return false // 阻止默认返回行为
    }
    return true
  }
})
</script>

<style lang="scss" scoped>
.create-pre-auth {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: calc(75px + env(safe-area-inset-bottom));
}

// Tab 导航 - 在页面滚动容器内吸顶
.detail-tabs-nav {
  background: #fff;
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin: 0 -12px 12px;
  padding: 0 12px;
  &::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    flex: 0 0 auto;
    text-align: center;
    padding: 12px 0;
    margin: 0 12px;
    font-size: 14px;
    color: #666;
    position: relative;
    cursor: pointer;
    transition: color 0.2s;

    &.active {
      color: #009100;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 3px;
        background: #009100;
        border-radius: 2px;
      }
    }
  }
}

// 内容滚动区域
.tab-content-section {
  border-radius: 8px;
  box-sizing: border-box;
  margin-bottom: 12px;
}

// 主卡片（接车施工单）
.main-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;

  .section-title {
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 12px;
  }

  .card-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 0.5px solid #e6e6e5;

    &:last-child {
      border-bottom: none;
    }

    &.auth-type-row {
      align-items: flex-start;
      padding: 12px 0;
    }

    .row-label {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
      flex-shrink: 0;
    }

    .row-value {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #888888;
    }
  }
  .work_order {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    .work_box {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}

// 预授权类型选择
.type-chips {
  display: flex;
  gap: 6px;

  .type-chip {
    padding: 6px 16px;
    border-radius: 4px;
    font-family: 'PingFang SC';
    font-size: 14px;
    background: #f8f7f7;
    color: #191a1b;

    &.type-chip-active {
      background: rgba(0, 145, 0, 0.1);
      border: 1px solid #009100;
      color: #009100;
    }
  }
}

// 申请原因卡片
.reason-card {
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;

  .reason-header {
    padding: 12px;
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
  }

  .reason-textarea {
    padding: 12px;

    :deep(.van-field__control) {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
      line-height: 1.5;
    }

    :deep(.van-field__placeholder) {
      color: #888888;
    }
  }
}

// 维修项目卡片
.repair-card {
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;

  .repair-card-header {
    padding: 12px;
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
  }

  .repair-item {
    padding: 12px;
    border-bottom: 0.5px solid #e6e6e5;

    &:last-child {
      border-bottom: none;
    }

    .repair-item-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .repair-item-left {
        .repair-item-top {
          display: flex;
          align-items: center;
          gap: 8px;

          .repair-name {
            font-family: 'PingFang SC';
            font-size: 14px;
            font-weight: 500;
            color: #191a1b;
          }

          .repair-tag {
            font-family: 'PingFang SC';
            font-size: 12px;
            color: #009100;
            background: rgba(0, 145, 0, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
          }
        }

        .repair-part-no {
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #545454;
          margin-bottom: 2px;
        }

        .repair-type {
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #888888;
        }
      }

      .repair-item-right {
        text-align: right;

        .repair-price {
          font-family: 'PingFang SC';
          font-size: 14px;
          font-weight: 500;
          color: #191a1b;
          margin-bottom: 2px;
        }

        .repair-discount {
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #545454;
        }
      }
    }

    .repair-item-bottom {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #545454;
      font-size: 14px;
      font-weight: 400;
      font-family: 'PingFang SC';
      .repair-subtotal {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #545454;
      }
      .repair-quantity {
        margin-left: auto;
        font-family: 'PingFang SC';
      }
    }
  }
}

// 维修配件卡片
.parts-card {
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 12px;

  .parts-card-header {
    padding: 12px;
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
  }

  .parts-item {
    padding: 12px;
    border-bottom: 0.5px solid #e6e6e5;

    &:last-child {
      border-bottom: none;
    }

    .parts-item-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .parts-item-left {
        .parts-item-top {
          display: flex;
          align-items: center;
          gap: 8px;

          .parts-name {
            font-family: 'PingFang SC';
            font-size: 14px;
            font-weight: 500;
            color: #191a1b;
          }

          .parts-tag {
            font-family: 'PingFang SC';
            font-size: 12px;
            color: #009100;
            background: rgba(0, 145, 0, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
          }
        }

        .parts-part-no {
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #545454;
          margin-bottom: 2px;
        }

        .parts-type {
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #888888;
        }
      }

      .parts-item-right {
        text-align: right;

        .parts-price {
          font-family: 'PingFang SC';
          font-size: 14px;
          font-weight: 500;
          color: #191a1b;
          margin-bottom: 2px;
        }

        .parts-discount {
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #545454;
        }
      }
    }

    .parts-item-bottom {
      display: flex;
      align-items: center;
      gap: 8px;

      .parts-subtotal {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #545454;
      }

      .parts-actual,
      .parts-return {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
      }

      .parts-quantity {
        margin-left: auto;
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
      }
    }
  }
}

// 附件信息卡片
.attachments-card {
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;

  .attachments-card-header {
    padding: 12px;
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
  }

  .attachment-section {
    padding: 10px 12px 20px;

    &:not(:last-child) {
      border-bottom: 0.5px solid #e6e6e5;
    }

    .attachment-section-title {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
      margin-bottom: 8px;
    }

    .attachment-list {
      display: flex;
      gap: 8px;

      .attachment-item {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 6px;
        overflow: hidden;

        .attachment-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .attachment-delete {
          position: absolute;
          top: 0;
          right: 0;
          width: 24px;
          height: 24px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 0 6px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
      }

      .attachment-upload {
        width: 80px;
        height: 80px;
        background: #f5f5f5;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        cursor: pointer;

        .upload-text {
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #888888;
        }
      }
    }
  }
}

// 车辆信息卡片
.vehicle-info-card {
  background: #ffffff;
  border-radius: 0 0 6px 6px;
  margin-bottom: 12px;

  .vehicle-info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3px 12px;

    &:last-child {
      border-bottom: none;
      padding-bottom: 8px;
    }

    &.warning-item {
      align-items: flex-start;
    }

    .info-label {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #545454;
      flex-shrink: 0;
    }

    .info-value-wrap {
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      gap: 2px;
      flex: 1;
      margin-left: 23px;
      min-width: 0;
      overflow: hidden;
    }

    .info-value {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
      text-align: right;
      flex: 1;
      min-width: 0;

      &.text-collapsed {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &.warning-value {
        color: #ee0a24;
      }
    }
  }
}

// 搜索无结果空状态
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 12px;

  .loading-text {
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #999;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #cccccc;
  font-family: 'PingFang SC';
  font-size: 14px;
  gap: 12px;
}

// 底部提交按钮
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 6px 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
  box-sizing: border-box;
  height: 75px;

  .submit-btn {
    width: 100%;
    height: 40px;
    background: #009100;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #ffffff;

    &.submit-btn-disabled {
      background: rgba(0, 145, 0, 0.3);
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

// 保存确认弹窗
.save-confirm-dialog {
  width: 295px;
  height: 150px;
  border-radius: 12px;

  .dialog-content {
    font-family: 'PingFang SC';
    font-size: 16px;
    color: #222222;
    text-align: center;
    line-height: 24px;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.van-dialog__footer) {
    border-top: 0.5px solid #e6e6e5;
    border-radius: 0 0 8px 8px;
  }

  :deep(.van-dialog__cancel) {
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #222222;
  }

  :deep(.van-dialog__confirm) {
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #009100;
  }
}

// 施工单弹窗
.construction-popup {
  height: 583px;
  background: #f4f4f4;
  display: flex;
  flex-direction: column;
  position: relative;

  .popup-header {
    padding-bottom: 12px;
    flex-shrink: 0;

    .search-box {
      display: flex;
      align-items: center;
      height: 30px;
      padding: 0 12px;
      background: rgba(216, 216, 216, 0.3);
      border-radius: 15px;
      gap: 8px;
    }

    .search-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      height: 30px;
      padding: 0;
      border: none;
      background: transparent;
      font-family: 'PingFang SC';
      font-size: 14px;
      outline: none;
      color: #191a1b;

      &::placeholder {
        color: #888888;
      }
    }

    .search-btn {
      padding: 4px 12px;
      height: 22px;
      background: #009100;
      color: #ffffff;
      border-radius: 11px;
      font-family: 'PingFang SC';
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  }

  .popup-content-list {
    flex: 1;
    overflow-y: auto;
  }

  .popup-refresh-list {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .construction-item {
      background: #ffffff;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .construction-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 0.5px solid #e6e6e5;
        padding-bottom: 12px;
        margin-bottom: 8px;

        .construction-no {
          font-family: 'PingFang SC';
          font-size: 14px;
          color: #191a1b;
        }

        .construction-status {
          font-family: 'PingFang SC';
          font-size: 12px;
          font-weight: 500;

          &.status-pending {
            color: #c8a12b;
          }

          &.status-processing {
            color: #009100;
          }

          &.status-completed {
            color: #888888;
          }
        }
      }

      .construction-vehicle {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;

        .vehicle-plate {
          font-family: 'PingFang SC';
          font-size: 16px;
          font-weight: 500;
          color: #191a1b;
        }

        .vehicle-icons {
          display: flex;
          gap: 4px;

          .icon {
            width: 16px;
            height: 16px;
          }
        }

        .vehicle-tag {
            font-family: 'PingFang SC';
            font-size: 12px;
            font-style: normal;
            color: #191a1b;
            border: 0.5px solid #191a1b;
            border-radius: 4px;
            padding: 1px 4px;
            height: 20px;
            line-height: 17px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            white-space: nowrap;
          }
      }

      .construction-vehicle-info {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
        margin-bottom: 8px;
      }

      .construction-detail {
        .detail-row {
          display: flex;
          align-items: center;
          margin-bottom: 6px;

          &:last-child {
            margin-bottom: 0;
          }

          .detail-label {
            font-family: 'PingFang SC';
            font-size: 12px;
            color: #545454;
            width: 56px;
          }

          .detail-value {
            font-family: 'PingFang SC';
            font-size: 12px;
            color: #191a1b;
          }

          .customer-tag {
            font-family: 'PingFang SC';
            font-size: 12px;
            color: #191a1b;
            background: rgba(25, 26, 27, 0.06);
            border-radius: 4px;
            padding: 1px 4px;
            margin-left: 4px;
          }
        }
      }
    }
  }

  .construction-empty-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 55px;

    .construction-empty {
      display: flex;
      flex-direction: column;
      align-items: center;

      .construction-empty-img {
        width: 230px;
        height: 142px;
      }

      .construction-empty-text {
        font-family: 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #6C6E6C;
        margin-top: 16px;
      }
    }
  }
}

// 质量反馈报告卡片
.quality-feedback-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  margin-top: 12px;

  .section-title {
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 12px;
  }

  .feedback-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 0.5px solid #e6e6e5;

    .row-label {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
      flex-shrink: 0;
    }

    .row-value {
      display: flex;
      align-items: center;
      gap: 4px;

      .feedback-no {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
      }
    }
  }

  .feedback-info-row {
    display: flex;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 0.5px solid #e6e6e5;
    gap: 12px;

    &.no-border {
      border-bottom: none;
    }

    .info-label {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
      flex-shrink: 0;
      width: 98px;
    }

    .info-value {
      flex: 1;
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #888888;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;

      &.text-collapsed {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

// 高亮匹配文本
:deep(.highlight-match) {
  color: #009100 !important;
}

// 质量反馈弹窗
.feedback-popup {
  height: 583px;
  background: #f4f4f4;
  display: flex;
  flex-direction: column;

  .popup-header {
    padding-bottom: 12px;
    flex-shrink: 0;

    .search-box {
      display: flex;
      align-items: center;
      height: 30px;
      padding: 0 12px;
      background: rgba(216, 216, 216, 0.3);
      border-radius: 15px;
      gap: 8px;
    }

    .search-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      height: 30px;
      padding: 0;
      border: none;
      background: transparent;
      font-family: 'PingFang SC';
      font-size: 14px;
      outline: none;
      color: #191a1b;

      &::placeholder {
        color: #888888;
      }
    }

    .search-btn {
      padding: 4px 12px;
      width: 52px;
      height: 26px;
      background: #009100;
      color: #ffffff;
      border-radius: 15px;
      font-family: 'PingFang SC';
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  }

  .popup-refresh-list {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .feedback-select-item {
      background: #ffffff;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .feedback-serial {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
        padding-bottom: 12px;
        border-bottom: 0.5px solid #e6e6e5;
        margin-bottom: 12px;

        .date-part {
          color: #009100;
        }

      }

      .feedback-type {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
        margin-bottom: 4px;
      }

      .feedback-desc {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #545454;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
