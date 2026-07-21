<template>
  <div class="work-order-create">
    <!-- 车辆信息卡片 -->
    <div class="vehicle-card">
      <div class="plate-row">
        <span class="plate-no">{{ detail.plateNo }}</span>
        <span class="appointment-tag">{{ detail.custTypeLabel }}</span>
        <span
          v-if="Number(detail.orderStatus) === RepairOrderStatusEnum.RECEPTION_INSPECTION"
          class="edit-plate edit-plate-after"
          @click="onChangeCar"
        >
          <span style="position: relative; top: 2px;"><img src="@/assets/image/change-car.svg" alt="" /></span>
          <span>换车</span>
        </span>
        <span
          v-if="Number(detail.orderStatus) !== RepairOrderStatusEnum.DELIVERED && Number(detail.orderStatus) !== RepairOrderStatusEnum.CANCEL"
          class="edit-plate"
          @click="onEditPlate"
        >
          <span style="position: relative; top: 1px;"><img src="@/assets/image/edit.svg" alt="" /></span>
          <span>修改车牌</span>
        </span>
      </div>
      <div class="vehicle-model">{{ detail.vehicleModel }} · {{ detail.vin }}</div>
      <div class="info-row">
        <span class="label">保修日期：</span>
        <span class="value"
          >{{ detail.vehicleProfileServiceResp.warrantyStartdate }} 至
          {{ detail.vehicleProfileServiceResp.warrantyEnddateForecast }}</span
        >
      </div>
      <div class="info-row">
        <span class="label">车主：</span>
        <span class="value">{{ detail.owner }} {{ detail.ownerPhone }}</span>
      </div>
      <div class="info-row">
        <span class="label">绑车人：</span>
        <span class="value">{{ detail.bindingUser }} {{ detail.binderPhone }}</span>
      </div>
      <!-- 送修人折叠面板 -->
      <van-collapse v-model="repairPersonCollapse" class="collapse-panel">
        <van-collapse-item name="repairPerson">
          <template #title>
            <div class="select-row">
              <span class="label">送修人</span>
              <div class="value-wrapper">
                <span class="tag">[送修人]</span>
                <span class="value">{{ detail.repairPerson }} {{ detail.repairPersonPhone }}</span>
              </div>
            </div>
          </template>
          <div class="collapse-content">
            <!-- 类型选择 -->
            <div class="type-selector">
              <div
                :class="['type-item', { active: repairPersonType === 'other' }]"
                @click="onSelectRepairPersonType('other')"
              >
                送修人
              </div>
              <div
                :class="['type-item', { active: repairPersonType === 'owner' }]"
                @click="onSelectRepairPersonType('owner')"
              >
                车主
              </div>
              <div
                :class="['type-item', { active: repairPersonType === 'bindingUser' }]"
                @click="onSelectRepairPersonType('bindingUser')"
              >
                绑车人
              </div>
            </div>
            <!-- 送修人信息 -->
            <div class="repair-person-info">
              <div class="info-row">
                <span class="label">{{ repairPersonInputLabel }}姓名</span>
                <div class="value-wrapper">
                  <input
                    v-model="repairPersonNameInput"
                    type="text"
                    :placeholder="repairPersonInputDisabled ? '' : '请输入姓名'"
                    class="edit-input"
                    :disabled="repairPersonInputDisabled"
                    data-scroll-target="repairPersonName"
                    @input="onRepairPersonNameChange"
                  />
                  <img
                    v-if="!repairPersonInputDisabled"
                    src="@/assets/images/icon_edit.svg"
                    class="edit-icon"
                  />
                </div>
              </div>
              <div class="info-row">
                <span class="label">{{ repairPersonInputLabel }}手机</span>
                <div class="value-wrapper">
                  <input
                    v-model="repairPersonPhoneInput"
                    type="tel"
                    :placeholder="repairPersonInputDisabled ? '' : '请输入手机号'"
                    class="edit-input"
                    :disabled="repairPersonInputDisabled"
                    maxlength="11"
                    data-scroll-target="repairPersonPhone"
                    @input="onRepairPersonPhoneChange"
                  />
                  <img
                    v-if="!repairPersonInputDisabled"
                    src="@/assets/images/icon_edit.svg"
                    class="edit-icon"
                  />
                </div>
              </div>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>

      <!-- 业务类型 -->
      <BusinessTypeSelector v-model="detail.businessType" :readonly="isAppointment" />
    </div>

    <!-- Tab导航 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="42px" @scroll="onTabScroll">
      <van-tab title="环检信息" name="inspection">
        <div class="tab-content">
          <div class="inspection-info">
            <!-- 进店里程数 -->
            <div class="section-card borderB" data-scroll-target="mileage">
              <div class="section-title section-field">
                <div><span class="required">*</span>进店里程数</div>
                <div class="editable-field">
                  <van-field
                    v-model="detail.mileage"
                    type="number"
                    placeholder="请输入"
                    :border="false"
                  >
                    <template #button>
                      <span class="unit">km</span>
                      <img src="@/assets/images/icon_edit.svg" class="edit-icon" />
                    </template>
                  </van-field>
                </div>
              </div>
              <div class="sub-info">车联网里程数(总)：{{ detail.networkMileageTotal }} km</div>
              <div v-if="detail.networkMileageAdd" class="sub-info">
                车联网里程数(增)：{{ detail.networkMileageAdd }} km
              </div>
            </div>

            <!-- 进店电量 -->
            <div class="section-card borderB">
              <div class="section-title section-field">
                <div>进店电量</div>
                <div class="editable-field">
                  <van-field
                    v-model="detail.battery"
                    type="number"
                    placeholder="请输入"
                    :border="false"
                    max="100"
                    min="0"
                  >
                    <template #button>
                      <span class="unit">%</span>
                      <img src="@/assets/images/icon_edit.svg" class="edit-icon" />
                    </template>
                  </van-field>
                </div>
              </div>
              <div class="sub-info">车联网电量: {{ detail.networkBattery }}%</div>
            </div>

            <!-- 车内照片 -->
            <div class="card-container marginB1" data-scroll-target="interiorPhotos">
              <div class="card-info-title marginB1">
                车内照片
                <span v-if="interiorConfig.required === '1'" style="color: #b91919; font-size: 15px"
                  >*</span
                >
              </div>
              <div class="upload-content">
                <div
                  class="upload-box"
                  v-for="(file, index) in detail.interiorImages"
                  :key="file.id || index"
                >
                  <img
                    style="width: 100%; height: 100%; margin-bottom: 0"
                    :src="getFilePreviewUrl(file)"
                    @click="showImg(getFilePreviewUrl(file))"
                  />
                  <img
                    class="delete_icon"
                    src="@/assets/image/delete_icon.png"
                    @click="handleInteriorDelete(file)"
                  />
                </div>
                <div
                  class="upload-box upload-placeholder"
                  v-if="detail.interiorImages.length < (interiorConfig.maxNum || 3)"
                  @click="uploadGeneric('interior')"
                >
                  <svg class="icon upload-img" aria-hidden="true">
                    <use xlink:href="#icon-lxp-h5upload-mob"></use>
                  </svg>
                </div>
              </div>
            </div>

            <!-- 车外照片 -->
            <div class="card-container marginB1" data-scroll-target="exteriorPhotos">
              <div class="card-info-title marginB1">
                车外照片
                <span v-if="exteriorConfig.required === '1'" style="color: #b91919; font-size: 15px"
                  >*</span
                >
              </div>
              <div class="upload-content">
                <div
                  class="upload-box"
                  v-for="(file, index) in detail.exteriorImages"
                  :key="file.id || index"
                >
                  <img
                    style="width: 100%; height: 100%; margin-bottom: 0"
                    :src="getFilePreviewUrl(file)"
                    @click="showImg(getFilePreviewUrl(file))"
                  />
                  <img
                    class="delete_icon"
                    src="@/assets/image/delete_icon.png"
                    @click="handleExteriorDelete(file)"
                  />
                </div>
                <div
                  class="upload-box upload-placeholder"
                  v-if="detail.exteriorImages.length < (exteriorConfig.maxNum || 3)"
                  @click="uploadGeneric('exterior')"
                >
                  <svg class="icon upload-img" aria-hidden="true">
                    <use xlink:href="#icon-lxp-h5upload-mob"></use>
                  </svg>
                </div>
              </div>
            </div>

            <!-- 异常描述 -->
            <div class="section-card">
              <div class="section-title" style="justify-content: flex-start">
                <span class="required">*</span>异常描述
              </div>
              <van-field
                v-model="detail.abnormalDesc"
                type="textarea"
                placeholder="请输入异常描述"
                rows="3"
                autosize
                show-word-limit
                maxlength="500"
                data-scroll-target="abnormalDesc"
                style="background: #f5f5f5; border-radius: 6px"
              />
            </div>
            <div class="section-card">
              <div class="section-title" style="justify-content: flex-start">客户诉求</div>
              <van-field
                v-model="detail.customerComment"
                type="textarea"
                placeholder="请输入客户诉求"
                rows="3"
                autosize
                show-word-limit
                maxlength="500"
                style="background: #f5f5f5; border-radius: 6px"
              />
            </div>
            <div class="section-card">
              <div class="section-title" style="justify-content: flex-start">
                <span class="required">*</span>客户经理建议
              </div>
              <van-field
                v-model="detail.testResult"
                type="textarea"
                placeholder="请输入客户经理建议"
                rows="3"
                autosize
                show-word-limit
                maxlength="500"
                data-scroll-target="testResult"
                style="background: #f5f5f5; border-radius: 6px"
              />
            </div>
          </div>
          <FaultInfoSection
            v-model:current-fault="detail.currentFault"
            v-model:customer-fault-desc="detail.customerFaultDesc"
            v-model:fault-modules="detail.faultModules"
            mode="create"
            :service-proxy-id="serviceProxyId"
            :confirm-fault="detail.confirmFault"
          />
        </div>
      </van-tab>
    </van-tabs>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <span :class="['save-btn', { disabled: savingLoading }]" @click="onSave">保存</span>
    </div>
    <!-- 更换车牌 -->
    <!-- 更换车牌 -->
    <PlateKeyboard
      v-model:show="changePlateDialog"
      v-model="detail.plateNo"
      title="实名认证车辆"
      :subtitle="'原车牌：' + detail.plateNo"
      :exclude-vin="detail.vin"
    />
    <!-- 换车弹框 -->
    <ChangeCarPopup v-model:show="changeCarDialog" @confirm="onChangeCarSelected" />

    <!-- 全屏Loading -->
    <van-overlay :show="savingLoading">
      <div class="loading-wrapper">
        <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showImagePreview, closeToast, showLoadingToast } from 'vant'
