<template>
  <div class="pre-auth-detail" :class="{ 'has-reject-reason': detail.status === 40 }">
    <!-- 加载状态 -->
    <div v-if="detailLoading" class="loading-overlay">
      <van-loading type="circular" color="#009100" />
      <span class="loading-text">加载中...</span>
    </div>

    <!-- 置顶区域：状态栏 + Tab 导航 -->
    <div class="sticky-header">
      <!-- 状态栏 -->
      <div class="status-bar">
        <div class="status-bar-content">
          <div class="status-info">
            <span class="status-label">编号：</span>
            <span class="status-value">{{ detail.code || '--' }}</span>
          </div>
          <span class="status-tag" :class="detail.statusClass">{{ detail.approvalStatusLabel }}</span>
        </div>
        <!-- 驳回原因 -->
        <div v-if="detail.status === 40" class="reject-reason">
          {{ detail.rejectReason || '--' }}
        </div>
      </div>

      <!-- Tab 导航 -->
      <div class="detail-tabs-nav">
        <div
          v-for="tab in tabs"
          :key="tab.name"
          :class="['tab-item', { active: activeTab == tab.name }]"
          @click="switchTab(tab.name)"
        >
          {{ tab.title }}
        </div>
      </div>
    </div>

    <!-- 基础信息 Tab -->
    <div id="tab-basic" class="tab-content-section">
      <!-- 接车施工单卡片 -->
      <div class="info-card">
        <div class="card-header">
          <span class="card-title">接车施工单</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">施工单号</span>
            <span class="info-value">{{ detail.constructionNo || '--' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">预授权类型</span>
            <span class="info-value">{{ detail.authType || '--' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">VIN</span>
            <span class="info-value">{{ detail.vin || '--' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">保修时间</span>
            <span class="info-value">{{ detail.warrantyTime || '--' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">进店里程</span>
            <span class="info-value">{{ detail.mileage ? `${detail.mileage}km` : '--' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">车辆用途</span>
            <span class="info-value">{{ detail.vehicleUse || '--' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">终身质保</span>
            <span class="info-value">{{ detail.lifetimeWarranty || '--' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">服务门店</span>
            <span class="info-value">{{ detail.serviceStore || '--' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">门店所属区域</span>
            <span class="info-value">{{ detail.storeArea || '--' }}</span>
          </div>
          <div class="info-row" @click="showWarningInfo">
            <span class="info-label">预警信息</span>
            <span class="info-value warning">
              {{ detail.warningInfo || '--' }}
              <van-icon name="arrow" size="12" color="#888888" />
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">预交时间</span>
            <span class="info-value">{{ detail.estimateDeliverTime || '--' }}</span>
          </div>
        </div>
      </div>

      <!-- 质量反馈报告卡片 -->
      <div v-if="detail.qualityReport" class="info-card">
        <div class="card-header">
          <span class="card-title">质量反馈报告</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">质量反馈单号</span>
            <span class="info-value">{{ detail.qualityReport?.reportNo || '--' }}</span>
          </div>
          <div class="info-row expandable" :class="{ expanded: faultDescExpanded }" @click="faultDescExpanded = !faultDescExpanded">
            <span class="info-label">故障现象描述</span>
            <span class="info-value" :class="{ collapsed: !faultDescExpanded }">{{ detail.qualityReport?.faultDesc || '--' }}</span>
            <van-icon name="arrow" size="12" color="#888888" class="arrow-icon" />
          </div>
          <div class="info-row expandable" :class="{ expanded: faultProcessExpanded }" @click="faultProcessExpanded = !faultProcessExpanded">
            <span class="info-label">故障排查流程</span>
            <span class="info-value" :class="{ collapsed: !faultProcessExpanded }">{{ detail.qualityReport?.faultProcess || '--' }}</span>
            <van-icon name="arrow" size="12" color="#888888" class="arrow-icon" />
          </div>
        </div>
      </div>

      <!-- 申请原因卡片 -->
      <div class="info-card">
        <div class="card-header">
          <span class="card-title">申请原因</span>
        </div>
        <div class="card-body">
          <div class="reason-content" :class="{ collapsed: !reasonExpanded }">
            {{ detail.applyReason || '--' }}
          </div>
          <div v-if="reasonNeedExpand" class="expand-btn" @click="reasonExpanded = !reasonExpanded">
            {{ reasonExpanded ? '收起' : '展开' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 项目零件 Tab -->
    <div id="tab-parts" class="tab-content-section">
      <!-- 维修项目卡片 -->
      <div class="info-card">
        <div class="card-header">
          <span class="card-title">维修项目</span>
        </div>
        <div class="card-body">
          <div
            v-for="(item, index) in detail.repairItems"
            :key="index"
            class="repair-item"
          >
            <div class="repair-item-left">
              <div class="repair-name">{{ item.name }}</div>
              <div class="repair-part-no">{{ item.partNo }}</div>
              <div class="repair-type">{{ item.type }}</div>
            </div>
            <div class="repair-item-right">
              <div class="repair-price">¥{{ item.price }}</div>
              <div class="repair-discount">优惠 ¥{{ item.discount }}</div>
            </div>
            <div class="repair-item-bottom">
              <span class="repair-subtotal">¥{{ item.subtotal }}</span>
              <span class="repair-quantity">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 维修配件卡片 -->
      <div class="info-card">
        <div class="card-header">
          <span class="card-title">维修配件</span>
        </div>
        <div class="card-body">
          <div
            v-for="(item, index) in detail.partsItems"
            :key="index"
            class="repair-item"
          >
            <div class="repair-item-left">
              <div class="repair-name-row">
                <span class="repair-name">{{ item.name }}</span>
                <span v-if="item.tag" class="parts-tag">{{ item.tag }}</span>
              </div>
              <div class="repair-part-no">{{ item.partNo }}</div>
              <div class="repair-type">{{ item.type }}</div>
            </div>
            <div class="repair-item-right">
              <div class="repair-price">¥{{ item.price }}</div>
              <div class="repair-discount">优惠 ¥{{ item.discount }}</div>
            </div>
            <div class="repair-item-bottom">
              <div class="repair-bottom-left">
                <span class="repair-subtotal">¥{{ item.subtotal }}</span>
                <span class="repair-actual">实际领料 {{ item.actualQuantity }}</span>
                <span class="repair-return">退料 {{ item.returnQuantity }}</span>
              </div>
              <span class="repair-quantity">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 附件信息 Tab -->
    <div id="tab-attachments" class="tab-content-section">
      <!-- 附件信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <span class="card-title">附件信息</span>
        </div>
        <div class="card-body">
          <div
            v-for="section in attachmentSections"
            :key="section.key"
            class="attachments-section"
          >
            <div class="attachments-section-title">{{ section.label }}</div>
            <div class="attachments-image-list">
              <div
                v-for="(img, index) in detail.attachments[section.key]"
                :key="img.fileId || index"
                class="attachments-image-item"
              >
                <img :src="img.url" class="attached-img" />
              </div>
              <div
                v-if="detail.attachments[section.key].length < MAX_ATTACHMENT_COUNT"
                class="attachments-upload-item"
                @click="uploadAttachment(section.key)"
              >
                <van-icon name="photograph" size="24" color="#d8d8d8" />
                <span class="attachments-upload-text">上传</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 审核信息 Tab (仅驳回状态显示) -->
    <div v-if="detail.status === 40" id="tab-audit" class="tab-content-section">
      <!-- 审核信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <span class="card-title">审核信息</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">施工单号</span>
            <span class="info-value">{{ detail.constructionNo || '--' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">同意工时索赔小计</span>
            <span class="info-value">{{ detail.auditInfo?.laborSubtotal ? `¥${detail.auditInfo.laborSubtotal}` : '--' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">同意零件索赔小计</span>
            <span class="info-value">{{ detail.auditInfo?.partsSubtotal ? `¥${detail.auditInfo.partsSubtotal}` : '--' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">同意其他索赔小计</span>
            <span class="info-value">{{ detail.auditInfo?.otherSubtotal ? `¥${detail.auditInfo.otherSubtotal}` : '--' }}</span>
          </div>

          <!-- 分隔线 -->
          <div class="audit-divider"></div>

          <!-- 审核记录 -->
          <div class="audit-records-title">审核记录</div>
          <div class="audit-records-list">
            <div v-for="(record, index) in detail.auditRecords" :key="index" class="audit-record-item">
              <div class="audit-record-header">
                <span class="audit-time">{{ record.time }}</span>
                <span class="audit-status" :class="record.status">{{ record.statusText }}</span>
              </div>
              <div class="audit-record-content">
                <p class="audit-comment">{{ record.comment }}</p>
                <div v-if="record.images && record.images.length > 0" class="audit-images">
                  <div v-for="(img, imgIndex) in record.images" :key="imgIndex" class="audit-image-item">
                    <img :src="img" class="audit-img" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="height: 50vh;"></div>
    <!-- 底部审核按钮 (仅审批中状态显示) -->
    <div v-if="detail.status === 20" class="bottom-actions">
      <div class="action-btn audit" @click="handleAudit">审核</div>
    </div>

    <!-- 审核弹窗 -->
    <ais-popup v-model:show="showAuditPopup" title="审核">
      <template #content>
        <div class="audit-popup-content">
          <!-- 审核结果 -->
          <div class="audit-result-section">
            <div class="audit-section-title">审核结果</div>
            <div class="audit-result-options">
              <div
                v-for="option in auditOptions"
                :key="option.value"
                :class="['audit-result-option', { active: auditResult === option.value }]"
                @click="auditResult = option.value"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
          <!-- 错误内容（审批驳回时显示） -->
          <div v-if="isReject" class="audit-error-code-section">
            <div class="audit-error-code-header" @click="openErrorCodePopup">
              <span class="audit-error-code-title">错误内容<span class="required">*</span></span>
              <div class="audit-error-code-selector">
                <span :class="['audit-error-code-text', { placeholder: !selectedErrorCode }]">
                  {{ selectedErrorCode || '请选择' }}
                </span>
                <van-icon name="arrow" class="audit-error-code-arrow" />
              </div>
            </div>
          </div>
          <!-- 审批意见 -->
          <div class="audit-remark-section">
            <div class="audit-section-title">审批意见</div>
            <div class="audit-remark-input-wrapper">
              <textarea
                v-model="auditRemark"
                class="audit-remark-input"
                placeholder="请输入（最多500字）"
                rows="4"
                maxlength="500"
              ></textarea>
              <div class="audit-remark-count">{{ auditRemark.length }}/500</div>
            </div>
          </div>
          <!-- 附件信息（审批驳回时显示） -->
          <div v-if="isReject" class="audit-attachment-section">
            <div class="audit-section-title">附件信息</div>
            <div class="audit-attachment-list">
              <div v-for="(img, index) in attachmentList" :key="index" class="audit-attachment-item">
                <img :src="img" class="attachment-img" />
                <van-icon name="close" class="attachment-delete" @click="removeAttachment(index)" />
              </div>
              <div v-if="attachmentList.length < 5" class="audit-attachment-upload" @click="handleUploadAttachment">
                <div class="audit-attachment-icon">
                  <van-icon name="photograph" />
                </div>
                <span class="audit-attachment-text">上传</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="audit-submit-btn" :class="{ disabled: !canSubmit }" @click="handleAuditSubmit">
          提交
        </div>
      </template>
    </ais-popup>

    <!-- 错误代码选择弹窗 -->
    <ais-popup v-model:show="showErrorCodePopup" title="选择错误内容">
      <template #content>
        <div class="error-code-list-wrapper">
          <van-list
            v-model:loading="errorCodeLoading"
            :finished="errorCodeFinished"
            finished-text="没有更多了"
            @load="onErrorCodeLoad"
          >
            <div
              v-for="option in errorCodeOptions"
              :key="option.value"
              :class="['error-code-item', { active: selectedErrorCode === option.label }]"
              @click="selectErrorCode(option)"
            >
              <span class="error-code-label">{{ option.label }}</span>
              <van-icon v-if="selectedErrorCode === option.label" name="success" class="error-code-check" />
            </div>
          </van-list>
        </div>
      </template>
    </ais-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import AisPopup from '@/components/AisPopup.vue'
import { preAuthGet, preAuthAudit, preAuthGetErrorCodeList } from '@/api/authorization'
import { bindFile, getAttachmentList, uploadFileByUrl } from '@/libs/api/fileConfig'
import { getAppImg } from '@/libs/utils/nativeFn'

const route = useRoute()
const PRE_AUTH_ATTACHMENT_CONFIG_CODE = 'mcs_preauth'
const MAX_ATTACHMENT_COUNT = 3
const attachmentSections = [
  { key: 'vehicle', label: '车辆信息' },
  { key: 'license', label: '行驶证' },
  { key: 'fault', label: '故障信息' },
  { key: 'finalRight', label: '终审权益' },
  { key: 'firstMaintain', label: '首保凭证' },
  { key: 'maintainQuality', label: '保养质检' },
  { key: 'oldParts', label: '施工旧件' },
  { key: 'oldPartInfo', label: '旧件信息' },
  { key: 'other', label: '其他' }
]

const activeTab = ref('basic')
const faultDescExpanded = ref(false)
const faultProcessExpanded = ref(false)
const reasonExpanded = ref(false)
const reasonNeedExpand = ref(true)
const isClickScrolling = ref(false) // 标记是否点击触发的滚动
const showAuditPopup = ref(false) // 审核弹窗显示状态
const showErrorCodePopup = ref(false) // 错误代码选择弹窗显示状态
const auditResult = ref('') // 审批结果
const auditRemark = ref('') // 审批意见
const selectedErrorCode = ref('') // 选中的错误代码
const selectedErrorCodeValue = ref('') // 选中的错误代码值
const attachmentList = ref([]) // 附件列表
const detailLoading = ref(false) // 详情加载状态
const errorCodeOptions = ref([]) // 错误代码选项列表
const errorCodeLoading = ref(false) // 错误代码加载状态
const errorCodeFinished = ref(false) // 错误代码是否加载完成
const errorCodePageNum = ref(1) // 错误代码当前页码
const errorCodePageSize = 10 // 错误代码每页条数
const currentUploadType = ref('')
const isUploadingAttachment = ref(false)
const auditOptions = [
  { label: '审批通过', value: 'approve' },
  { label: '审批驳回', value: 'reject' },
  { label: '拒绝申请', value: 'refuse' }
]

// 是否为审批驳回
const isReject = computed(() => {
  return auditResult.value === 'reject'
})

// 是否可以提交
const canSubmit = computed(() => {
  // 必须选择审批结果
  if (!auditResult.value) {
    return false
  }
  // 审批通过：无需其他必填项
  if (auditResult.value === 'approve') {
    return true
  }
  // 审批驳回：错误代码必填，审批意见最大500字
  if (auditResult.value === 'reject') {
    return selectedErrorCode.value && auditRemark.value.trim().length <= 500
  }
  // 拒绝申请：审批意见最大500字
  if (auditResult.value === 'refuse') {
    return auditRemark.value.trim().length <= 500
  }
  return false
})

// Tab 配置
const tabs = ref([
  { name: 'basic', title: '基础信息' },
  { name: 'parts', title: '项目零件' },
  { name: 'attachments', title: '附件信息' }
])

// IntersectionObserver 实例
let scrollContainer = null
const buildEmptyAttachments = () => attachmentSections.reduce((acc, item) => {
  acc[item.key] = []
  return acc
}, {})

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
    window.scrollTo({ top: targetScrollTop, behavior })
  } else {
    container.scrollTo({ top: targetScrollTop, behavior })
  }
}

// 根据状态动态添加审核信息tab
const updateTabsByStatus = () => {
  const hasAuditTab = tabs.value.some(tab => tab.name === 'audit')
  if (detail.value.status === 40 && !hasAuditTab) {
    tabs.value.push({ name: 'audit', title: '审核信息' })
  } else if (detail.value.status !== 40 && hasAuditTab) {
    tabs.value = tabs.value.filter(tab => tab.name !== 'audit')
  }
}

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
  // 只有非点击触发的滚动才移除 active-section 类，并同步切换 tab
  if (!isClickScrolling.value) {
    document.querySelectorAll('.tab-content-section').forEach(el => {
      el.classList.remove('active-section')
    })
    // 根据滚动位置同步切换 tab
    syncTabByScroll()
  }
}

/**
 * 获取 sticky-header 的实际高度
 */
const getStickyHeaderHeight = () => {
  const stickyHeader = document.querySelector('.sticky-header')
  if (stickyHeader) {
    return stickyHeader.offsetHeight
  }
  return 88 // 默认值
}

// 根据滚动位置同步切换 tab
let lastScrollTop = 0
let scrollSyncTimeout = null
const syncTabByScroll = () => {
  const scrollTop = getScrollTop()
  const stickyHeaderHeight = getStickyHeaderHeight()
  const offset = stickyHeaderHeight + 20

  // 判断滚动方向
  const isScrollingDown = scrollTop > lastScrollTop
  lastScrollTop = scrollTop

  // 清除之前的定时器
  if (scrollSyncTimeout) {
    clearTimeout(scrollSyncTimeout)
  }

  // 找到当前应该激活的 tab
  let targetTab = null
  const tabList = tabs.value
  for (let i = tabList.length - 1; i >= 0; i--) {
    const tabEl = document.getElementById(`tab-${tabList[i].name}`)
    if (!tabEl) continue

    const tabTop = tabEl.offsetTop
    if (scrollTop + offset >= tabTop) {
      targetTab = tabList[i].name
      break
    }
  }

  // 如果目标 tab 和当前 tab 不同，更新
  if (targetTab !== null && targetTab !== activeTab.value) {
    if (isScrollingDown) {
      activeTab.value = targetTab
    } else {
      scrollSyncTimeout = setTimeout(() => {
        activeTab.value = targetTab
      }, 10)
    }
  }
}

// 详情数据
const detail = ref({
  code: '',
  status: 0,
  approvalStatusLabel: '',
  statusClass: '',
  rejectReason: '',
  constructionNo: '',
  authType: '',
  vin: '',
  warrantyTime: '',
  mileage: '',
  vehicleUse: '',
  lifetimeWarranty: '',
  serviceStore: '',
  storeArea: '',
  warningInfo: '',
  applyReason: '',
  estimateDeliverTime: '',
  qualityReport: null,
  auditInfo: {},
  auditRecords: [],
  repairItems: [],
  partsItems: [],
  attachments: buildEmptyAttachments()
})

// 切换 Tab
const switchTab = async(tabName) => {
  activeTab.value = tabName
  const targetEl = document.getElementById(`tab-${tabName}`)
  if (!targetEl) return

  const stickyHeaderHeight = getStickyHeaderHeight() // 状态栏 + Tab导航实际高度

  // 标记为点击触发的滚动
  isClickScrolling.value = true

  // 给目标 section 添加 active-section 类，增加顶部间距
  document.querySelectorAll('.tab-content-section').forEach(el => {
    el.classList.remove('active-section')
  })
  targetEl.classList.add('active-section')

  // 强制同步更新 DOM
  await nextTick()

  // 计算目标滚动位置
  // offsetTop 包含了 active-section 添加的 36px padding，所以直接用 offsetTop - stickyHeaderHeight
  const targetOffsetTop = targetEl.offsetTop
  const finalScrollTop = Math.max(0, targetOffsetTop - stickyHeaderHeight)

  // 使用 scrollTo 并监听滚动结束事件
  const container = getScrollContainer()
  let scrollEndTimer = null
  const onScrollEnd = () => {
    if (scrollEndTimer) clearTimeout(scrollEndTimer)
    scrollEndTimer = setTimeout(() => {
      container.removeEventListener('scroll', onScrollEnd)
      isClickScrolling.value = false
    }, 150)
  }

  container.addEventListener('scroll', onScrollEnd)
  scrollToPosition(finalScrollTop, 'smooth')
}

// 查看预警信息
const showWarningInfo = () => {
  showToast('查看预警信息')
}

// 审核操作
const handleAudit = () => {
  showAuditPopup.value = true
  // 重置审核状态
  auditResult.value = ''
  auditRemark.value = ''
  selectedErrorCode.value = ''
  selectedErrorCodeValue.value = ''
  attachmentList.value = []
}

// 审核状态映射
const auditStatusMap = {
  approve: 30, // 审批通过
  reject: 40, // 审批驳回
  refuse: 70 // 拒绝申请
}

const handleAuditSubmit = async() => {
  if (!canSubmit.value) return

  const id = route.params.id
  if (!id) {
    showToast('缺少预授权ID')
    return
  }

  // 构建请求参数
  const params = {
    id: id,
    auditStaus: auditStatusMap[auditResult.value],
    auditContent: auditRemark.value.trim()
  }

  // 审批驳回时需要错误代码
  if (auditResult.value === 'reject') {
    params.preAuthRuleCodeId = selectedErrorCodeValue.value
    // 附件（审批驳回时必传，空数组或有数据都可以）
    params.attachments = attachmentList.value.map(item => ({
      fileId: item.fileId,
      businessId: item.businessId,
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      fileSize: item.fileSize,
      fileType: item.fileType,
      attachType: item.attachType,
      configId: item.configId,
      configCode: item.configCode
    }))
  }

  try {
    const res = await preAuthAudit(params)
    if (res.code === 200) {
      showToast(auditResult.value === 'approve' ? '审批通过' : auditResult.value === 'reject' ? '审批驳回' : '拒绝申请')
      showAuditPopup.value = false
      // 刷新详情
      fetchDetail()
    } else {
      showToast(res.msg || '操作失败')
    }
  } catch (error) {
    console.error('审核提交失败:', error)
    showToast('操作失败')
  }
}

// 选择错误代码
const selectErrorCode = (option) => {
  selectedErrorCode.value = option.label
  selectedErrorCodeValue.value = option.value
  showErrorCodePopup.value = false
}

// 打开错误代码弹窗
const openErrorCodePopup = () => {
  showErrorCodePopup.value = true
  // 弹窗打开后重置并加载数据
  nextTick(() => {
    resetErrorCodeList()
    fetchErrorCodeList()
  })
}

// 上传附件
const handleUploadAttachment = () => {
  // TODO: 调用图片上传接口
  // 限制：最大30M，最多5个
  if (attachmentList.value.length >= 5) {
    showToast('最多上传5个附件')
    return
  }
  showToast('上传附件')
}

const isSuccessResponse = (res) => res?.code === 0 || res?.code === 200

const getAttachmentTypeLabel = (type) => {
  return attachmentSections.find(item => item.key === type)?.label || ''
}

const normalizeAttachmentItem = (item) => ({
  ...item,
  url: item.fileUrl || item.url || ''
})

const getFileNameFromUrl = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return ''
  const segments = fileUrl.split(/[\\/]/)
  return segments[segments.length - 1] || ''
}

const normalizeUploadResult = (res, fileUrl) => {
  const data = Array.isArray(res?.data) ? res.data[0] : (res?.data || {})
  const fallbackFileName = getFileNameFromUrl(fileUrl)
  const fallbackFileType = fallbackFileName.includes('.') ? fallbackFileName.split('.').pop() : ''

  return {
    fileId: data.fileId || data.id || '',
    fileName: data.fileName || data.filename || data.name || fallbackFileName,
    fileUrl: data.url || fileUrl,
    fileSize: data.fileSize || data.size || 0,
    fileType: data.fileType || data.ext || fallbackFileType
  }
}

const fetchAttachmentListByType = async(type) => {
  const businessId = route.params.id
  const attachType = getAttachmentTypeLabel(type)
  if (!businessId || !attachType) return

  const res = await getAttachmentList({
    businessId,
    attachType
  })

  if (!isSuccessResponse(res)) {
    throw new Error(res?.msg || '获取附件列表失败')
  }

  const data = res?.data
  const list = Array.isArray(data) ? data : (data?.records || data?.list || [])
  detail.value.attachments[type] = list.map(normalizeAttachmentItem)
}

const fetchAllAttachmentLists = async() => {
  const tasks = attachmentSections.map(async(section) => {
    try {
      await fetchAttachmentListByType(section.key)
    } catch (error) {
      console.error(`获取${section.label}失败:`, error)
      detail.value.attachments[section.key] = []
    }
  })

  await Promise.all(tasks)
}

const uploadAttachment = (type) => {
  const currentList = detail.value.attachments[type] || []
  if (currentList.length >= MAX_ATTACHMENT_COUNT) {
    showToast(`最多上传${MAX_ATTACHMENT_COUNT}个附件`)
    return
  }
  currentUploadType.value = type
  getAppImg()
}

const handleNativeImage = async(rawFileUrl) => {
  const uploadType = currentUploadType.value
  const businessId = route.params.id
  const fileUrl = typeof rawFileUrl === 'string'
    ? rawFileUrl
    : rawFileUrl?.fileUrl || rawFileUrl?.url || ''

  currentUploadType.value = ''

  if (!uploadType) return
  if (!businessId) {
    showToast('缺少预授权ID')
    return
  }
  if (!fileUrl) {
    showToast('未获取到图片地址')
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

    const uploadRes = await uploadFileByUrl([{
      fileUrl,
      businessId,
      configCode: PRE_AUTH_ATTACHMENT_CONFIG_CODE,
      attachType
    }])

    if (!isSuccessResponse(uploadRes)) {
      closeToast()
      showToast(uploadRes?.msg || '上传失败')
      return
    }

    const fileData = normalizeUploadResult(uploadRes, fileUrl)
    const bindRes = await bindFile({
      ...fileData,
      businessId,
      attachType,
      configCode: PRE_AUTH_ATTACHMENT_CONFIG_CODE
    })

    if (!isSuccessResponse(bindRes)) {
      closeToast()
      showToast(bindRes?.msg || '附件绑定失败')
      return
    }

    await fetchAttachmentListByType(uploadType)
    closeToast()
    showToast('上传成功')
  } catch (error) {
    closeToast()
    console.error('上传附件失败:', error)
    showToast('上传失败，请稍后重试')
  } finally {
    isUploadingAttachment.value = false
  }
}

// 删除附件
const removeAttachment = (index) => {
  attachmentList.value.splice(index, 1)
}

// 获取错误代码列表
const fetchErrorCodeList = async() => {
  if (errorCodeFinished.value) return

  errorCodeLoading.value = true
  try {
    const res = await preAuthGetErrorCodeList({
      pageNum: errorCodePageNum.value,
      pageSize: errorCodePageSize
    })
    console.log('错误代码列表返回:', res)
    if (res.code === 200 && res.data) {
      const list = res.data?.map(item => ({
        label: item.content,
        value: item.id
      })) || []

      errorCodeOptions.value = [...errorCodeOptions.value, ...list]
      console.log('当前错误代码列表:', errorCodeOptions.value)

      // 判断是否还有更多数据
      if (list.length === 0 || list.length < errorCodePageSize) {
        errorCodeFinished.value = true
      } else {
        errorCodePageNum.value++
      }
    } else {
      errorCodeFinished.value = true
    }
  } catch (error) {
    console.error('获取错误代码列表失败:', error)
    errorCodeFinished.value = true
  } finally {
    errorCodeLoading.value = false
  }
}

// 错误代码滚动加载
const onErrorCodeLoad = () => {
  fetchErrorCodeList()
}

// 重置错误代码列表
const resetErrorCodeList = () => {
  errorCodeOptions.value = []
  errorCodePageNum.value = 1
  errorCodeFinished.value = false
  errorCodeLoading.value = true // 设为 true 阻止 van-list 自动触发
}

// 获取详情数据
const fetchDetail = async() => {
  const id = route.params.id
  if (!id) {
    showToast('缺少预授权ID')
    return
  }

  detailLoading.value = true
  try {
    const res = await preAuthGet(id)
    if (isSuccessResponse(res) && res.data) {
      Object.assign(detail.value, formatDetailData(res.data))
      await fetchAllAttachmentLists()
      updateTabsByStatus()
    } else {
      showToast(res.msg || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  } finally {
    detailLoading.value = false
  }
}

// 格式化详情数据
const formatDetailData = (data) => {
  // 从 data 中获取预授权主数据
  const preAuthData = data || {}
  // 从 serviceProxyResp 中获取施工单数据
  const serviceProxy = data.serviceProxyResp || {}

  return {
    // 基础信息 - 来自预授权主数据
    code: preAuthData.code || '',
    status: preAuthData.approvalStatus,
    approvalStatusLabel: preAuthData.approvalStatusLabel || '',
    statusClass: getStatusClass(preAuthData.approvalStatus),
    rejectReason: preAuthData.rejectReason || '',
    // 施工单信息 - 来自施工单数据
    constructionNo: serviceProxy.code || '',
    // 预授权类型 - 来自预授权主数据
    authType: preAuthData.preAuthTypeLabel || '',
    // VIN - 来自预授权主数据
    vin: preAuthData.vehProfileVin || '',
    // 保修时间 - 来自施工单数据
    warrantyTime: serviceProxy.startWarrantyDate || '',
    // 进店里程 - 来自施工单数据
    mileage: serviceProxy.mileage || '',
    // 车辆用途 - 来自预授权主数据
    vehicleUse: preAuthData.carPropertyLabel || '',
    // 终身质保 - 来自预授权主数据
    lifetimeWarranty: preAuthData.isLifetimeLabel || '',
    // 服务门店 - 来自预授权主数据
    serviceStore: preAuthData.dealerName || '',
    // 门店所属区域 - 来自预授权主数据
    storeArea: preAuthData.dealerUnitName || '',
    // 预警信息 - 来自预授权主数据
    warningInfo: preAuthData.alarmInfo || '',
    // 申请原因 - 来自预授权主数据
    applyReason: preAuthData.reason || '',
    // 预交时间 - 来自施工单数据
    estimateDeliverTime: serviceProxy.expectFinishAt || '',

    // 质量反馈报告 - 来自预授权主数据
    qualityReport: preAuthData.qualityOrderReportResp ? {
      reportNo: preAuthData.qualityOrderReportResp.code || '',
      faultDesc: preAuthData.qualityOrderReportResp.customerContent || '',
      faultProcess: preAuthData.qualityOrderReportResp.troubleshootingProcess || ''
    } : null,

    // 审核信息 - 来自预授权主数据
    auditInfo: {
      auditor: preAuthData.approver || '',
      auditTime: preAuthData.approvalOn || '',
      laborSubtotal: preAuthData.approvedLaborClaimTotal || '',
      partsSubtotal: preAuthData.approvedPartsClaimTotal || '',
      otherSubtotal: preAuthData.approvedOtherClaimTotal || ''
    },

    // 审核记录 - 来自预授权主数据
    auditRecords: (preAuthData.supportApprovalResps || []).map(item => ({
      time: item.approvalOn || '',
      status: item.approvalResult,
      statusText: item.approvalResultLabel || '',
      comment: item.content || '',
      images: []
    })),

    // 维修项目 - 来自预授权主数据
    repairItems: (preAuthData.spRepairItemResps || []).map(item => ({
      name: item.repairItemName || '',
      partNo: item.repairItemCode || '',
      type: item.repairItemTypeName || '',
      price: item.price || '0',
      discount: item.discountAmount || '0',
      subtotal: item.repairAmount || '0',
      quantity: item.workHour || '0'
    })),

    // 维修配件 - 来自预授权主数据
    partsItems: (preAuthData.spSparePartResps || []).map(item => ({
      name: item.partsName || '',
      partNo: item.partsCode || '',
      type: item.repairItemTypeName || '',
      tag: item.isOemPartLabel || '',
      price: item.price || '0',
      discount: item.discountAmount || '0',
      subtotal: item.partsAmount || '0',
      quantity: item.quantity || '0',
      actualQuantity: item.actualPickNumber || '0',
      returnQuantity: item.refundedNumber || '0'
    })),
    attachments: buildEmptyAttachments()
  }
}

// 获取状态样式类 (approvalStatus: 10-未提交, 20-审批中, 30-已通过, 40-已驳回, 50-已作废)
const getStatusClass = (status) => {
  switch (status) {
    case 10: return 'status-pending'
    case 20: return 'status-audit'
    case 30: return 'status-approved'
    case 40: return 'status-rejected'
    case 50: return 'status-rejected'
    default: return ''
  }
}

onMounted(() => {
  window.getImage = handleNativeImage
  console.log('预授权详情页加载，ID:', route.params.id)
  fetchDetail()

  nextTick(() => {
    setupScrollListener()
  })
})

onUnmounted(() => {
  if (window.getImage === handleNativeImage) {
    window.getImage = null
  }
  const container = getScrollContainer()
  if (container === window) {
    window.removeEventListener('scroll', handleScroll)
  } else if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style lang="scss" scoped>
.pre-auth-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(76px + env(safe-area-inset-bottom));
  padding-top: 84px;

  &.has-reject-reason {
    padding-top: 137px;
  }
}

// 加载状态
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 9999;

  .loading-text {
    font-size: 14px;
    color: #666;
  }
}

// 置顶区域容器
.sticky-header {
  position: fixed;
  top: 42px;
  left: 0;
  right: 0;
  z-index: 100;
  background: #f5f5f5;
}

// 状态栏
.status-bar {
  background: #ffffff;
  padding: 10px 12px;

  .status-bar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 4px;

    .status-label {
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
    }

    .status-value {
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
    }
  }

  .status-tag {
    font-family: 'PingFang SC';
    font-size: 12px;
    font-weight: 500;

    &.status-pending {
      color: #c8a12b;
    }

    &.status-approved {
      color: #009100;
    }

    &.status-audit {
      color: #c8a12b;
    }

    &.status-rejected {
      color: #b91919;
    }
  }

  // 驳回原因
  .reject-reason {
    margin-top: 10px;
    padding: 12px;
    background: #f8e8e8;
    border: 1px solid rgba(185, 25, 25, 0.5);
    border-radius: 6px;
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #b91919;
    line-height: 1.5;
  }
}

// Tab 导航
.detail-tabs-nav {
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 0 12px;
  border-bottom: 1px solid #eee;
  height: 44px;
  align-items: center;

  .tab-item {
    flex: 0 0 auto;
    text-align: center;
    padding: 10px 0;
    margin: 0 12px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    position: relative;
    cursor: pointer;
    transition: color 0.2s;
    white-space: nowrap;

    &.active {
      color: #009100;

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

// 内容区域
.tab-content-section {
  padding: 0 12px;

  &.active-section {
    padding-top: 36px;
  }
}

// 信息卡片
.info-card {
  margin-top: 12px;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;

  .card-header {
    padding: 4px 12px;

    .card-title {
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
    }
  }

  .card-body {
    padding: 4px 12px 12px;
  }
}

// 信息行
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;

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
    text-align: right;
    flex: 1;
    margin-left: 16px;
    width: 196px;

    &.warning {
      color: #ee0a24;
    }

    &.collapsed {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

// 可展开的行
.info-row.expandable {
  .info-value {
    margin-left: 12px;
    width: 196px;
  }

  .arrow-icon {
    flex-shrink: 0;
    transform: rotate(90deg);
    transition: transform 0.2s;
  }

  &.expanded .arrow-icon {
    transform: rotate(-90deg);
  }
}

.warning-row {
  .info-value {
    color: #ee0a24;
  }
}

.reason-content {
  font-family: 'PingFang SC';
  font-size: 14px;
  color: #191a1b;
  line-height: 1.6;
  padding: 8px 0;

  &.collapsed {
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 展开按钮
.expand-btn {
  font-family: 'PingFang SC';
  font-size: 14px;
  color: #009100;
  padding: 8px 0;
}

// 维修项目
.repair-item {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  border-bottom: 0.5px solid #e6e6e5;

  &:last-child {
    border-bottom: none;
  }

  .repair-item-left {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .repair-name-row {
      display: flex;
      align-items: center;
      gap: 8px;

      .repair-name {
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

    .repair-part-no {
      font-family: 'PingFang SC';
      font-size: 12px;
      color: #545454;
    }

    .repair-type {
      font-family: 'PingFang SC';
      font-size: 12px;
      color: #545454;
    }
  }

  .repair-item-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-top: -40px;

    .repair-price {
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
    }

    .repair-discount {
      font-family: 'PingFang SC';
      font-size: 12px;
      color: #545454;
    }
  }

  .repair-item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;

    .repair-bottom-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .repair-subtotal {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
      }

      .repair-actual,
      .repair-return {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
      }
    }

    .repair-quantity {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
    }
  }
}

// 项目行
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 0.5px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .item-info {
    flex: 1;

    .item-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .item-name {
        font-family: 'PingFang SC';
        font-size: 14px;
        font-weight: 500;
        color: #191a1b;
      }

      .item-tag {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #009100;
        background: rgba(0, 145, 0, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
      }
    }

    .item-desc {
      font-family: 'PingFang SC';
      font-size: 12px;
      color: #545454;
      margin-bottom: 4px;
    }

    .item-sub {
      font-family: 'PingFang SC';
      font-size: 12px;
      color: #888888;

      span {
        margin-right: 12px;
      }
    }
  }

  .item-price {
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
  }
}

// 图片列表
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;

  .image-item {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;

    .attached-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .no-image {
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #888888;
    line-height: 80px;
    text-align: center;
    width: 100%;
  }
}

// 附件信息标题
.attachments-header {
  background: #ffffff;
  padding: 12px 12px 0;
  border-radius: 6px 6px 0 0;
  font-family: 'PingFang SC';
  font-size: 14px;
  font-weight: 500;
  color: #191a1b;
}

// 附件信息容器
.attachments-wrapper {
  background: #ffffff;
  padding: 12px;
  border-radius: 0 0 6px 6px;
  margin-bottom: 12px;
}

// 附件 section
.attachments-section {
  & + .attachments-section {
    margin-top: 12px;
  }

  .attachments-section-title {
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #191a1b;
    padding-bottom: 8px;
  }
}

// 附件图片列表
.attachments-image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .attachments-image-item {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;

    .attached-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .attachments-upload-item {
    width: 80px;
    height: 80px;
    border: 1px dashed #d8d8d8;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fafafa;

    .attachments-upload-text {
      margin-top: 6px;
      font-family: 'PingFang SC';
      font-size: 12px;
      color: #999999;
    }
  }

  .no-image {
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #888888;
    line-height: 80px;
    text-align: center;
    width: 100%;
  }
}

// 审核记录
// 审核记录
.audit-divider {
  height: 2px;
  border-bottom: 0.5px solid #e6e6e5;
  margin: 12px 0;
}

.audit-records-title {
  font-family: 'PingFang SC';
  font-size: 14px;
  color: #191a1b;
  margin-bottom: 12px;
}

.audit-records-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.audit-record-item {
  background: #f8f7f7;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  .audit-record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .audit-time {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #545454;
    }

    .audit-status {
      font-family: 'PingFang SC';
      font-size: 12px;
      font-weight: 500;

      &.approved {
        color: #009100;
      }

      &.rejected {
        color: #b91919;
      }
    }
  }

  .audit-record-content {
    .audit-comment {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
      line-height: 1.5;
      margin: 0 0 8px 0;
    }

    .audit-images {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 8px;

      .audit-image-item {
        width: 60px;
        height: 60px;
        border-radius: 4px;
        overflow: hidden;

        .audit-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}

// 底部操作按钮
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 7px 12px 36px 12px;
  background: #ffffff;
  gap: 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
  padding-bottom: calc(36px + env(safe-area-inset-bottom));

  .action-btn {
    flex: 1;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &.audit {
      color: #ffffff;
      background: #009100;
    }

    &.reject {
      color: #191a1b;
      background: #f5f5f5;
      border: 1px solid #e6e6e5;
    }

    &.approve {
      color: #ffffff;
      background: #009100;
    }
  }
}

// 审核弹窗内容
.audit-popup-content {

  .audit-result-section {
    margin-bottom: 12px;
    background: #ffffff;
    border-radius: 6px;
    padding: 12px;
  }

  .audit-section-title {
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 12px;
  }

  .audit-result-options {
    display: flex;
    gap: 8px;

    .audit-result-option {
      flex: 1;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      background: #f8f7f7;
      border-radius: 4px;
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
      cursor: pointer;
      transition: all 0.2s;

      &.active {
        background: rgba(0, 145, 0, 0.1);
        color: #009100;
      }
    }
  }

  .audit-remark-section {
    background: #ffffff;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;

    .audit-remark-input-wrapper {
      background: #f8f7f7;
      border-radius: 6px;
      padding: 12px;
      position: relative;

      .audit-remark-input {
        width: 100%;
        min-height: 80px;
        border: none;
        background: transparent;
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
        resize: none;
        outline: none;

        &::placeholder {
          color: #888888;
        }
      }

      .audit-remark-count {
        position: absolute;
        right: 12px;
        bottom: 8px;
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #888888;
      }
    }
  }
}

// 审核提交按钮
.audit-submit-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #009100;
  border-radius: 8px;
  font-family: 'PingFang SC';
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
  transition: opacity 0.2s;

  &.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

// 必填标识
.required {
  color: #ee0a24;
  margin-left: 2px;
}

// 错误内容选择
.audit-error-code-section {
  margin-bottom: 12px;
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;

  .audit-error-code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    .audit-error-code-title {
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
      flex-shrink: 0;
    }

    .audit-error-code-selector {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      justify-content: flex-end;

      .audit-error-code-text {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.placeholder {
          color: #888888;
        }
      }

      .audit-error-code-arrow {
        font-size: 12px;
        color: #888888;
        flex-shrink: 0;
      }
    }
  }
}

// 错误代码列表容器
.error-code-list-wrapper {
  max-height: 549px;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  padding: 0 12px;

  .error-code-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 50px;
    padding: 15px 0;
    border-bottom: 0.5px solid #e6e6e5;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &.active {
      .error-code-label {
        color: #009100;
      }
    }

    .error-code-label {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
      flex: 1;
      line-height: 20px;
      padding-right: 8px;
    }

    .error-code-check {
      font-size: 16px;
      color: #009100;
      flex-shrink: 0;
    }
  }
}

// 附件上传
.audit-attachment-section {
  margin-bottom: 12px;
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;

  .audit-attachment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .audit-attachment-item {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
    position: relative;

    .attachment-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .attachment-delete {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 18px;
      height: 18px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 12px;
      cursor: pointer;
    }
  }

  .audit-attachment-upload {
    width: 80px;
    height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 6px;
    cursor: pointer;

    .audit-attachment-icon {
      font-size: 24px;
      color: #d8d8d8;
      margin-bottom: 4px;
    }

    .audit-attachment-text {
      font-family: 'PingFang SC';
      font-size: 12px;
      color: #888888;
    }
  }

  .audit-attachment-tip {
    margin-top: 8px;
    font-family: 'PingFang SC';
    font-size: 12px;
    color: #888888;
  }
}
</style>
