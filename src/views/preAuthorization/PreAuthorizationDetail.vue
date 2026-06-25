<template>
  <div class="pre-auth-detail">
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
        <div v-if="detail.status === AUDIT_STATUS.REJECTED" class="reject-reason">
          {{ detail.preAuthRuleCodeDesc || '--' }}
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
      <div class="info-card mt-12">
        <div class="card-header">
          <span class="card-title">接车施工单</span>
        </div>
        <div class="card-body">
          <div class="info-row" :class="{ clickable: canEditConstruction }" @click="canEditConstruction && openConstructionPicker()">
            <span class="info-label">施工单号</span>
            <span class="info-value">
              {{ detail.constructionNo || '--' }}
              <van-icon v-if="canEditConstruction" name="arrow" size="14" color="#888888" />
            </span>
          </div>
          <div class="info-row" :class="{ 'auth-type-row': isEditable }">
            <span class="info-label">预授权类型</span>
            <template v-if="isEditable">
              <div class="type-chips">
                <div class="type-chip" :class="{ 'type-chip-active': editAuthType === 'tech' }" @click="onAuthTypeChange('tech')">技术预授权</div>
                <div class="type-chip" :class="{ 'type-chip-active': editAuthType === 'warranty' }" @click="onAuthTypeChange('warranty')">保修预授权</div>
              </div>
            </template>
            <template v-else>
              <span class="info-value">{{ detail.authType || '--' }}</span>
            </template>
          </div>
          <template v-if="showVehicleInfo">
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
          <div class="info-row warning-item" @click="warningExpanded = !warningExpanded">
            <span class="info-label">预警信息</span>
            <div class="info-value-wrap">
              <span class="info-value" :class="{ 'text-collapsed': !warningExpanded }">{{ detail.warningInfo || '--' }}</span>
              <van-icon
                v-if="detail.warningInfo && detail.warningInfo.length > 20"
                :name="warningExpanded ? 'arrow-up' : 'arrow-down'"
                size="16"
                color="#888888"
              />
            </div>
          </div>
          <div class="info-row">
            <span class="info-label">预计交车</span>
            <span class="info-value">{{ detail.estimateDeliverTime || '--' }}</span>
          </div>
          </template>
        </div>
      </div>

      <!-- 质量反馈报告卡片 -->
      <div v-if="detail.qualityReport || isEditable" class="info-card mt-12" >
        <div class="card-header">
          <span class="card-title">质量反馈报告</span>
        </div>
        <div class="card-body">
          <div class="info-row" :class="{ clickable: isEditable }" @click="isEditable && openFeedbackPicker()">
            <span class="info-label">质量反馈单号</span>
            <span class="info-value">
              {{ detail.qualityReport?.reportNo  }}
              <van-icon v-if="isEditable" name="arrow" size="14" color="#888888" />
            </span>
          </div>
          <div class="info-row expandable" :class="{ expanded: faultDescExpanded }" @click="faultDescExpanded = !faultDescExpanded">
            <span class="info-label">故障现象描述</span>
            <span class="info-value" :class="{ collapsed: !faultDescExpanded }">{{ detail.qualityReport?.faultDesc }}</span>
            <van-icon v-if="detail.qualityReport?.faultDesc" name="arrow" size="12" color="#888888" class="arrow-icon" />
          </div>
          <div class="info-row expandable" :class="{ expanded: faultProcessExpanded }" @click="faultProcessExpanded = !faultProcessExpanded">
            <span class="info-label">故障排查流程</span>
            <span class="info-value" :class="{ collapsed: !faultProcessExpanded }">{{ detail.qualityReport?.faultProcess }}</span>
            <van-icon v-if="detail.qualityReport?.faultProcess" name="arrow" size="12" color="#888888" class="arrow-icon" />
          </div>
        </div>
      </div>

      <!-- 申请原因卡片 -->
      <div class="info-card">
        <div class="card-header">
          <span class="card-title">申请原因</span>
        </div>
        <div class="card-body">
          <template v-if="isEditable">
            <van-field
              v-model="detail.applyReason"
              type="textarea"
              placeholder="请输入申请原因"
              :rows="6"
              autosize
              class="reason-textarea-field"
            />
          </template>
          <template v-else>
            <div ref="reasonRef" class="reason-content" :class="{ collapsed: !reasonExpanded }">
              {{ detail.applyReason || '--' }}
            </div>
            <div v-if="reasonNeedExpand" class="expand-btn" @click="reasonExpanded = !reasonExpanded">
              {{ reasonExpanded ? '收起' : '展开' }}
              <van-icon :name="reasonExpanded ? 'arrow-up' : 'arrow-down'" size="12" color="#009100" />
            </div>
          </template>
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
            <div class="repair-item-top">
              <div class="repair-item-left">
                <div class="repair-name">{{ item.name }}</div>
                <div class="repair-part-no">{{ item.partNo }}</div>
                <div class="repair-type">{{item.repairItemTypeName}}-{{ item.checkoutTypeName }}-{{ item.warrantyTypeName }}</div>
              </div>
              <div class="repair-item-right">
                <div class="repair-price">¥{{ item.subtotal }}</div>
                <div class="repair-discount">优惠 ¥{{ item.discount }}</div>
              </div>
            </div>
            <div class="repair-item-bottom">
              <span class="repair-subtotal">¥{{ item.price }}</span>
              <span class="repair-workHour">x{{ item.workHour }}</span>
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
            <div class="repair-item-top">
              <div class="repair-item-left">
                <div class="repair-name-row">
                  <span class="repair-name">{{ item.name }}</span>
                  <span v-if="item.tag" class="parts-tag">{{ item.tag === 1 ? '原厂件' : '副厂件' }}</span>
                </div>
                <div class="repair-part-no">{{ item.partNo }}</div>
                <div class="repair-type">{{item.repairItemTypeName}}-{{ item.checkoutTypeName }}-{{ item.warrantyTypeName }}</div>
              </div>
              <div class="repair-item-right">
                <div class="repair-price">¥{{ item.price }}</div>
                <div class="repair-discount">优惠 ¥{{ item.discount }}</div>
              </div>
            </div>
            <div class="repair-item-bottom">
              <div class="repair-bottom-left">
                <span class="repair-subtotal">¥{{ item.subtotal }}</span>
                <span class="repair-actual">实际领料 {{ item.actualQuantity }}</span>
                <span class="repair-return">退料 {{ item.returnQuantity }}</span>
              </div>
              <span class="repair-workHour">x{{ item.workHour }}</span>
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
                <img :src="img.url" class="attached-img" @click="showImg(img.url)" />
                <div class="attachment-delete" @click="deleteAttachment(section.key, index)">
                  <van-icon name="cross" size="16" color="#ffffff" />
                </div>
              </div>
              <div
                v-if="getAttachConfig(section.label).maxNum == null || detail.attachments[section.key].length < getAttachConfig(section.label).maxNum"
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
    <!-- 审核信息 Tab -->
    <div id="tab-audit" class="tab-content-section">
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
          <template v-if="detail.isGoodWarranty">
            <div class="info-row">
              <span class="info-label">审批单号</span>
              <span class="info-value">{{ detail.auditInfo?.auditNo || '--' }}</span>
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
            <div class="info-row">
              <span class="info-label">工时分担比例</span>
              <span class="info-value">{{ detail.auditInfo?.laborCostRatio ? `${detail.auditInfo.laborCostRatio}%` : '--' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">零件分担比例</span>
              <span class="info-value">{{ detail.auditInfo?.partsCostRatio ? `${detail.auditInfo.partsCostRatio}%` : '--' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">其他分担比例</span>
              <span class="info-value">{{ detail.auditInfo?.otherCostSharingRatio ? `${detail.auditInfo.otherCostSharingRatio}%` : '--' }}</span>
            </div>
          </template>

          <!-- 分隔线 -->
          <div class="audit-divider"></div>

          <!-- 审核记录 -->
          <div class="audit-records-title">审核记录</div>
          <div class="audit-records-list">
            <div v-for="(record, index) in detail.auditRecords" :key="index" class="audit-record-item">
              <div class="audit-record-header">
                <span class="audit-user-time">{{ record.operatorName }}<span style="display:inline-block;width:4px"></span>{{ record.time }}</span>
                <span class="audit-status" :class="getAuditRecordStatusClass(record.statusText)">{{ record.statusText }}</span>
              </div>
              <div v-if="record.comment" class="audit-record-content">
                {{ record.comment }}
              </div>
              <div v-if="record.attachments && record.attachments.length > 0" class="audit-record-images">
                <img
                  v-for="(img, imgIndex) in record.attachments"
                  :key="imgIndex"
                  :src="img.url"
                  class="audit-record-img"
                  @click="showImg(img.url)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 底部审核按钮 (仅审批中状态且非善意保修时显示) -->
    <div v-if="detail.status === AUDIT_STATUS.IN_PROGRESS && detail.isGoodWarranty !== true && permissionStore.hasPermission('AISMC-app-preAuth-audit')" class="bottom-actions">
      <div class="action-btn back" @click="router.back()">返回</div>
      <div class="action-btn audit" @click="handleAudit">审核</div>
    </div>

    <!-- 底部激活按钮 (已拒绝状态且非善意保修时显示) -->
    <div v-if="detail.status === AUDIT_STATUS.REFUSED && detail.isGoodWarranty !== true && permissionStore.hasPermission('AISMC-app-preAuth-audit')" class="bottom-actions">
      <div class="action-btn back" @click="router.back()">返回</div>
      <div class="action-btn audit" @click="handleAudit">激活</div>
    </div>

    <!-- 底部提交按钮 (未提交或已驳回状态显示) -->
    <div v-if="isEditable && permissionStore.hasPermission('AISMC-app-preAuth-addOrUpdate')" class="bottom-actions">
      <div class="action-btn submit" @click="handleSubmit">提交申请</div>
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
              <span class="audit-error-code-title">错误代码及内容<span class="required">*</span></span>
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
            <div class="attachments-image-list">
              <div v-for="(img, index) in attachmentList" :key="index" class="attachments-image-item">
                <img :src="img.url || img.fileUrl" class="attached-img" @click="showImg(img.url || img.fileUrl)" />
                <div class="attachment-delete" @click="removeAttachment(index)">
                  <van-icon name="cross" size="16" color="#ffffff" />
                </div>
              </div>
              <div
                class="attachments-upload-item"
                @click="handleUploadAttachment"
              >
                <van-icon name="photograph" size="24" color="#d8d8d8" />
                <span class="attachments-upload-text">上传</span>
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
              <span class="error-code-label">{{ option.label + '【' + option.code + '】' }}</span>
              <van-icon v-if="selectedErrorCode === option.label" name="success" class="error-code-check" />
            </div>
          </van-list>
        </div>
      </template>
    </ais-popup>

    <!-- 施工单选择弹窗 -->
    <ais-popup
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
              <input v-model="constructionSearchText" type="text" class="search-input" placeholder="输入车牌号/VIN" />
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
            <div v-for="item in constructionList" :key="item.id" class="construction-item" @click="onConstructionSelect(item)">
              <div class="construction-header">
                <span class="construction-no">{{ item.code }}</span>
                <span class="construction-status" :class="'status-' + item.status">{{ item.statusText }}</span>
              </div>
              <div class="construction-vehicle">
                <span class="vehicle-plate">{{ item.carPlate }}</span>
                <div class="vehicle-icons" v-if="item.alarmLevel">
                  <svg class="icon" viewBox="0 0 16 16">
                    <path :fill="getAlarmColor(item.alarmLevel)" :stroke="getAlarmColor(item.alarmLevel)" stroke-width="4" stroke-linejoin="round" d="M8 2L14 13H2Z" />
                    <text x="8" y="12" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">!</text>
                  </svg>
                </div>
                <template v-if="item.repairItemTypeDetailCollect">
                  <span v-for="(tag, index) in item.repairItemTypeDetailCollect.split('&').filter(Boolean)" :key="index" class="vehicle-tag">{{ tag }}</span>
                </template>
              </div>
              <div class="construction-vehicle-info">{{ item.vehModelName }} · {{ item.vehProfileVin }}</div>
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
    </ais-popup>

    <!-- 质量反馈单号选择弹窗 -->
    <ais-popup
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
              <input v-model="feedbackSearchText" type="text" class="search-input" placeholder="反馈单号" />
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
            <div v-for="item in feedbackList" :key="item.id" :class="['feedback-select-item', { selected: item.id === selectedFeedbackId }]" @click="onFeedbackSelect(item)">
              <div class="feedback-serial" v-html="highlightSearch(item.code, feedbackSearchText)"></div>
              <div class="feedback-type" v-if="item.reportType">{{ qualityReportTypeMap[item.reportType] || item.reportType }}</div>
              <div class="feedback-desc" v-if="item.title">{{ item.title }}</div>
            </div>
          </RefreshList>
        </div>
      </template>
    </ais-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showImagePreview } from 'vant'
import AisPopup from '@/components/AisPopup.vue'
import RefreshList from '@/libs/components/RefreshList.vue'
import { preAuthGet, preAuthAudit, preAuthGetErrorCodeList, preAuthAddOrUpdate, preAuthGetConstructionList, preAuthGetPreAuthInfoDetail, preAuthGetQualityFeedbackList } from '@/api/authorization'
import { getAttachmentList, uploadFileByUrl, deleteAttachmentConfig, getUploadConfig } from '@/libs/api/fileConfig'
import { getEnumValue } from '@/libs/api/common'
import { batchUploadImageLimit } from '@/libs/utils/nativeFn'
import { usePageSafeArea } from '@/utils/safeArea'
import { usePermissionStore } from '@/stores/permission'
import { AUDIT_STATUS } from './constant'
const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })
const PRE_AUTH_ATTACHMENT_CONFIG_CODE = 'mcs_preauth'
const uploadConfig = ref({})
const getAttachConfig = (attachType) => {
  const detailList = uploadConfig.value?.detailList || []
  return detailList.find((item) => item.attachType === attachType) || {}
}
const attachmentSections = [
  { key: 'vehicle', label: '车辆信息' },
  { key: 'license', label: '行驶证' },
  { key: 'fault', label: '故障信息' },
  { key: 'finalRight', label: '终身权益' },
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
const warningExpanded = ref(false)
const reasonNeedExpand = ref(false)
const reasonRef = ref(null)

// 编辑状态跟踪
const editConstructionId = ref('')
const editFeedbackId = ref('')
const editAuthType = ref('')
const hasEdited = ref(false)

// 施工单选择器
const showConstructionPicker = ref(false)
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

// 质量反馈选择器
const showFeedbackPicker = ref(false)
const feedbackSearchText = ref('')
const feedbackList = ref([])
const selectedFeedbackId = ref('')
const feedbackRefreshListRef = ref(null)
const qualityReportTypeMap = ref({})
const feedbackRequestData = reactive({
  data: { pageNum: 1, pageSize: 10, appSearchKeyWord: '', serviceProxyCode: '', orderStatus: 30 },
  api: (params) => preAuthGetQualityFeedbackList(params)
})
const setFeedbackData = (res) => {
  const list = res?.list || []
  if (res?.isRefresh) {
    feedbackList.value = [...list]
  } else {
    feedbackList.value.push(...list)
  }
}
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
const auditOptions = computed(() => {
  const base = [
    { label: '审批通过', value: 'approve' },
    { label: '审批驳回', value: 'reject' }
  ]
  if (detail.value.status !== AUDIT_STATUS.REFUSED) {
    base.push({ label: '拒绝申请', value: 'refuse' })
  }
  return base
})

// 是否可编辑（未提交10 或 已驳回40）
const isEditable = computed(() => {
  return detail.value.status === AUDIT_STATUS.TODO || detail.value.status === AUDIT_STATUS.REJECTED
})

// 是否可编辑施工单号（仅未提交时可编辑，已驳回时不可修改）
const canEditConstruction = computed(() => detail.value.status === AUDIT_STATUS.TODO)

// 是否展示车辆信息区域（可编辑时需要选择了施工单才展示；不可编辑时始终展示）
const showVehicleInfo = computed(() => {
  if (!isEditable.value) return true
  return !!editConstructionId.value
})

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
  { name: 'attachments', title: '附件信息' },
  { name: 'audit', title: '审核信息' }
])