import { useGlobalStore } from '@/stores/global'
import { usePageSafeArea } from '@/utils/safeArea'
import ChangeCarPopup from '../components/ChangeCarPopup.vue'
import FaultInfoSection from '../components/FaultInfoSection.vue'
import BusinessTypeSelector from '../components/BusinessTypeSelector.vue'
import {
  uploadFileByUrl,
  getUploadConfig,
  getFileList
} from '@/libs/api/fileConfig'

// 附件配置
const uploadConfig = ref({})

// 根据附件类型获取配置——已从 receptionCommon 导入，此处为组件绑定
// getAttachConfig、getTargetFileList 在下方声明

// 车内检查
const interiorConfig = computed(() => getAttachConfig('车内照片'))

// 车外检查
const exteriorConfig = computed(() => getAttachConfig('车外照片'))

// 图片上传相关
const currentUploadType = ref('') // 'interior' or 'exterior'

// 获取目标文件列表
// 上传配置获取（从共享模块导入，保留组件绑定）
const getTargetFileList = (type) => _getTargetFileList(type, detail, { attachments: attachmentsList.value })
const getAttachConfig = (attachType) => _getAttachConfig(attachType, uploadConfig)

// 文件预览/保存/类型已从 receptionCommon 导入
const normalizeAttachmentFile = (file) => {
  const rawUrl = file?.url || file?.fileUrl || ''
  return {
    ...file,
    url: rawUrl,
    fileUrl: rawUrl,
    authFileUrl: file?.authFileUrl || rawUrl,
    fileType: getFileType(file)
  }
}
import { batchUploadImageLimit } from '@/libs/utils/nativeFn'
import {
  getVehicleInfo,
  getVehicleMileage,
  serviceAddOrUpdate,
  getReservationList
} from '@/api/reception'
import {
  getFilePreviewUrl,
  getFileType,
  formatPhotoList,
  hasDuplicateFileId,
  validateMileage,
  validateRepairPerson as _validateRepairPerson,
  scrollToErrorField,
  getAttachConfig as _getAttachConfig,
  getTargetFileList as _getTargetFileList,
  handleFileDelete as _handleFileDelete,
  applyRecentInspectionByVin,
  validateFileExtension,
  isUploadSilentFailure,
  refreshAttachmentList
} from '@/utils/receptionCommon'
import { RepairOrderStatusEnum, BusinessTypeEnum, CustTypeEnum, CustTypeLabelMap } from '../constant'
import PlateKeyboard from '@/libs/components/PlateKeyboard.vue'
import './create.scss'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })
const changeCarDialog = ref(false)
const changePlateDialog = ref(false)

