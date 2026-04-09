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
    <div id="tab-basic" class="tab-content-section">
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
          <span class="info-value">{{ vehicleInfo.vehicleUse }}</span>
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
        <div class="vehicle-info-item" @click="warningExpanded = !warningExpanded">
          <span class="info-label">预警信息</span>
          <span class="info-value" :class="{ 'text-collapsed': !warningExpanded }">{{ vehicleInfo.warningInfo }}</span>
          <van-icon
            v-if="vehicleInfo.warningInfo && vehicleInfo.warningInfo.length > 20"
            :name="warningExpanded ? 'arrow-up' : 'arrow-down'"
            size="14"
            color="#888888"
          />
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
          autosize
          class="reason-textarea"
        />
      </div>
    </div>

    <!-- 项目零件区域 -->
    <div id="tab-parts" class="tab-content-section">
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
              <div class="repair-price">¥{{ item.price }}</div>
              <div class="repair-discount">优惠 ¥{{ item.discount }}</div>
            </div>
          </div>
          <div class="repair-item-bottom">
            <span class="repair-subtotal">¥{{ item.subtotal }}</span>
            <span class="repair-actual">实际领料 {{ item.actualQuantity }}</span>
            <span class="repair-return">退料 {{ item.returnQuantity }}</span>
            <span class="repair-quantity">x{{ item.quantity }}</span>
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
              <div class="parts-price">¥{{ item.price }}</div>
              <div class="parts-discount">优惠 ¥{{ item.discount }}</div>
            </div>
          </div>
          <div class="parts-item-bottom">
            <span class="parts-subtotal">¥{{ item.subtotal }}</span>
            <span class="parts-actual">实际领料 {{ item.actualQuantity }}</span>
            <span class="parts-return">退料 {{ item.returnQuantity }}</span>
            <span class="parts-quantity">x{{ item.quantity }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 附件信息区域 -->
    <div id="tab-attachments" class="tab-content-section">
      <div class="attachments-card">
        <div class="attachments-card-header">附件信息</div>

        <!-- 车辆信息 -->
        <div class="attachment-section">
          <div class="attachment-section-title">车辆信息</div>
          <div class="attachment-list">
            <div v-for="(img, index) in attachmentData.vehicle" :key="index" class="attachment-item">
              <img :src="img.url" class="attachment-img" />
              <div class="attachment-delete" @click="deleteAttachment('vehicle', index)">
                <van-icon name="cross" size="12" color="#ffffff" />
              </div>
            </div>
            <div class="attachment-upload" @click="uploadAttachment('vehicle')" v-if="attachmentData.vehicle.length < 3">
              <van-icon name="photograph" size="24" color="#d8d8d8" />
              <span class="upload-text">上传</span>
            </div>
          </div>
        </div>

        <!-- 行驶证 -->
        <div class="attachment-section">
          <div class="attachment-section-title">行驶证</div>
          <div class="attachment-list">
            <div v-for="(img, index) in attachmentData.license" :key="index" class="attachment-item">
              <img :src="img.url" class="attachment-img" />
              <div class="attachment-delete" @click="deleteAttachment('license', index)">
                <van-icon name="cross" size="12" color="#ffffff" />
              </div>
            </div>
            <div class="attachment-upload" @click="uploadAttachment('license')" v-if="attachmentData.license.length < 3">
              <van-icon name="photograph" size="24" color="#d8d8d8" />
              <span class="upload-text">上传</span>
            </div>
          </div>
        </div>

        <!-- 故障信息 -->
        <div class="attachment-section">
          <div class="attachment-section-title">故障信息</div>
          <div class="attachment-list">
            <div v-for="(img, index) in attachmentData.fault" :key="index" class="attachment-item">
              <img :src="img.url" class="attachment-img" />
              <div class="attachment-delete" @click="deleteAttachment('fault', index)">
                <van-icon name="cross" size="12" color="#ffffff" />
              </div>
            </div>
            <div class="attachment-upload" @click="uploadAttachment('fault')" v-if="attachmentData.fault.length < 3">
              <van-icon name="photograph" size="24" color="#d8d8d8" />
              <span class="upload-text">上传</span>
            </div>
          </div>
        </div>

        <!-- 终审权益 -->
        <div class="attachment-section">
          <div class="attachment-section-title">终审权益</div>
          <div class="attachment-list">
            <div v-for="(img, index) in attachmentData.finalRight" :key="index" class="attachment-item">
              <img :src="img.url" class="attachment-img" />
              <div class="attachment-delete" @click="deleteAttachment('finalRight', index)">
                <van-icon name="cross" size="12" color="#ffffff" />
              </div>
            </div>
            <div class="attachment-upload" @click="uploadAttachment('finalRight')" v-if="attachmentData.finalRight.length < 3">
              <van-icon name="photograph" size="24" color="#d8d8d8" />
              <span class="upload-text">上传</span>
            </div>
          </div>
        </div>

        <!-- 首保凭证 -->
        <div class="attachment-section">
          <div class="attachment-section-title">首保凭证</div>
          <div class="attachment-list">
            <div v-for="(img, index) in attachmentData.firstMaintain" :key="index" class="attachment-item">
              <img :src="img.url" class="attachment-img" />
              <div class="attachment-delete" @click="deleteAttachment('firstMaintain', index)">
                <van-icon name="cross" size="12" color="#ffffff" />
              </div>
            </div>
            <div class="attachment-upload" @click="uploadAttachment('firstMaintain')" v-if="attachmentData.firstMaintain.length < 3">
              <van-icon name="photograph" size="24" color="#d8d8d8" />
              <span class="upload-text">上传</span>
            </div>
          </div>
        </div>

        <!-- 保养质检 -->
        <div class="attachment-section">
          <div class="attachment-section-title">保养质检</div>
          <div class="attachment-list">
            <div v-for="(img, index) in attachmentData.maintainQuality" :key="index" class="attachment-item">
              <img :src="img.url" class="attachment-img" />
              <div class="attachment-delete" @click="deleteAttachment('maintainQuality', index)">
                <van-icon name="cross" size="12" color="#ffffff" />
              </div>
            </div>
            <div class="attachment-upload" @click="uploadAttachment('maintainQuality')" v-if="attachmentData.maintainQuality.length < 3">
              <van-icon name="photograph" size="24" color="#d8d8d8" />
              <span class="upload-text">上传</span>
            </div>
          </div>
        </div>

        <!-- 施工旧件 -->
        <div class="attachment-section">
          <div class="attachment-section-title">施工旧件</div>
          <div class="attachment-list">
            <div v-for="(img, index) in attachmentData.oldParts" :key="index" class="attachment-item">
              <img :src="img.url" class="attachment-img" />
              <div class="attachment-delete" @click="deleteAttachment('oldParts', index)">
                <van-icon name="cross" size="12" color="#ffffff" />
              </div>
            </div>
            <div class="attachment-upload" @click="uploadAttachment('oldParts')" v-if="attachmentData.oldParts.length < 3">
              <van-icon name="photograph" size="24" color="#d8d8d8" />
              <span class="upload-text">上传</span>
            </div>
          </div>
        </div>

        <!-- 旧件信息 -->
        <div class="attachment-section">
          <div class="attachment-section-title">旧件信息</div>
          <div class="attachment-list">
            <div v-for="(img, index) in attachmentData.oldPartInfo" :key="index" class="attachment-item">
              <img :src="img.url" class="attachment-img" />
              <div class="attachment-delete" @click="deleteAttachment('oldPartInfo', index)">
                <van-icon name="cross" size="12" color="#ffffff" />
              </div>
            </div>
            <div class="attachment-upload" @click="uploadAttachment('oldPartInfo')" v-if="attachmentData.oldPartInfo.length < 3">
              <van-icon name="photograph" size="24" color="#d8d8d8" />
              <span class="upload-text">上传</span>
            </div>
          </div>
        </div>

        <!-- 其他 -->
        <div class="attachment-section">
          <div class="attachment-section-title">其他</div>
          <div class="attachment-list">
            <div v-for="(img, index) in attachmentData.other" :key="index" class="attachment-item">
              <img :src="img.url" class="attachment-img" />
              <div class="attachment-delete" @click="deleteAttachment('other', index)">
                <van-icon name="cross" size="12" color="#ffffff" />
              </div>
            </div>
            <div class="attachment-upload" @click="uploadAttachment('other')" v-if="attachmentData.other.length < 3">
              <van-icon name="photograph" size="24" color="#d8d8d8" />
              <span class="upload-text">上传</span>
            </div>
          </div>
        </div>
      </div>
      <div style="height: 70vh"></div>
    </div>

    <!-- 底部提交按钮 -->
    <div class="bottom-action">
      <div class="submit-btn" @click="handleSubmit">
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
                placeholder="输入车牌号/VIN"
              />
              <div class="search-btn" @click="handleConstructionSearch">搜索</div>
            </div>
          </div>
          <RefreshList
            ref="constructionRefreshListRef"
            class="popup-refresh-list"
            :requestData="constructionRequestData"
            :has-no-data="constructionList.length === 0"
            @setData="setConstructionData"
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
                <div class="vehicle-tags" v-if="item.repairItemTypeDetailCollect">
                  <span class="vehicle-tag">{{ item.repairItemTypeDetailCollect }}</span>
                </div>
              </div>
              <div class="construction-vehicle-info">
                {{ item.vehModelName }} · {{ item.vehProfileVin }}
              </div>
              <div class="construction-detail">
                <div class="detail-row">
                  <span class="detail-label">送修人</span>
                  <span class="detail-value">{{ item.customerName }}</span>
                  <span v-if="item.customerType" class="customer-tag">{{ item.customerType }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">客户经理</span>
                  <span class="detail-value">{{ item.dedicatedServiceManager }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">预计交车</span>
                  <span class="detail-value">{{ item.expectFinishAt }}</span>
                </div>
              </div>
            </div>
          </RefreshList>
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
            @setData="setFeedbackData"
          >
            <div
              v-for="item in feedbackList"
              :key="item.id"
              class="feedback-select-item"
              @click="onFeedbackSelect(item)"
            >
              <div class="feedback-serial" v-html="highlightSearch(item.code, feedbackSearchText)"></div>
              <div class="feedback-type" v-if="item.reportType">{{ item.reportType }}</div>
              <div class="feedback-desc" v-if="item.customerContent">{{ item.customerContent }}</div>
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
import { getAppImg } from '@/libs/utils/nativeFn'

const router = useRouter()

const activeTab = ref('basic')
const tabsNavRef = ref(null)
const isHeaderVisible = ref(true)
const navBarHeight = ref(43)
const constructionRefreshListRef = ref(null)
const feedbackRefreshListRef = ref(null)

// Tab 配置
const tabs = [
  { name: 'basic', title: '基础信息' },
  { name: 'parts', title: '项目零件' },
  { name: 'attachments', title: '附件信息' }
]

// IntersectionObserver 实例
let headerObserver = null
let scrollContainer = null

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

onMounted(async() => {
  await nextTick()
  // 获取 nav-bar 的真实高度
  const navBarEl = document.querySelector('.base-container header')
  if (navBarEl) {
    navBarHeight.value = navBarEl.getBoundingClientRect().height
  }
  setupHeaderObserver()
  setupScrollListener()
})

onUnmounted(() => {
  if (headerObserver) {
    headerObserver.disconnect()
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
  const tabsNavEl = document.querySelector('.detail-tabs-nav')
  if (!tabsNavEl) return

  const currentScrollTop = getScrollTop()
  // 当滚动到顶部时，恢复 tab 导航栏初始样式
  if (currentScrollTop <= 0) {
    tabsNavEl.style.position = ''
    tabsNavEl.style.top = ''
    tabsNavEl.style.left = ''
    tabsNavEl.style.right = ''
    isHeaderVisible.value = true
  }

  // 根据滚动位置同步切换 tab
  syncTabByScroll()
}

// 根据滚动位置同步切换 tab
let lastScrollTop = 0
const scrollSyncTimeout = null
const syncTabByScroll = () => {
  const scrollTop = getScrollTop()
  const tabNavHeight = document.querySelector('.detail-tabs-nav')?.offsetHeight || 50
  const offset = navBarHeight.value + tabNavHeight + 20

  // 判断滚动方向
  const isScrollingDown = scrollTop > lastScrollTop
  lastScrollTop = scrollTop

  // 清除之前的定时器
  if (scrollSyncTimeout) {
    clearTimeout(scrollSyncTimeout)
  }

  // 找到当前应该激活的 tab
  let targetTab = null
  for (let i = tabs.length - 1; i >= 0; i--) {
    const tabEl = document.getElementById(`tab-${tabs[i].name}`)
    if (!tabEl) continue

    const tabTop = tabEl.offsetTop
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
  const tabsNavEl = document.querySelector('.detail-tabs-nav')
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

// 监听 header 可见性，控制 tab 导航栏是否 fixed
const setupHeaderObserver = () => {
  // 监听第一个内容区域的可见性
  const firstTabEl = document.getElementById('tab-basic')
  const tabsNavEl = document.querySelector('.detail-tabs-nav')
  if (!firstTabEl || !tabsNavEl) return

  headerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 第一个tab可见，tab导航栏在原位
          if (!isHeaderVisible.value) {
            tabsNavEl.style.position = ''
            tabsNavEl.style.top = ''
            tabsNavEl.style.left = ''
            tabsNavEl.style.right = ''
            isHeaderVisible.value = true
          }
        } else {
          // 第一个tab不可见，tab导航栏 fixed
          if (isHeaderVisible.value) {
            tabsNavEl.style.position = 'fixed'
            tabsNavEl.style.top = `${navBarHeight.value}px`
            tabsNavEl.style.left = '0'
            tabsNavEl.style.right = '0'
            isHeaderVisible.value = false
          }
        }
      })
    },
    {
      root: getScrollContainer(),
      threshold: 0
    }
  )

  headerObserver.observe(firstTabEl)
}

// 切换 Tab
const switchTab = async(tabName) => {
  activeTab.value = tabName
  const targetEl = document.getElementById(`tab-${tabName}`)
  if (!targetEl) return

  // Tab 导航栏始终是 fixed，直接滚动到目标位置
  const targetOffsetTop = targetEl.offsetTop
  const tabNavHeight = 42
  scrollToPosition(targetOffsetTop - navBarHeight.value - tabNavHeight, 'smooth')
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
  warningInfo: ''
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

// 施工单列表请求配置
const constructionRequestData = reactive({
  data: {
    pageNum: 1,
    pageSize: 10,
    appSearchKeyWord: ''
  },
  api: (params) => preAuthGetConstructionList(params)
})

// 设置施工单数据
const setConstructionData = (res) => {
  const list = res?.list || []
  if (res?.isRefresh) {
    constructionList.value = [...list]
  } else {
    constructionList.value.push(...list)
  }
}

const feedbackSearchText = ref('')
const feedbackList = ref([])

// 监听质量反馈搜索词变化，实时搜索
watch(feedbackSearchText, (newVal) => {
  feedbackRequestData.data = {
    pageNum: 1,
    pageSize: 10,
    appSearchKeyWord: newVal,
    _t: Date.now()
  }
})

// 质量反馈列表请求配置
const feedbackRequestData = reactive({
  data: {
    pageNum: 1,
    pageSize: 10,
    appSearchKeyWord: ''
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
  constructionRequestData.data = {
    pageNum: 1,
    pageSize: 10,
    appSearchKeyWord: constructionSearchText.value,
    _t: Date.now()
  }
}

// 质量反馈搜索按钮点击
const handleFeedbackSearch = () => {
  feedbackRequestData.data = {
    pageNum: 1,
    pageSize: 10,
    appSearchKeyWord: feedbackSearchText.value,
    _t: Date.now()
  }
}

// 获取单号前缀（ZLR-）
const getSerialPrefix = (serialNumber) => {
  return serialNumber.split('-')[0] + '-'
}

// 获取单号日期部分（绿色）
const getSerialDate = (serialNumber) => {
  const parts = serialNumber.split('-')
  return parts[1]?.substring(0, 4) || ''
}

// 获取单号剩余部分
const getSerialRest = (serialNumber) => {
  const parts = serialNumber.split('-')
  return parts[1]?.substring(4) || ''
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

// 提交申请
const handleSubmit = async() => {
  // 校验
  if (!constructionId.value) {
    showToast('请选择施工单')
    return
  }
  if (!feedbackId.value) {
    showToast('请选择质量反馈单号')
    return
  }
  if (!applyReason.value.trim()) {
    showToast('请填写申请原因')
    return
  }

  try {
    showLoadingToast({ message: '提交中...', forbidClick: true })

    const submitData = {
      serviceProxyId: constructionId.value,
      qualityOrderReportId: feedbackId.value,
      reason: applyReason.value,
      saveOrSubmit: true
    }

    const res = await preAuthAddOrUpdate(submitData)
    closeToast()

    if (res?.code === 0 || res?.code === 200) {
      showToast('提交成功')
      hasEdited.value = false
      router.back()
    } else {
      showToast(res?.msg || '提交失败')
    }
  } catch (error) {
    closeToast()
    console.error('提交失败:', error)
    showToast('提交失败，请稍后重试')
  }
}

// 方法
const openConstructionPicker = () => {
  constructionSearchText.value = ''
  constructionList.value = []
  showConstructionPicker.value = true
  // 触发重新查询 - 使用随机数强制刷新
  nextTick(() => {
    const timestamp = Date.now()
    constructionRequestData.data = {
      pageNum: 1,
      pageSize: 10,
      appSearchKeyWord: '',
      _t: timestamp
    }
  })
}

const openFeedbackPicker = () => {
  feedbackSearchText.value = ''
  feedbackList.value = []
  showFeedbackPicker.value = true
  // 触发重新查询 - 使用随机数强制刷新
  nextTick(() => {
    const timestamp = Date.now()
    feedbackRequestData.data = {
      pageNum: 1,
      pageSize: 10,
      appSearchKeyWord: '',
      _t: timestamp
    }
  })
}

const onAuthTypeChange = (type) => {
  authType.value = type
  showVehicleInfo.value = true
  hasEdited.value = true
}

const onConstructionSelect = async(item) => {
  console.log('施工单选中项:', item)
  constructionNo.value = item.code
  constructionId.value = item.id || item.serviceProxyId
  showConstructionPicker.value = false
  hasEdited.value = true
  showVehicleInfo.value = true

  // 直接从选中项展示车辆信息
  vehicleInfo.value = {
    vin: item.vehProfileVin || '--',
    warrantyTime: '--',
    mileage: item.mileage || '--',
    vehicleUse: item.carProperty || '--',
    lifetimeWarranty: '--',
    serviceStore: item.dealerName || '--',
    storeArea: item.orgName || item.dealerUnitName || '--',
    warningInfo: item.alarmInfo || '--'
  }

  // 调用API获取预填充详情
  try {
    showLoadingToast({ message: '加载中...', forbidClick: true })
    const res = await preAuthGetPreAuthInfoDetail(item.id)
    closeToast()

    if (res?.data) {
      const data = res.data
      // 更新车辆信息
      vehicleInfo.value = {
        vin: data.vehProfileVin || item.vehProfileVin || '',
        warrantyTime:
          data.guaranteeStartDate && data.warrantyEndTime
            ? `${data.guaranteeStartDate} 至 ${data.warrantyEndTime}`
            : '',
        mileage: data.mileage || item.mileage || '',
        vehicleUse: data.carProperty || item.carProperty || '',
        lifetimeWarranty: data.isLifetime === 1 ? '是' : '否',
        serviceStore: data.dealerName || item.dealerName || '',
        storeArea: data.orgName || data.dealerUnitName || item.orgName || item.dealerUnitName || '',
        warningInfo: data.alarmInfo || item.alarmInfo || '无'
      }
      // 预授权类型: 1=技术预授权, 2=保修预授权
      authType.value = data.preAuthType == 1 ? 'tech' : 'warranty'

      // 维修项目数据
      repairItems.value = (data.spRepairItemResps || []).map((item) => ({
        name: item.repairItemName || '',
        partNo: item.repairItemCode || '',
        type: item.repairItemTypeName || '',
        price: item.price || '0',
        discount: item.discountAmount || '0',
        subtotal: item.totalAmount || '0',
        quantity: item.quantity || '0',
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
        subtotal: item.totalAmount || '0',
        quantity: item.quantity || '0',
        actualQuantity: item.actualQuantity || '0',
        returnQuantity: item.returnQuantity || '0'
      }))

      showVehicleInfo.value = true
    }
  } catch (error) {
    closeToast()
    console.error('获取预填充信息失败:', error)
    showToast('获取信息失败')
    showVehicleInfo.value = true
  }
}

const onFeedbackSelect = (item) => {
  console.log('质量反馈选中项:', item)
  feedbackNo.value = item.code
  feedbackId.value = item.id || item.qualityOrderReportId || ''
  feedbackDesc.value = item.customerContent || ''
  feedbackProcess.value = item.diagnosisContent || ''
  showFeedbackPicker.value = false
  hasEdited.value = true
}

// 附件相关方法
const uploadAttachment = (type) => {
  getAppImg()
  hasEdited.value = true
}

const deleteAttachment = (type, index) => {
  attachmentData[type].splice(index, 1)
  hasEdited.value = true
}

const onSaveConfirm = async() => {
  // 校验
  if (!constructionId.value) {
    showToast('请选择施工单')
    return
  }
  if (!feedbackId.value) {
    showToast('请选择质量反馈单号')
    return
  }
  if (!applyReason.value.trim()) {
    showToast('请填写申请原因')
    return
  }

  showSaveConfirmDialog.value = false

  try {
    showLoadingToast({ message: '保存中...', forbidClick: true })

    const saveData = {
      serviceProxyId: constructionId.value,
      qualityOrderReportId: feedbackId.value,
      reason: applyReason.value,
      saveOrSubmit: false
    }
    console.log('保存草稿参数:', saveData)

    const res = await preAuthAddOrUpdate(saveData)
    closeToast()

    if (res?.code === 0 || res?.code === 200) {
      showToast('保存成功')
      hasEdited.value = false
      router.back()
    } else {
      showToast(res?.msg || '保存失败')
    }
  } catch (error) {
    closeToast()
    console.error('保存失败:', error)
    showToast('保存失败，请稍后重试')
  }
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
    // 没有编辑时返回 true，允许默认返回
    return true
  }
})
</script>

<style lang="scss" scoped>
.create-pre-auth {
  background: #f5f5f5;
  min-height: calc(100vh - 46px);
  padding-top: 56px;
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 100px;
}

// Tab 导航 - 固定在顶部
.detail-tabs-nav {
  background: #fff;
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid #eee;
  position: fixed;
  top: 43px;
  left: 0;
  right: 0;
  z-index: 100;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
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
      font-size: 12px;
      font-weight: 400;
      font-family: 'PingFang SC';

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
    padding: 15px 12px;
    border-bottom: 0.5px solid #e6e6e5;

    &:last-child {
      border-bottom: none;
    }

    .parts-item-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;

      .parts-item-left {
        .parts-item-top {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 2px;

          .parts-name {
            font-family: 'PingFang SC';
            font-size: 14px;
            font-weight: 500;
            color: #191a1b;
          }

          .parts-tag {
            font-family: 'PingFang SC';
            font-size: 12px;
            color: #191a1b;
            background: rgba(25, 26, 27, 0.06);
            padding: 1px 4px;
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
          color: #545454;
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
      padding-top: 4px;

      .parts-subtotal {
        font-family: 'PingFang SC';
        font-size: 12px;
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

    .info-label {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #545454;
      flex-shrink: 0;
    }

    .info-value {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
      flex-shrink: 0;

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

        .vehicle-tags {
          display: flex;
          gap: 4px;

          .vehicle-tag {
            font-family: 'PingFang SC';
            font-size: 12px;
            color: #191a1b;
            border: 0.5px solid #191a1b;
            border-radius: 4px;
            padding: 1px 4px;
          }
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
}

// 质量反馈报告卡片
.quality-feedback-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;

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