// IntersectionObserver 实例
let scrollContainer = null
let clickScrollCleanup = null
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

const getElementScrollTop = (element) => {
  const container = getScrollContainer()
  if (container === window) {
    return element.getBoundingClientRect().top + (window.scrollY || document.documentElement.scrollTop)
  }
  return element.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
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
  // 只有非点击触发的滚动才同步切换 tab
  if (!isClickScrolling.value) {
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
  const offset = stickyHeaderHeight + 12

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

    const tabTop = getElementScrollTop(tabEl)
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
  preAuthRuleCodeDesc: '',
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
  qualityOrderReportId: '',
  auditInfo: {},
  auditRecords: [],
  repairItems: [],
  partsItems: [],
  attachments: buildEmptyAttachments(),
  isGoodWarranty: null, // 善意保修标识，true为善意保修不展示审核按钮
  serviceProxyId: '', // 施工单ID
  preAuthTypeValue: '' // 预授权类型数值(1=tech, 2=warranty)
})

// 切换 Tab
const switchTab = async(tabName) => {
  activeTab.value = tabName
  const targetEl = document.getElementById(`tab-${tabName}`)
  if (!targetEl) return

  const stickyHeaderHeight = getStickyHeaderHeight()

  // 标记为点击触发的滚动
  if (clickScrollCleanup) {
    clickScrollCleanup()
    clickScrollCleanup = null
  }
  isClickScrolling.value = true
  const finalScrollTop = Math.max(0, getElementScrollTop(targetEl) - stickyHeaderHeight - 12)

  // 使用 scrollTo 并监听滚动结束事件
  const container = getScrollContainer()
  let scrollEndTimer = null
  const onScrollEnd = () => {
    if (scrollEndTimer) clearTimeout(scrollEndTimer)
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

// 检测申请原因是否超出6行
const checkReasonOverflow = () => {
  if (isEditable.value) return
  nextTick(() => {
    const el = reasonRef.value
    if (el) {
      reasonNeedExpand.value = el.scrollHeight > el.clientHeight + 2
    }
  })
}

// 搜索高亮
const highlightSearch = (text, searchText) => {
  if (!searchText || !text) return text
  const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<span class="highlight-match">$1</span>')
}

// 预警颜色
const getAlarmColor = (alarmLevel) => {
  switch (alarmLevel) {
    case 10: return '#009100'
    case 20: return '#C8A12B'
    case 30: return '#B91919'
    default: return '#009100'
  }
}

// 施工单选择器
const openConstructionPicker = () => {
  constructionSearchText.value = ''
  constructionList.value = []
  constructionSearched.value = false
  showConstructionPicker.value = true
}

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

const onConstructionSelect = async(item) => {
  try {
    showLoadingToast({ message: '加载中...', forbidClick: true })
    const res = await preAuthGetPreAuthInfoDetail(item.id)
    closeToast()
    if (res?.code !== 0 && res?.code !== 200) {
      showToast(res?.msg || '获取信息失败')
      editConstructionId.value = ''
      detail.value.constructionNo = ''
      return
    }
    showConstructionPicker.value = false
    hasEdited.value = true
    if (res?.data) {
      detail.value.constructionNo = item.code
      editConstructionId.value = item.id
      const data = res.data
      detail.value.vin = data.vehProfileVin || ''
      detail.value.warrantyTime = data.guaranteeStartDate && data.warrantyEndTime ? `${data.guaranteeStartDate} 至 ${data.warrantyEndTime}` : ''
      detail.value.mileage = data.mileage || ''
      detail.value.vehicleUse = data.carPropertyLabel || ''
      detail.value.lifetimeWarranty = data.isLifetime === 1 ? '是' : '否'
      detail.value.serviceStore = data.dealerName || ''
      detail.value.storeArea = data.orgName || data.dealerUnitName || ''
      detail.value.warningInfo = data.alarmInfo || ''
      detail.value.estimateDeliverTime = item.expectFinishAt || ''
      editAuthType.value = data.preAuthType === 1 ? 'tech' : 'warranty'
      detail.value.repairItems = (data.spRepairItemResps || []).map((ri) => ({
        name: ri.repairItemName || '',
        partNo: ri.repairItemCode || '',
        repairItemTypeName: ri.repairItemTypeName || '',
        checkoutTypeName: ri.checkoutTypeName || '',
        warrantyTypeName: ri.warrantyTypeName || '',
        price: ri.price || '0',
        discount: ri.discountAmount || '0',
        subtotal: ri.repairAmount || ri.totalAmount || '0',
        workHour: ri.workHour || '0'
      }))
      detail.value.partsItems = (data.spSparePartResps || []).map((pi) => ({
        name: pi.partsName || '',
        partNo: pi.partsCode || '',
        repairItemTypeName: pi.repairItemTypeName || '',
        checkoutTypeName: pi.checkoutTypeName || '',
        warrantyTypeName: pi.warrantyTypeName || '',
        tag: pi.isOemPart || '',
        price: pi.price || '0',
        discount: pi.discountAmount || '0',
        subtotal: pi.partsAmount || pi.totalAmount || '0',
        workHour: pi.quantity || '0',
        actualQuantity: pi.actualPickNumber || '0',
        returnQuantity: pi.refundedNumber || '0'
      }))
      // 切换施工单后清除质量反馈
      detail.value.qualityReport = null
      detail.value.qualityOrderReportId = ''
      editFeedbackId.value = ''
    }
  } catch {
    closeToast()
    showToast('获取施工单信息失败')
  }
}

// 质量反馈选择器
const openFeedbackPicker = () => {
  if (!detail.value.constructionNo) {
    showToast('请先选择施工单')
    return
  }
  feedbackRequestData.data = { pageNum: 1, pageSize: 10, appSearchKeyWord: '', serviceProxyCode: detail.value.constructionNo, orderStatus: 30, _t: Date.now() }
  feedbackSearchText.value = ''
  feedbackList.value = []
  selectedFeedbackId.value = detail.value.qualityOrderReportId || ''
  showFeedbackPicker.value = true
}

const handleFeedbackSearch = () => {
  feedbackRequestData.data = { pageNum: 1, pageSize: 10, appSearchKeyWord: feedbackSearchText.value, serviceProxyCode: detail.value.constructionNo, orderStatus: 30, _t: Date.now() }
}

const onFeedbackSelect = (item) => {
  const itemId = item.id || ''
  // 点击已选中项则取消选中
  if (selectedFeedbackId.value === itemId) {
    selectedFeedbackId.value = ''
    editFeedbackId.value = ''
    detail.value.qualityOrderReportId = ''
    detail.value.qualityReport = { id: '', reportNo: '', faultDesc: '', faultProcess: '' }
    return
  }
  // 选中新项
  selectedFeedbackId.value = itemId
  editFeedbackId.value = itemId
  detail.value.qualityOrderReportId = itemId
  detail.value.qualityReport = {
    id: itemId,
    reportNo: item.code || '',
    faultDesc: item.customerContent || '',
    faultProcess: item.troubleshootingProcess || ''
  }
  showFeedbackPicker.value = false
  hasEdited.value = true
}

// 预授权类型切换
const onAuthTypeChange = (type) => {
  editAuthType.value = type
  hasEdited.value = true
}

// 监听申请原因变化
watch(() => detail.value.applyReason, () => {
  if (isEditable.value) hasEdited.value = true
})

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

// 提交申请操作
const handleSubmit = async() => {
  const id = route.params.id
  if (!id) {
    showToast('缺少预授权ID')
    return
  }
  if (!editConstructionId.value) {
    showToast('请选择施工单')
    return
  }
  if (!detail.value.applyReason?.trim()) {
    showToast('请填写申请原因')
    return
  }

  try {
    showLoadingToast({ message: '提交中...', forbidClick: true })
    const attachments = attachmentSections.flatMap((section) =>
      (detail.value.attachments[section.key] || []).map((img) => ({
        fileId: img.fileId || img.id || '',
        fileUrl: img.fileUrl || img.url || '',
        fileName: img.fileName || '',
        fileType: img.fileType || '',
        attachType: section.label,
        configCode: PRE_AUTH_ATTACHMENT_CONFIG_CODE
      }))
    )
    const res = await preAuthAddOrUpdate({
      id: id,
      serviceProxyId: editConstructionId.value,
      qualityOrderReportId: editFeedbackId.value,
      qualityOrderReport: detail.value.qualityReport?.reportNo || '',
      reason: detail.value.applyReason,
      saveOrSubmit: 1,
      attachments
    })
    closeToast()

    if (res.code === 200 || res.code === 0) {
      showToast('提交成功')
      fetchDetail()
    } else {
      showToast(res.msg || '提交失败')
    }
  } catch (error) {
    closeToast()
    showToast(error.msg)
  }
}

// 审核状态映射
const auditStatusMap = {
  approve: 30, // 审批通过
  reject: 20, // 审批驳回
  refuse: 40 // 拒绝申请
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
      fileUrl: item.fileUrl || item.url || ''
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

// 审核附件上传
const handleUploadAttachment = () => {
  currentUploadType.value = 'audit'
  const currentList = attachmentList.value || []
  batchUploadImageLimit(10, undefined, currentList.length + 1)
}

const isSuccessResponse = (res) => res?.code === 0 || res?.code === 200

const getAttachmentTypeLabel = (type) => {
  return attachmentSections.find(item => item.key === type)?.label || ''
}

const normalizeAttachmentItem = (item) => ({
  ...item,
  url: item.fileUrl || item.url || ''
})

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

const fetchAuditRecordAttachments = async() => {
  const records = detail.value.auditRecords
  if (!records || records.length === 0) return

  const promises = records.map(async(record) => {
    if (!record.id) return
    try {
      const res = await getAttachmentList({ businessId: record.id })
      if (res?.code === 200 || res?.code === 0) {
        const data = res?.data
        const list = Array.isArray(data) ? data : (data?.records || data?.list || [])
        record.attachments = list.map(item => ({
          url: item.fileUrl || item.url || '',
          fileId: item.fileId || item.id || ''
        }))
      }
    } catch (e) {
      console.error('获取审核记录附件失败:', e)
    }
  })

  await Promise.all(promises)
}

const uploadAttachment = (type) => {
  const currentList = detail.value.attachments[type] || []
  const attachType = getAttachmentTypeLabel(type)
  const config = getAttachConfig(attachType)
  const maxNum = config.maxNum
  if (maxNum != null && currentList.length >= maxNum) {
    showToast(`最多上传${maxNum}个附件`)
    return
  }
  currentUploadType.value = type
  const maxSize = config.maxSize || 10
  batchUploadImageLimit(maxSize, maxNum, currentList.length + 1)
}

const handleNativeImage = async(rawFileUrl) => {
  const uploadType = currentUploadType.value
  const businessId = route.params.id
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
  if (isUploadingAttachment.value) return

  // 审核附件：直接收集图片信息，不走文件服务上传
  if (uploadType === 'audit') {
    urlList.forEach((url) => {
      attachmentList.value.push({ url, fileUrl: url })
    })
    return
  }

  // 附件信息Tab：走正常上传流程
  if (!businessId) {
    showToast('缺少预授权ID')
    return
  }

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
      businessId,
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

// 图片预览
const showImg = (url) => {
  showImagePreview([url])
}

// 删除审核弹窗附件（本地图片，无需调用接口）
const removeAttachment = (index) => {
  attachmentList.value.splice(index, 1)
}

// 删除附件信息Tab的附件
const deleteAttachment = async(type, index) => {
  const item = detail.value.attachments[type]?.[index]
  if (!item) return

  detail.value.attachments[type].splice(index, 1)

  if (item?.id || item?.fileId) {
    try {
      await deleteAttachmentConfig([item.id || item.fileId])
    } catch (error) {
      console.error('删除附件失败:', error)
    }
  }
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
        code: item.code,
        value: item.id
      })) || []

      errorCodeOptions.value = [...errorCodeOptions.value, ...list]

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
      // 初始化编辑状态
      editConstructionId.value = detail.value.serviceProxyId
      editFeedbackId.value = detail.value.qualityReport?.id || ''
      editAuthType.value = detail.value.preAuthTypeValue === 1 ? 'tech' : 'warranty'
      hasEdited.value = false
      await fetchAllAttachmentLists()
      fetchAuditRecordAttachments()
      checkReasonOverflow()
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
    preAuthRuleCodeDesc: preAuthData.preAuthRuleCodeDesc || '',
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
    // 预计交车 - 来自施工单数据
    estimateDeliverTime: serviceProxy.expectFinishAt || '',

    // 质量反馈报告 - 来自预授权主数据
    qualityOrderReportId: preAuthData.qualityOrderReportId || '',
    qualityReport: preAuthData.qualityOrderReportResp ? {
      id: preAuthData.qualityOrderReportResp.id || '',
      reportNo: preAuthData.qualityOrderReportResp.code || '',
      faultDesc: preAuthData.qualityOrderReportResp.customerContent || '',
      faultProcess: preAuthData.qualityOrderReportResp.troubleshootingProcess || ''
    } : null,

    // 审核信息 - 来自预授权主数据
    auditInfo: {
      auditor: preAuthData.approver || '',
      auditTime: preAuthData.approvalOn || '',
      auditNo: preAuthData.auditNo || '',
      laborSubtotal: preAuthData.approvedLaborClaimTotal || '',
      partsSubtotal: preAuthData.approvedPartsClaimTotal || '',
      otherSubtotal: preAuthData.approvedOtherClaimTotal || '',
      laborCostRatio: preAuthData.laborCostRatio || '',
      partsCostRatio: preAuthData.partsCostRatio || '',
      otherCostSharingRatio: preAuthData.otherCostSharingRatio || ''
    },

    // 审核记录 - 来自预授权主数据
    auditRecords: (preAuthData.supportApprovalResps || []).map(item => ({
      operatorName: item.approver || '',
      time: item.approvalOn || '',
      status: item.approvalResult,
      statusText: item.approvalResult || '',
      comment: item.content || '',
      id: item.id || '',
      attachments: []
    })),

    // 维修项目 - 来自预授权主数据
    repairItems: (preAuthData.spRepairItemResps || []).map(item => ({
      name: item.repairItemName || '',
      partNo: item.repairItemCode || '',
      repairItemTypeName: item.repairItemTypeName || '',
      checkoutTypeName: item.checkoutTypeName || '',
      warrantyTypeName: item.warrantyTypeName || '',
      price: item.price || '0',
      discount: item.discountAmount || '0',
      subtotal: item.repairAmount || '0',
      workHour: item.workHour || '0'
    })),

    // 维修配件 - 来自预授权主数据
    partsItems: (preAuthData.spSparePartResps || []).map(item => ({
      name: item.partsName || '',
      partNo: item.partsCode || '',
      repairItemTypeName: item.repairItemTypeName || '',
      checkoutTypeName: item.checkoutTypeName || '',
      warrantyTypeName: item.warrantyTypeName || '',
      tag: item.isOemPart || '',
      price: item.price || '0',
      discount: item.discountAmount || '0',
      subtotal: item.partsAmount || '0',
      workHour: item.quantity || '0',
      actualQuantity: item.actualPickNumber || '0',
      returnQuantity: item.refundedNumber || '0'
    })),
    // 善意保修标识 - 来自预授权主数据
    isGoodWarranty: preAuthData.isGoodWarranty,
    // 施工单ID - 来自施工单数据
    serviceProxyId: serviceProxy.id || '',
    // 预授权类型数值
    preAuthTypeValue: preAuthData.preAuthType || '',
    attachments: buildEmptyAttachments()
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case AUDIT_STATUS.TODO: return 'status-pending'
    case AUDIT_STATUS.IN_PROGRESS: return 'status-audit'
    case AUDIT_STATUS.APPROVED: return 'status-approved'
    case AUDIT_STATUS.REJECTED: return 'status-rejected'
    case AUDIT_STATUS.CANCELLED: return 'status-rejected'
    case AUDIT_STATUS.EXPIRED: return 'status-rejected'
    case AUDIT_STATUS.REFUSED: return 'status-rejected'
    default: return ''
  }
}