// 是否从预约单进入：业务类型锁定为「预约到店」并只读
const isAppointment = computed(() => !!route.query.appointId && route.query.appointId !== 'null')

// 施工单状态
const serviceProxyId = ref('') // 新建保存后返回的施工单id

// 送修人类型选择
const repairPersonType = ref('other') // owner/bindingUser/other
const repairPersonNameInput = ref('')
const repairPersonPhoneInput = ref('')

// 折叠面板状态
const repairPersonCollapse = ref(['repairPerson'])

const onTabScroll = (e) => {
  if (e.isFixed) {
    // 触发吸顶时设置标题
    globalStore.setTitle(detail.plateNo)
  } else {
    globalStore.setTitle('新建施工单')
  }
}
// Tab状态
const activeTab = ref('inspection')

// 详情数据
const detail = reactive({
  id: '', // 施工单ID
  vehicleProfileServiceResp: {}, // 车辆档案
  plateNo: '',
  isAppointment: false,
  vehicleModel: '',
  vehicleModelName: '',
  vin: '',
  vehicleModelId: '',
  warrantyDate: '',
  owner: '',
  ownerPhone: '',
  bindingUser: '',
  binderPhone: '',
  bindingUserId: '',
  repairPerson: '',
  repairPersonPhone: '',
  repairPersonTag: '送修人',
  businessType: route.query.appointId ? BusinessTypeEnum.APPOINTMENT_ARRIVAL : BusinessTypeEnum.NATURAL_ARRIVAL,
  mileage: '',
  networkMileageTotal: '',
  networkMileageAdd: '',
  battery: '',
  networkBattery: '',
  interiorImages: [],
  exteriorImages: [],
  abnormalDesc: '',
  customerComment: '',
  currentFault: '1',
  faultAlertRecordRespList: [],
  faultModules: [],
  customerFaultDesc: '',
  testResult: '',
  // 新增字段
  code: '',
  dataSource: 180,
  orderStatus: '',
  warrantyTypeCollect: '',
  // 预约开单(有appointId)为预约客户，否则为随到客户
  custType: route.query.appointId ? CustTypeEnum.APPOINTMENT : CustTypeEnum.WALK_IN,
  custTypeLabel: CustTypeLabelMap[route.query.appointId ? CustTypeEnum.APPOINTMENT : CustTypeEnum.WALK_IN],
  salesDealerName: '',
  salesDealerCode: '',
  appointmentNo: '',
  lastMileage: null,
  remark: '',
  status: '',
  statusDesc: '',
  pickStatus: '',
  payType: '',
  warrantyCompany: '',
  signChannel: '',
  signUrl: '',
  signCompletedOn: '',
  signGeneratedOn: '',
  signStatus: '',
  signUrlExpiredOn: '',
  appointmentType: 0,
  preAuthType: '',
  isLockLive: '',
  isCreateWarranty: '',
  isOutboundOrder: '',
  isVehRetentionRemind: '',
  isCancelStorage: '',
  discountId: '',
  finalCheckAt: '',
  finalCheckerId: '',
  finalChecker: '',
  ticketStep: '',
  warrantyStatus: '',
  claimItemAmount: '',
  claimOtherAmount: '',
  claimPartsAmount: '',
  departureMileage: '',
  outPower: '',
  departureNetMileage: '',
  outNetPower: '',
  departureNetMileageElectricity: '',
  departureNetMileageExtend: '',
  electricalMileage: '',
  batteryModel: '',
  batterySerialNumber: '',
  enginenNumber: '',
  repairItemTypeDetailCollect: '',
  alarmLevel: '',
  isLive: '',
  inCustomerContent: '',
  invaildDesc: '',
  previewingFinishAt: '',
  confirmedOn: '',
  expectStartAt: '',
  startAt: '',
  finishAt: '',
  faultSolve: '',
  faultAlert: '',
  faultPeriod: '',
  earliestfaultServiceProxy: '',
  recentlyfaultServiceProxy: '',
  isCreateStatementInfo: 0,
  isPreAuth: '',
  isCreatePreAuth: '',
  preAuthRuleId: '',
  unresolvedReason: '',
  faultDesc: '',
  batteryUnitId: '',
  batteryUnitName: '',
  targetUnitCode: '',
  beforeChangeCode: '',
  afterChangeCode: '',
  isStoreLive: '',
  latelyServiceProxy: '',
  earlyServiceProxy: ''
})

