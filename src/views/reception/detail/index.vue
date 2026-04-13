<template>
  <div class="work-order-detail">
    <div v-if="loading" class="loading-mask">
      <van-loading size="24px" vertical color="#009100">加载中...</van-loading>
    </div>
    <!-- 车辆信息卡片 -->
    <div class="vehicle-card">
      <div class="plate-row">
        <span class="plate-no">{{ detail.carPlate }}</span>
        <span v-if="detail.custTypeLabel" class="appointment-tag">{{ detail.custTypeLabel }}</span>
      </div>
      <div class="vehicle-model">{{ detail.vehModelName }} · {{ detail.vehProfileVin }}</div>
      <div class="info-row">
        <span class="label">保修日期：</span>
        <span class="value">{{ detail.startWarrantyDate }}</span>
      </div>
      <div class="info-row">
        <span class="label">车主：</span>
        <span class="value">{{ detail.customerName }} {{ detail.customerPhone }}</span>
      </div>
      <div class="info-row">
        <span class="label">绑车人：</span>
        <span class="value">{{ detail.bindingUser }} {{ detail.bindingPhone }}</span>
      </div>

      <div class="divider"></div>

      <div class="select-row">
        <span class="label">送修人</span>
        <div class="value-wrapper">
          <span class="tag">[{{ detail.repairPersonTag }}]</span>
          <span class="value">{{ detail.shuttleName }} {{ detail.shuttlePhone }}</span>
        </div>
      </div>

      <div class="select-row">
        <span class="label">业务类型</span>
        <div class="value-wrapper">
          <span class="value">{{ detail.businessTypeLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Tab导航 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="42px" @scroll="onTabScroll">
      <van-tab title="环检信息" name="inspection">
        <div class="tab-content">
          <div class="inspection-info">
            <!-- 进店里程数 -->
            <div class="section-card borderB">
              <div class="section-title">
                <div>进店里程数</div>
                <div>
                  <span class="number">{{ detail.mileage }}</span>
                  <span class="unit">km</span>
                </div>
              </div>
              <div class="sub-info">车联网里程数(总)：{{ detail.netMileage }}km</div>
              <div class="sub-info">车联网里程数(增)：{{ detail.netMileageExtend }}km</div>
            </div>

            <!-- 进店电量 -->
            <div class="section-card borderB">
              <div class="section-title">
                <div>进店电量</div>
                <div>
                  <span class="number">{{ detail.inPower }}</span>
                  <span class="unit">%</span>
                </div>
              </div>
              <div class="sub-info">车联网电量: {{ detail.inNetPower }}%</div>
            </div>

            <!-- 车内检查 -->
            <div class="section-card borderB">
              <div class="section-title">车内检查</div>
              <div class="image-grid readonly">
                <div
                  v-for="(img, index) in detail.interiorPhotos"
                  :key="'interior-' + index"
                  class="image-item"
                >
                  <van-image :src="img" fit="cover" />
                </div>
              </div>
            </div>

            <!-- 车外检查 -->
            <div class="section-card borderB">
              <div class="section-title">车外检查</div>
              <div class="image-grid readonly">
                <div
                  v-for="(img, index) in detail.exteriorPhotos"
                  :key="'exterior-' + index"
                  class="image-item"
                >
                  <van-image :src="img" fit="cover" />
                </div>
              </div>
            </div>

            <!-- 异常描述 -->
            <div class="section-card borderB">
              <div class="section-title">异常描述</div>
              <div class="expandable-text" :class="{ expanded: abnormalDescExpanded }">
                {{ detail.anomalyDescription || '无' }}
              </div>
              <div
                v-if="abnormalDescNeedExpand"
                class="expand-btn"
                @click="abnormalDescExpanded = !abnormalDescExpanded"
              >
                {{ abnormalDescExpanded ? '收起' : '展开' }}
              </div>
            </div>
          </div>
          <div class="fault-info">
            <!-- 是否存在故障 -->
            <div class="fault-toggle-section">
              <span class="title">本次进店是否存在故障</span>
              <div class="toggle-wrapper">
                <!-- <van-icon name="checked" size="20px" color="#009100" /> -->
                <span class="toggle-text">{{ detail.currentFaultLabel }}</span>
              </div>
            </div>

            <!-- 故障模块列表 -->
            <div class="fault-modules" v-if="detail.faultAlertRecordRespList.length">
              <div class="modules-list">
                <div
                  v-for="(module, index) in detail.faultAlertRecordRespList"
                  :key="index"
                  class="fault-module-item"
                >
                  <span class="module-name">{{ module.name }}</span>
                </div>
              </div>
            </div>

            <!-- 客户故障描述 -->
            <div class="section-card" v-if="detail.currentFault === '1'">
              <div class="section-title">客户故障描述</div>
              <div class="expandable-text" :class="{ expanded: customerFaultDescExpanded }">
                {{ detail.customerContent || '无' }}
              </div>
              <div
                v-if="customerFaultDescNeedExpand"
                class="expand-btn"
                @click="customerFaultDescExpanded = !customerFaultDescExpanded"
              >
                {{ customerFaultDescExpanded ? '收起' : '展开' }}
              </div>
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="项目零件" name="parts">
        <div class="tab-content parts-tab">
          <!-- 费用汇总 -->
          <div style="padding: 12px; background: #fff">
            <div class="cost-summary">
              <div class="summary-row">
                <span class="label">维修项目</span>
                <span class="amount">¥{{ partsData.workCostCount }}</span>
              </div>
              <span class="operator">+</span>
              <div class="summary-row">
                <span class="label">维修配件</span>
                <span class="amount">¥{{ partsData.barkCostCount }}</span>
              </div>
              <span class="operator">=</span>
              <div class="summary-row total">
                <span class="label">费用合计</span>
                <span class="amount">¥{{ partsData.maintenanceCostEstimation }}</span>
              </div>
            </div>
          </div>

          <!-- 维修项目列表 -->
          <div v-if="partsData.repairItemRespList.length" style="padding: 12px">
            <div class="section-title" style="margin-bottom: 8px">维修项目</div>
            <div
              v-for="(repairItem, rIndex) in partsData.repairItemRespList"
              :key="'repair-' + rIndex"
              class="parts-item-card"
            >
              <div class="item-main">
                <div class="item-left">
                  <div class="item-name">{{ repairItem.repairItemName }}</div>
                  <div class="item-code">{{ repairItem.repairItemCode }}</div>
                  <div class="item-code">
                    {{ repairItem.repairItemTypeName }}-{{ repairItem.checkoutTypeName }}-{{
                      repairItem.warrantyTypeName
                    }}
                  </div>
                </div>
                <div class="item-right">
                  <div class="item-price">¥{{ repairItem.repairAmount }}</div>
                  <div class="item-discount">优惠 ¥{{ repairItem.discountAmount }}</div>
                </div>
              </div>
              <div class="item-footer">
                <span class="item-subtotal">¥{{ repairItem.price }}</span>
                <!-- <span class="item-quantity">x{{ repairItem.quantity }}</span> -->
              </div>
            </div>
          </div>

          <!-- 套餐列表 -->
          <div v-if="partsData.packageRespList.length" style="padding: 12px">
            <div
              v-for="(packageItem, pIndex) in partsData.packageRespList"
              :key="'package-' + pIndex"
              class="package-card"
            >
              <div class="package-header">
                <span class="package-name"
                  >{{ packageItem.packageTypeLabel }}-{{ packageItem.packageCount }}</span
                >
              </div>
              <!-- 项目列表 -->
              <!-- <div class="item-main">
                <div class="item-left">
                  <div class="item-name">{{ packageItem.repairItemName }}</div>
                  <div class="item-code">{{ packageItem.repairItemCode }}</div>
                  <div class="item-code">
                    {{ packageItem.repairItemTypeName }}-{{ packageItem.checkoutTypeName }}-{{
                      packageItem.warrantyTypeName
                    }}
                  </div>
                </div>
                <div class="item-right">
                  <div class="item-price">¥{{ packageItem.price }}</div>
                  <div class="item-discount">优惠 ¥{{ packageItem.discountAmount }}</div>
                </div>
              </div>
              <div class="item-footer">
                <span class="item-subtotal">¥{{ packageItem.repairAmount }}</span>
                <span class="item-quantity">x{{ packageItem.quantity }}</span>
              </div> -->
            </div>
          </div>

          <!-- 维修配件列表 -->
          <div v-if="partsData.sparePartRespList.length" style="padding: 12px">
            <div class="section-title" style="margin-bottom: 8px">维修配件</div>
            <div
              v-for="(sparePart, sIndex) in partsData.sparePartRespList"
              :key="'spare-' + sIndex"
              class="parts-item-card"
            >
              <div class="item-main">
                <div class="item-left">
                  <div class="item-name-row">
                    <span class="item-name">{{ sparePart.partsName }}</span>
                    <span v-if="sparePart.isOemPart" class="oem-tag">原厂件</span>
                  </div>
                  <div class="item-code">{{ sparePart.partsCode }}</div>
                  <div class="item-category">
                    {{ sparePart.partsTypeName }}-{{ sparePart.checkoutTypeName }}-{{
                      sparePart.warrantyTypeName
                    }}
                  </div>
                </div>
                <div class="item-right">
                  <div class="item-price">¥{{ sparePart.price }}</div>
                  <div class="item-discount">优惠 ¥{{ sparePart.discountAmount }}</div>
                </div>
              </div>
              <div class="item-footer">
                <div class="footer-info">
                  <span class="item-subtotal">¥{{ sparePart.partsAmount }}</span>
                  <span class="footer-divider">|</span>
                  <span class="footer-text">实际领料 {{ sparePart.actualPickNumber }}</span>
                  <span class="footer-divider">|</span>
                  <span class="footer-text">退料 {{ sparePart.refundedNumber }}</span>
                </div>
                <span class="item-quantity">x{{ sparePart.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="签字确认" name="signature">
        <div class="tab-content signature-tab">
          <!-- 费用合计 -->
          <div class="signature-section">
            <div class="signature-row">
              <span class="label">费用合计</span>
              <span class="value">¥{{ signatureData.maintenanceCostEstimation }}</span>
            </div>
            <div class="signature-row">
              <span class="label">维修类型</span>
              <span class="value">{{ signatureData.repairItemTypeDetailCollect }}</span>
            </div>
            <div class="signature-row">
              <span class="label">预计交车时间</span>
              <span class="value">{{ signatureData.expectFinishAt || '-' }}</span>
            </div>
            <div class="signature-row">
              <span class="label">开启维修直播</span>
              <van-switch
                v-model="signatureData.isLive"
                size="20"
                active-color="#009100"
                disabled
              />
            </div>
            <div class="signature-row">
              <span class="label">签字渠道</span>
              <span class="value">{{ signatureData.signChannel || '-' }}</span>
            </div>
            <div class="signature-row">
              <span class="label">签字状态</span>
              <span class="value">{{ signatureData.signStatusLabel || '-' }}</span>
            </div>
          </div>

          <!-- 附件信息 -->
          <div class="attachment-section" v-if="signatureData.attachments.length > 0">
            <div class="section-title">附件信息</div>
            <div class="attachment-list">
              <div
                v-for="(file, index) in signatureData.attachments"
                :key="'attachment-' + index"
                class="attachment-item"
                @click="onPreviewFile(file)"
              >
                <div class="file-icon">
                  <van-image
                    v-if="file.isImage"
                    :src="file.fileUrl"
                    fit="cover"
                    class="file-preview"
                  />
                  <img v-else :src="getFileIconPath(file)" class="file-type-icon" />
                </div>
                <div class="file-info">
                  <div class="file-name">{{ file.fileName || '未命名文件' }}</div>
                  <div class="file-size">{{ formatFileSize(file.fileSize) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <span class="more-btn" @click="onMore">更多</span>
    </div>
    <!-- 更多操作 -->
    <van-action-sheet
      v-model:show="showMoreActions"
      :actions="moreActionsList"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectMoreAction"
    >
    </van-action-sheet>
    <!-- 作废原因弹框 -->
    <ais-popup
      :show="showCancelReason"
      position="bottom"
      title="作废原因"
      @close="showCancelReason = false"
      :style="{ background: '#f4f4f4', height: '50%' }"
    >
      <template #content>
        <div class="cancel-reason-content">
          <van-field
            v-model="cancelReason"
            type="textarea"
            placeholder="请输入作废原因"
            rows="4"
            autosize
            show-word-limit
            maxlength="200"
            style="background: #f4f4f4; border-radius: 6px"
          />
        </div>
        <!-- 作废操作Loading -->
        <van-overlay :show="cancelLoading" class-name="cancel-loading-overlay">
          <div class="loading-wrapper">
            <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
          </div>
        </van-overlay>
      </template>
      <template #footer>
        <van-button class="confirm-btn" @click="onConfirmCancel">确定</van-button>
      </template>
    </ais-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { useGlobalStore } from '@/stores/global'
import AisPopup from '@/libs/components/AisPopup.vue'
import { getDetail, serviceProxyCancel } from '@/api/reception'
import { getFileList } from '@/libs/api/fileConfig'
import { isFileType } from '@/libs/utils/file'
import './detail.scss'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
const changeCarDialog = ref(false)
const loading = ref(false)
const cancelLoading = ref(false)

const moreActionsList = [
  { name: '权益查询', tag: '1', color: '#191a1b' },
  { name: '维修履历', tag: '2', color: '#191a1b' },
  { name: '实时故障', tag: '3', color: '#191a1b' },
  { name: '作废', tag: '4', color: '#191a1b' },
]
// 作废原因弹框状态
const showCancelReason = ref(false)
// 作废原因
const cancelReason = ref('')
// 更多操作选择内容
const onSelectMoreAction = (action) => {
  console.log(action)
  if (action.name === '作废') {
    cancelReason.value = ''
    showCancelReason.value = true
  }
  if (action.name === '维修履历') {
    router.push({
      path: '/reception/maintenance-history',
      query: {
        id: route.query.id,
      },
    })
  }
  if (action.name === '权益查询') {
    router.push({
      path: '/reception/rights-query',
      query: {
        id: route.query.id,
      },
    })
  }
}
// 确认作废
const onConfirmCancel = () => {
  if (!cancelReason.value.trim()) {
    showToast('请输入作废原因')
    return
  }
  cancelLoading.value = true
  serviceProxyCancel({
    id: detail.value.id,
    invaildDesc: cancelReason.value,
  })
    .then((res) => {
      if (res.code === 200) {
        showToast('操作成功')
        showCancelReason.value = false
        cancelReason.value = ''
        router.push('/reception/work-order')
      } else {
        showToast(res.msg || '操作失败')
      }
    })
    .finally(() => {
      cancelLoading.value = false
    })
}

const onTabScroll = (e) => {
  if (e.isFixed) {
    // 触发吸顶时设置标题
    globalStore.setTitle(detail.value.carPlate)
  } else {
    globalStore.setTitle('施工单详情')
  }
}
// Tab状态
const activeTab = ref('inspection')
// 可展开文本状态
const abnormalDescExpanded = ref(false)
const abnormalDescNeedExpand = ref(false)
const customerFaultDescExpanded = ref(false)
const customerFaultDescNeedExpand = ref(false)

// 选择器显示状态
const showMoreActions = ref(false)

// 详情数据
const detail = ref({
  // 车辆信息
  carPlate: '',
  isAppointment: false,
  vehicleModel: '',
  vin: '',
  startWarrantyDate: '',
  customerName: '',
  customerPhone: '',
  bindingUser: '',
  bindingPhone: '',
  shuttleName: '',
  shuttlePhone: '',
  repairPersonTag: '',
  businessTypeLabel: '',
  // 环检信息
  mileage: '',
  netMileage: '',
  netMileageExtend: '',
  inPower: '',
  inNetPower: '',
  interiorPhotos: [],
  exteriorPhotos: [],
  anomalyDescription: '',
  currentFault: '',
  faultAlertRecordRespList: [],
  customerContent: '',
})
// 项目零件数据
const partsData = reactive({
  workCostCount: '',
  barkCostCount: '',
  maintenanceCostEstimation: '',
  repairItemRespList: [],
  packageRespList: [],
  sparePartRespList: [],
})

// 签字确认数据
const signatureData = reactive({
  maintenanceCostEstimation: '',
  repairItemTypeDetailCollect: '',
  expectFinishAt: '',
  isLive: false,
  signChannel: '',
  signStatusLabel: '',
  attachments: [],
})

// 获取详情
const fetchDetail = async () => {
  const id = route.query.id
  if (!id) return
  loading.value = true
  getDetail(id)
    .then((res) => {
      console.log('获取详情成功:', res)
      if (res.code === 200) {
        const data = res.data
        detail.value = res.data
        // 车辆信息
        detail.value.isAppointment = !!data.appointmentNo // 有预约单号即为预约客户
        detail.value.repairPersonTag =
          detail.value.shuttleName === data.customerName
            ? '车主'
            : detail.value.shuttleName === data.bindingUser
              ? '绑车人'
              : '其他'
        // 图片处理
        detail.value.interiorPhotos = data.interiorPhotos
          ? data.interiorPhotos.split(',').filter(Boolean)
          : []
        detail.value.exteriorPhotos = data.exteriorPhotos
          ? data.exteriorPhotos.split(',').filter(Boolean)
          : []
        detail.value.anomalyDescription = data.anomalyDescription || ''
        detail.value.currentFault = String(data.currentFault || '')
        // 故障模块列表
        detail.value.faultAlertRecordRespList = data.faultAlertRecordRespList || []
        detail.value.customerContent = data.customerContent || ''

        // 签字确认数据
        signatureData.maintenanceCostEstimation =
          data.costCountResp.maintenanceCostEstimation || '0.00'
        signatureData.repairItemTypeDetailCollect = data.repairItemTypeDetailCollect || ''
        signatureData.expectFinishAt = data.expectFinishAt || ''
        signatureData.isLive = data.isLive === 1
        signatureData.signChannel = getSignChannelName(data.signChannel)
        signatureData.signStatusLabel = data.signStatusLabel
        signatureData.attachments = data.attachmentPhotos
          ? data.attachmentPhotos.split(',').filter(Boolean)
          : []

        // 项目零件数据
        if (data.costCountResp) {
          partsData.workCostCount = data.costCountResp.workCostCount || '0.00'
          partsData.barkCostCount = data.costCountResp.barkCostCount || '0.00'
          partsData.maintenanceCostEstimation =
            data.costCountResp.maintenanceCostEstimation || '0.00'
          partsData.repairItemRespList = data.costCountResp.repairItemRespList || []
          partsData.packageRespList = data.costCountResp.packageRespList || []
          partsData.sparePartRespList = data.costCountResp.sparePartRespList || []
        }
      }
    })
    .finally(() => {
      loading.value = false
    })
}

// 签字渠道转换
const getSignChannelName = (channel) => {
  const channelMap = {
    40: '纸质单据',
    999: 'APP/短信/零小跑',
  }
  return channelMap[channel] || ''
}

// 加载附件列表
const loadAttachmentList = async () => {
  if (!route.query.id) return
  try {
    const res = await getFileList({ businessId: route.query.id, attachType: '' })
    if (res.code === 200 && res.data) {
      signatureData.attachments = res.data.map((file) => ({
        ...file,
        isImage: isFileType(file, 'image'),
        isPdf: isFileType(file, 'pdf'),
        isExcel: isFileType(file, 'excel'),
        isWord: isFileType(file, 'word'),
        isPpt: isFileType(file, 'ppt'),
        isVideo: isFileType(file, 'video'),
        isZip: isFileType(file, 'zip') || isFileType(file, 'rar'),
      }))
    }
  } catch (error) {
    console.error('加载附件列表失败:', error)
  }
}

// 获取文件图标路径
const getFileIconPath = (file) => {
  if (file.isImage) return file.fileUrl
  if (file.isPdf) return require('@/libs/components/AisAttachment/icon/pdf.png')
  if (file.isExcel) return require('@/libs/components/AisAttachment/icon/xls.png')
  if (file.isWord) return require('@/libs/components/AisAttachment/icon/word.png')
  if (file.isPpt) return require('@/libs/components/AisAttachment/icon/ppt.png')
  if (file.isVideo) return require('@/libs/components/AisAttachment/icon/video.png')
  if (file.isZip) return require('@/libs/components/AisAttachment/icon/zip.png')
  return require('@/libs/components/AisAttachment/icon/text.png')
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let fileSize = size
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  return fileSize.toFixed(1) + ' ' + units[index]
}

// 预览文件
const onPreviewFile = (file) => {
  if (file.isImage) {
    showImagePreview({
      images: [file.fileUrl],
      startPosition: 0,
      showIndex: false,
    })
  }
}

// 更多操作
const onMore = () => {
  showMoreActions.value = !showMoreActions.value
}

onMounted(() => {
  fetchDetail()
  nextTick(() => {
    const el = document.querySelector('.expandable-text')
    if (el) {
      // 判断实际高度是否超过 3 行高度
      const lineHeight = 20 // 根据实际行高调整
      abnormalDescNeedExpand.value = el.scrollHeight > lineHeight * 3
    }
  })
  // 加载附件列表
  loadAttachmentList()
})
</script>
<style lang="scss" scoped>
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
:deep(.van-action-sheet__cancel) {
  color: #191a1b;
}

.cancel-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