const getAuditRecordStatusClass = (label) => {
  if (!label) return ''
  if (label === '通过' || label === '审批通过') return 'status-approved'
  if (label === '提交审批') return 'status-pending'
  return 'status-rejected'
}

onMounted(() => {
  window.getScanResult = handleNativeImage
  console.log('预授权详情页加载，ID:', route.params.id)
  fetchDetail()
  getUploadConfig({ configCode: PRE_AUTH_ATTACHMENT_CONFIG_CODE }).then((res) => {
    if (res?.code === 200 || res?.code === 0) {
      uploadConfig.value = res.data || {}
    }
  })
  getEnumValue('QualityReportTypeEnum').then((res) => {
    if (res?.code === 200) {
      const map = {}
      ;(res.data || []).forEach((item) => { map[item.code] = item.message })
      qualityReportTypeMap.value = map
    }
  })
  nextTick(() => {
    setupScrollListener()
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
  if (scrollSyncTimeout) {
    clearTimeout(scrollSyncTimeout)
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
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding-bottom: calc(83px + env(safe-area-inset-bottom));
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
  position: sticky;
  top: 0;
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
      color: #2261dd;
    }

    &.status-approved {
      color: #009100;
    }

    &.status-audit {
      color: #c8a12b;
    }

    &.status-rejected {
      color: #B91919;
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
}

// 信息卡片
.info-card {
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;

  .card-header {
    padding: 12px 12px 4px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
    }

    .edit-icon {
      cursor: pointer;
    }
  }

  .card-body {
    padding: 4px 12px 12px;
  }
}
.mt-12 {
  margin-top: 12px;
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

    .svc-tag {
      font-family: 'PingFang SC';
      font-size: 12px;
      font-style: normal;
      color: #191a1b;
      background: #ffffff;
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
      margin-left: 6px;
    }

    &.warning {
      color: #ee0a24;
    }

    &.text-collapsed {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.collapsed {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &.warning-item {
    align-items: flex-start;

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
      flex: 1;
      min-width: 0;
      margin-left: 0;
      width: auto;
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
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 编辑申请原因 textarea
.reason-textarea-field {
  padding: 0;

  :deep(.van-field__control) {
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #191a1b;
    line-height: 1.6;
  }

  :deep(.van-field__placeholder) {
    color: #888888;
  }
}

// 展开按钮
.expand-btn {
  font-family: 'PingFang SC';
  font-size: 14px;
  color: #009100;
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 4px;
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

  .repair-item-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .repair-item-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;

    .repair-name-row {
      display: flex;
      align-items: center;
      gap: 4px;

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

    .repair-name {
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
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
    gap: 2px;
    flex-shrink: 0;

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
    margin-top: 4px;

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

    .repair-workHour {
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
    position: relative;

    .attached-img {
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
      border-radius: 0 7px 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      cursor: pointer;
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

  .audit-record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .audit-user-time {
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #545454;
    }

    .audit-status {
      font-family: 'PingFang SC';
      font-size: 12px;
      font-weight: 500;
      flex-shrink: 0;

      &.status-approved {
        color: #009100;
      }

      &.status-pending {
        color: #2261DD;
      }

      &.status-rejected {
        color: #B91919;
      }
    }
  }

  .audit-record-content {
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #191a1b;
    margin-top: 8px;
  }

  .audit-record-images {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;

    .audit-record-img {
      width: 64px;
      height: 64px;
      border-radius: 4px;
      object-fit: cover;
      border: 1px solid #e6e6e5;
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

    &.back {
      color: #545454;
      background: #ffffff;
      border: 1px solid #d8d8d8;
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

    &.submit {
      color: #ffffff;
      background: #009100;
    }
  }
}

// 审核弹窗内容
.audit-popup-content {
  max-height: 60vh;
  overflow-y: auto;

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

// 附件上传（审核弹窗）
.audit-attachment-section {
  margin-bottom: 12px;
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;
}

// 可点击行
.info-row.clickable {
  cursor: pointer;
}

.info-row.auth-type-row {
  align-items: center;
}

// 预授权类型选择
.type-chips {
  display: flex;
  gap: 6px;
  flex: 1;
  justify-content: flex-end;

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

// 高亮匹配文本
:deep(.highlight-match) {
  color: #009100 !important;
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

          &.status-pending { color: #c8a12b; }
          &.status-processing { color: #009100; }
          &.status-completed { color: #888888; }
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

          &:last-child { margin-bottom: 0; }

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
      width: 99%;

      &.selected {
        background: #eaf7ea;
        border: 0.5px solid #009100;
      }

      &:last-child { margin-bottom: 0; }

      .feedback-serial {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
        padding-bottom: 12px;
        border-bottom: 0.5px solid #e6e6e5;
        margin-bottom: 12px;
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
      }
    }
  }
}
</style>