// 初始环检数据快照
const initialInspectionData = ref(null)

// 检查环检数据是否有改动
const hasInspectionDataChanged = () => {
  if (!initialInspectionData.value) return false
  const initial = initialInspectionData.value
  const current = detail
  return (
    initial.mileage !== current.mileage ||
    initial.battery !== current.battery ||
    JSON.stringify(initial.interiorImages) !== JSON.stringify(current.interiorImages) ||
    JSON.stringify(initial.exteriorImages) !== JSON.stringify(current.exteriorImages) ||
    initial.abnormalDesc !== current.abnormalDesc ||
    initial.customerComment !== current.customerComment ||
    initial.currentFault !== current.currentFault ||
    initial.customerFaultDesc !== current.customerFaultDesc ||
    initial.businessType !== current.businessType ||
    initial.repairPerson !== current.repairPerson ||
    initial.repairPersonPhone !== current.repairPersonPhone ||
    JSON.stringify(initial.faultModules) !== JSON.stringify(current.faultModules) ||
    initial.plateNo !== current.plateNo ||
    initial.vin !== current.vin ||
    initial.vehicleModel !== current.vehicleModel ||
    initial.repairPersonTag !== current.repairPersonTag ||
    initial.testResult !== current.testResult
  )
}

const attachmentsList = ref([])

// 里程校验
// validateMileage 已从 receptionCommon 导入

// 获取详情
const fetchDetail = async() => {
  const id = serviceProxyId.value || route.query.id
  // 从sessionStorage获取车辆信息
  const vehicleInfoStr = sessionStorage.getItem('vehicleInfo')

  // 如果有车辆信息，则从车辆搜索页面跳转过来
  if (vehicleInfoStr && !route.query.serviceProxyId) {
    try {
      const item = JSON.parse(vehicleInfoStr)
      // 直接拷贝 item 所有值到 detail
      Object.assign(detail, item)
      // 设置一些派生字段用于页面显示
      detail.plateNo = item.vehiclePlateNo || ''
      detail.vehicleModel = item.vehicleModelName || item.vehicleModel || ''
      detail.owner = item.vehicleProfileOwnerResp?.ownerName || ''
      detail.ownerPhone = item.vehicleProfileOwnerResp?.mobilephone || ''
      detail.bindingUser = item.vehicleProfileOwnerResp?.bindingUser || ''
      detail.binderPhone = item.vehicleProfileOwnerResp?.bindingPhone || ''
      // 默认送修人为车主
      detail.repairPerson = item.vehicleProfileOwnerResp?.ownerName || ''
      detail.repairPersonPhone = item.vehicleProfileOwnerResp?.mobilephone || ''
      // detail.repairPersonTag = '车主'
      // repairPersonType.value = 'owner'
      // 初始化输入框
      repairPersonNameInput.value = item.vehicleProfileOwnerResp?.ownerName || ''
      repairPersonPhoneInput.value = item.vehicleProfileOwnerResp?.mobilephone || ''
      detail.vehicleProfileServiceResp = item.vehicleProfileServiceResp || {}
      // 获取车联网里程数
      if (detail.vin) {
        fetchVehicleMileage(detail.vin)
      }
    } catch (e) {
      console.error('解析车辆信息失败:', e)
    }
    return
  }

  if (!id) return
  // 调用接口获取详情
  console.log('获取详情:', id)

  // 获取附件列表并分类回显
  getFileList({
    businessId: id,
    sortColumns: [
      { 'column': 'id', 'sort': 'ASC' }
    ]
  }).then((fileRes) => {
    if (fileRes.code === 200) {
      const fileList = fileRes.data || []
      // 清空列表
      detail.interiorImages = []
      detail.exteriorImages = []
      attachmentsList.value = []
      // 用于存储最新的制单签字
      let latestSignFile = null
      // 根据 attachType 分类回显文件
      fileList.forEach((item) => {
        const fileObj = normalizeAttachmentFile(item)
        switch (item.attachType) {
          case '车内照片':
            detail.interiorImages.push(fileObj)
            break
          case '车外照片':
            detail.exteriorImages.push(fileObj)
            break
          case '附件资料':
            attachmentsList.value.push(fileObj)
            break
          case '制单签字':
            // 对比createTime，保留最新的制单签字
            if (!latestSignFile || new Date(item.createTime) > new Date(latestSignFile.createTime)) {
              latestSignFile = item
            }
            break
        }
      })
      // 将最新的制单签字赋值给detail.signUrl
      if (latestSignFile) {
        detail.signUrl = latestSignFile.fileUrl
      }
    }
  })
}
// 打开换车弹框
const onChangeCar = () => {
  changeCarDialog.value = true
}

// 获取车联网里程数
const fetchVehicleMileage = async(vin) => {
  if (!vin) return
  try {
    const res = await getVehicleMileage(vin)
    if (res.code === 200 && res.data) {
      detail.networkMileageTotal = res.data.mileage || ''
      detail.networkMileageAdd = res.data.oilMileage || ''
      detail.networkBattery = res.data.electricity || ''
      detail.electricalMileage = res.data.electricMileage || ''
      detail.mileage = res.data.mileage || ''
      detail.battery = res.data.electricity || ''
    }
  } catch (error) {
    console.error('获取车联网里程失败:', error)
  }
}

// 换车弹窗确认回调：将选中车辆数据映射到 detail，并同步送修人、车联网里程、近期环检信息
const onChangeCarSelected = (carInfo) => {
  detail.plateNo = carInfo.vehiclePlateNo || ''
  detail.vin = carInfo.vin || ''
  detail.vehicleModel = carInfo.vehicleModelName || carInfo.vehicleModel || ''
  detail.warrantyDate = carInfo.warrantyDate || ''
  detail.owner = carInfo.vehicleProfileOwnerResp?.ownerName || ''
  detail.ownerPhone = carInfo.vehicleProfileOwnerResp?.mobilephone || ''
  detail.bindingUser = carInfo.vehicleProfileOwnerResp?.bindingUser || ''
  detail.binderPhone = carInfo.vehicleProfileOwnerResp?.bindingPhone || ''
  detail.vehicleProfileServiceResp = carInfo.vehicleProfileServiceResp || {}

  // 更新送修人信息为当前车主
  detail.repairPerson = detail.owner
  detail.repairPersonPhone = detail.ownerPhone
  repairPersonType.value = 'other'
  repairPersonNameInput.value = detail.owner
  repairPersonPhoneInput.value = detail.ownerPhone

  if (detail.vin) {
    fetchVehicleMileage(detail.vin)
  }

  // 获取上次环检信息并回显
  applyRecentInspectionByVin(detail.vin, detail)
}
// 修改车牌
const onEditPlate = () => {
  changePlateDialog.value = true
}

// 通用上传方法
const uploadGeneric = (type) => {
  currentUploadType.value = type
  // attachType 映射
  const attachTypeMap = {
    interior: '车内照片',
    exterior: '车外照片',
    attachment: '附件资料'
  }
  const config = getAttachConfig(attachTypeMap[type] || '车内照片')
  const maxSize = config.maxSize || 10
  // 已上传数量（最大选择数量=config.maxNum-当前已上传数量，区间1-9）
  const targetList = getTargetFileList(type)
  const hasUploadNumber = targetList.length

  // 如果已上传数量等于最大数量，不可上传（maxNum为null时不限制）
  if (config.maxNum !== null && config.maxNum !== undefined && hasUploadNumber >= config.maxNum) {
    showToast('已达到最大上传数量')
    return
  }

  // 计算最大可选数量：maxNum有值时用maxNum，无值时不限制传999
  const maxSelectNum = config.maxNum || 20
  batchUploadImageLimit(maxSize, maxSelectNum, hasUploadNumber)
}

// 预览图片
const showImg = (url) => {
  showImagePreview([url])
}

// 文件删除已从 receptionCommon 导入，此处为组件绑定
const handleInteriorDelete = (file) => _handleFileDelete(file, 'interior', detail, { attachments: attachmentsList.value })
const handleExteriorDelete = (file) => _handleFileDelete(file, 'exterior', detail, { attachments: attachmentsList.value })

// 送修人输入框是否禁用（车主/绑车人不可编辑，其他可编辑）
const repairPersonInputDisabled = computed(() => repairPersonType.value !== 'other')

// 送修人输入框标签文案（车主/绑车人/其他显示不同文案）
const repairPersonInputLabel = computed(() => {
  if (repairPersonType.value === 'owner') return '车主'
  if (repairPersonType.value === 'bindingUser') return '绑车人'
  return '送修人'
})

// 选择送修人类型
const onSelectRepairPersonType = (type) => {
  repairPersonType.value = type
  if (type === 'owner') {
    repairPersonNameInput.value = detail.owner
    repairPersonPhoneInput.value = detail.ownerPhone
  } else if (type === 'bindingUser') {
    repairPersonNameInput.value = detail.bindingUser
    repairPersonPhoneInput.value = detail.binderPhone
  } else {
    repairPersonNameInput.value = detail.repairPerson
    repairPersonPhoneInput.value = detail.repairPersonPhone
  }
}

// 送修人姓名变化
const onRepairPersonNameChange = () => {
  detail.repairPerson = repairPersonNameInput.value
}

// 送修人手机变化
const onRepairPersonPhoneChange = () => {
  detail.repairPersonPhone = repairPersonPhoneInput.value
}

// 保存
const validateRepairPerson = () => _validateRepairPerson(repairPersonType.value, detail.repairPerson, detail.repairPersonPhone)
// hasDuplicateFileId 已从 receptionCommon 导入

const savingLoading = ref(false)

const onSave = async() => {
  console.log('保存:', detail)
  if (savingLoading.value) return
  savingLoading.value = true
  const repairResult = validateRepairPerson()
  if (!repairResult.valid) {
    repairPersonType.value = 'other'
    scrollToErrorField({ errorField: repairResult.errorField, activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 进店里程数必填校验
  if (!detail.mileage) {
    showToast('请输入进店里程数')
    scrollToErrorField({ errorField: 'mileage', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 照片校验（根据配置判断是否必填）
  if (interiorConfig.value.required === '1' && detail.interiorImages.length === 0) {
    showToast('请上传车内照片')
    scrollToErrorField({ errorField: 'interiorPhotos', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  if (exteriorConfig.value.required === '1' && detail.exteriorImages.length === 0) {
    showToast('请上传车外照片')
    scrollToErrorField({ errorField: 'exteriorPhotos', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 检查车内、车外照片是否有重复文件
  if (hasDuplicateFileId(detail.interiorImages)) {
    showToast('车内照片存在重复文件，请检查')
    scrollToErrorField({ errorField: 'interiorPhotos', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  if (hasDuplicateFileId(detail.exteriorImages)) {
    showToast('车外照片存在重复文件，请检查')
    scrollToErrorField({ errorField: 'exteriorPhotos', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 异常描述
  if (!detail.abnormalDesc) {
    showToast('请输入异常描述')
    scrollToErrorField({ errorField: 'abnormalDesc', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 经理建议
  if (!detail.testResult) {
    showToast('请输入客户经理建议')
    scrollToErrorField({ errorField: 'testResult', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 如果currentFault为"1"，必须添加故障模块
  if (Number(detail.currentFault) === 1 && detail.faultModules.length === 0) {
    showToast('请添加故障模块')
    scrollToErrorField({ errorField: 'faultModules', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 里程校验
  validateMileage(detail.mileage, detail.lastMileage, detail.networkMileageTotal)
  // 如果currentFault为"1"，客户故障描述必填
  const trimedCustomerFaultDesc = detail.customerFaultDesc.trim() || ''
  if (Number(detail.currentFault) === 1 && trimedCustomerFaultDesc.length <= 4) {
    showToast('请输入客户故障描述，【客户故障描述】字段需要大于4个字')
    scrollToErrorField({ errorField: 'customerFaultDesc', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }

  showLoadingToast('正在保存...')
  try {
    const res = await serviceAddOrUpdate({
      id: undefined,
      dataSource: 180, // 170零小跑PC端; 180零小跑APP端,
      appointmentType: detail.appointmentType, // 预约方式，默认0未预约
      customerName: detail.owner,
      customerPhone: detail.ownerPhone,
      vehModelName: detail.vehicleModelName,
      bindingPhone: detail.vehicleProfileOwnerResp?.bindingPhone,
      bindingUser: detail.vehicleProfileOwnerResp?.bindingUser,
      bindingUserId: detail.vehicleProfileOwnerResp?.bindingUserid,
      carPlate: detail.plateNo,
      mileage: detail.mileage,
      startWarrantyDate: detail.vehicleProfileServiceResp.warrantyStartdate || '',
      shuttleName: detail.repairPerson,
      shuttlePhone: detail.repairPersonPhone,
      inPower: detail.battery,
      netMileage: detail.networkMileageTotal,
      inNetPower: detail.networkBattery,
      netMileageElectricity: detail.electricalMileage,
      netMileageExtend: detail.networkMileageAdd,
      vehProfileVin: detail.vin,
      maintenanceMileage: detail.vehicleProfileServiceResp.nextMaintainMileages,
      maintenanceTime: detail.vehicleProfileServiceResp.nextMaintainDate,
      saleDate: detail.salesDate || '',
      vehModelId: detail.vehicleModelId,
      vehRegisteredModelId: detail.vehicleProfileServiceResp.carSaleSversionId,
      vehRegisteredModelName: detail.vehicleProfileServiceResp.carSalesVersionName,
      vehYearTypeId: detail.vehicleProfileServiceResp.vehicleYearId,
      vehYearTypeName: detail.vehicleProfileServiceResp.vehicleYearName,
      dedicatedServiceManager: detail.vehicleProfileServiceResp.serviceUserName,
      // batteryModel: detail.batteryModel,
      // batterySerialNumber: detail.batterySerialNumber,
      // engineNumber: detail.enginenNumber,
      businessType: detail.businessType,
      custType: detail.custType,
      haveRework: 0,
      customerComment: detail.customerComment,
      isCarWash: 0,
      isRetainOldParts: 0,
      testResult: detail.testResult,
      currentFault: Number(detail.currentFault),
      customerContent: detail.customerFaultDesc,
      anomalyDescription: detail.abnormalDesc,
      currentSituation: Number(detail.currentFault) === 1 ? 20 : 10,
      // faultModule: detail.faultModules.map((m) => m.cccCode).join(','),
      isCreateStatementInfo: 0,
      exteriorPhotoList: formatPhotoList(detail.exteriorImages, '车外照片', serviceProxyId.value || null),
      interiorPhotoList: formatPhotoList(detail.interiorImages, '车内照片', serviceProxyId.value || null),
      faultAlertRecordParams: detail.faultModules.map((m) => ({
        cccId: m.id || '',
        cccName: m.cccName || '',
        vfgId: m.vfgCode || '',
        vfgName: m.vfgName || '',
        vrtId: m.vrtCode || '',
        vrtName: m.vrtName || ''
      }))
    })
    if (res.code === 200) {
      closeToast()
      showToast('保存成功')
      // 新建时保存返回的施工单id，同步设置 detail.id 防止后续编辑保存时丢失
      if (res.data) {
        serviceProxyId.value = res.data
        detail.id = res.data
      }
      sessionStorage.setItem('receptionPartsSaved', '1')
      router.replace({
        path: '/reception/work-order/edit',
        query: {
          id: detail.id || serviceProxyId.value || route.query.id
        }
      })
      // // 同步更新快照，防止返回时误提示
      // saveDataSnapshot()
      // // 保存成功生成施工单后，清除sessionStorage中的车辆信息
      // sessionStorage.removeItem('vehicleInfo')
      // // 保存成功后获取详情数据更新（await 确保快照同步完成后再放开 loading）
      // await fetchDetailForSignature()
      // // 获取提醒信息
      // fetchRemindInfo()
    } else {
      showToast(res.msg || '保存失败')
    }
  } catch (res) {
    closeToast()
    showToast(res?.msg || '保存失败')
  } finally {
    savingLoading.value = false
  }
}

onMounted(async() => {
  // 如果推送开单，默认带vin时
  if (route.query.appointId && route.query.appointId !== 'null') { // 如果从预约单跳转过来，先查询预约信息获取VIN，再查询车辆信息存入sessionStorage
    try {
      const reservationRes = await getReservationList(route.query.appointId)
      if (reservationRes.code === 200 && reservationRes.data?.vin) {
        detail.appointmentType = reservationRes?.data?.appointmentSource || 0
        detail.businessType = reservationRes?.data?.mcsBusinesstype || 10
        const vehicleRes = await getVehicleInfo({ searchVin: reservationRes.data.vin })
        if (vehicleRes.code === 200 && vehicleRes.data?.length > 0) {
          sessionStorage.setItem('vehicleInfo', JSON.stringify(vehicleRes.data[0]))
        }
      }
    } catch (e) {
      console.error('获取预约车辆信息失败:', e)
    }
  } else if (route.query.vin) {
    try {
      detail.appointmentType = 0
      const vehicleRes = await getVehicleInfo({ searchVin: route.query.vin })
      if (vehicleRes.code === 200 && vehicleRes.data?.length > 0) {
        sessionStorage.setItem('vehicleInfo', JSON.stringify(vehicleRes.data[0]))
      }
    } catch (e) {
      console.error('获取预约车辆信息失败:', e)
    }
  }
  fetchDetail()
  // 获取上次环检信息
  const vehicleInfoStr = sessionStorage.getItem('vehicleInfo')
  // 如果没有相关信息，跳转到工单列表
  if (!route.query.appointId && !route.query.vin && !vehicleInfoStr) {
    router.replace('/reception/work-order')
    return
  }
  if (vehicleInfoStr) {
    const item = JSON.parse(vehicleInfoStr)
    applyRecentInspectionByVin(item.vin, detail)
  }
  // 获取上传配置
  getUploadConfig({
    configCode: 'mcs_serviceproxy'
  }).then((res) => {
    if (res.code === 200) {
      uploadConfig.value = res.data
    }
  })

  // 注册原生图片选择回调
  window.getScanResult = async(url) => {
    console.log('原生返回图片地址:', url, Array.isArray(url))
    let urlList = []
    if (typeof url === 'string') {
      if (url.startsWith('[')) {
        // JSON 数组字符串，需要解析
        try {
          urlList = JSON.parse(url)
        } catch {
          // 解析失败，当作单个 URL 处理
          urlList = [url]
        }
      } else {
        // 单个 URL 字符串
        urlList = [url]
      }
    } else if (Array.isArray(url)) {
      urlList = url
    } else {
      return
    }

    // 遍历每个 URL 进行上传处理
    // 本批次是否需要刷新：仅当至少有一张图真正上传成功 + serviceProxyId 有值时 refresh
    let needRefresh = false
    // 记录本批次真正上传成功的类型快照。
    // 注意：不能用循环外的 currentUploadType.value——循环中存在 await，
    // 用户可能在等待期间切换上传类型，若读 .value 会 refresh 到错误的列表。
    let lastUploadedType = null

    for (const singleUrl of urlList) {
      // 保存当前上传类型，避免异步上传完成时类型已改变
      const uploadType = currentUploadType.value

      // attachType 映射
      const attachTypeMap = {
        interior: '车内照片',
        exterior: '车外照片',
        attachment: '附件资料'
      }
      const attachType = attachTypeMap[uploadType]

      // 格式校验（白名单）：native 返回 url 后、调上传接口之前拦截
      // 未配置 acceptSuffix 时 parseAcceptSuffix 返回 null → validateFileExtension 直接放行
      const formatCheck = validateFileExtension(singleUrl, getAttachConfig(attachType))
      if (!formatCheck.ok) {
        showToast(`不支持的图片格式：${formatCheck.ext || '未知后缀'}，仅允许 ${formatCheck.allowed || '未配置'}`)
        continue
      }

      // 先添加临时预览（乐观 UI：让用户立刻看到上传中状态）
      const fileObj = {
        url: singleUrl,
        fileUrl: singleUrl,
        authFileUrl: singleUrl,
        fileType: getFileType({ url: singleUrl }, 'image/jpeg'),
        status: 'uploading',
        message: '上传中...',
        id: null
      }

      // 根据当前上传类型添加到对应的文件列表
      switch (uploadType) {
        case 'interior':
          detail.interiorImages.push(fileObj)
          break
        case 'exterior':
          detail.exteriorImages.push(fileObj)
          break
        case 'attachment':
          attachmentsList.value.push(fileObj)
          break
      }

      // 调用上传接口
      try {
        const params = {
          fileUrl: singleUrl,
          businessId: serviceProxyId.value || null,
          configCode: 'mcs_serviceproxy',
          attachType
        }

        const res = await uploadFileByUrl([params])

        if (res.code === 200) {
          // 兜底：HEIC 等不被支持格式 → res.code=200 但 data 字段全 null
          if (isUploadSilentFailure(res)) {
            const targetList = getTargetFileList(uploadType)
            if (targetList.length > 0) targetList.pop()
            showToast('上传失败：文件格式不被支持')
            continue
          }

          // 注意：uploadFileByUrl 返回的 id 是"前端占位用"的假 id，
          // 不能直接用于 deleteAttachmentConfig（删除会失败）。
          // 真实 id 必须等循环结束后统一 refreshAttachmentList 拿。
          // 这里只更新"乐观"状态，让 UI 看到上传完成（真实数据会被 refresh 覆盖）
          const targetList = getTargetFileList(uploadType)
          if (targetList.length > 0) {
            const lastIndex = targetList.length - 1
            const uploadData = Array.isArray(res.data) ? res.data[0] || {} : res.data || {}
            targetList[lastIndex] = {
              ...targetList[lastIndex],
              status: 'done',
              message: '',
              url: uploadData.fileUrl || uploadData.url || singleUrl,
              fileUrl: uploadData.fileUrl || uploadData.url || singleUrl,
              authFileUrl: uploadData.authFileUrl || uploadData.fileUrl || uploadData.url || singleUrl,
              fileType: uploadData.fileType || uploadData.ext || getFileType({ url: singleUrl }, 'image/jpeg')
            }
          }

          // 本张上传成功 → 标记循环结束后需要 refresh
          needRefresh = true
          // 用循环内快照 uploadType（而非 currentUploadType.value），
          // 避免用户在 await 期间切换类型导致 refresh 到错误列表
          lastUploadedType = uploadType
          showToast('上传成功')
        } else {
          // 上传失败，移除临时文件 - 使用保存的 uploadType
          const targetList = getTargetFileList(uploadType)
          if (targetList.length > 0) {
            targetList.pop()
          }
          showToast(res.msg || '上传失败')
        }
      } catch (e) {
        console.error('上传出错:', e)
        // 出错时移除临时文件 - 使用保存的 uploadType
        const targetList = getTargetFileList(uploadType)
        if (targetList.length > 0) {
          targetList.pop()
        }
        showToast('上传出错')
      }
    }

    // 所有 url 处理完后，按 attachType 拉服务端真实数据覆盖当前列表：
    // 1) uploadFileByUrl 返回的 id 是假的，必须靠 getFileList 拿真实 id 才能删除/保存
    // 2) serviceProxyId 必须有值（保存前为 null 时跳过，保留前端拼装对象）
    // 3) 仅当至少一张图真正上传成功时才 refresh
    // 4) 用循环内记录的类型快照 lastUploadedType，不用 currentUploadType.value
    if (needRefresh && serviceProxyId.value && lastUploadedType) {
      const lastAttachTypeMap = {
        interior: '车内照片',
        exterior: '车外照片',
        attachment: '附件资料'
      }
      const lastAttachType = lastAttachTypeMap[lastUploadedType]
      const lastTargetList = getTargetFileList(lastUploadedType)
      await refreshAttachmentList({
        businessId: serviceProxyId.value,
        attachType: lastAttachType,
        targetList: lastTargetList,
        getFileListApi: getFileList
      })
    }
  }
})

// 返回按钮拦截
const onBeforeBack = () => {
  if (!hasInspectionDataChanged()) return true
  showConfirmDialog({
    title: '提示',
    message: '本次操作未保存，是否退出？',
    confirmButtonText: '否',
    cancelButtonText: '是'
  }).catch(() => {
    router.go(-1)
  })
  return false
}

defineExpose({ onBeforeBack })
</script>
