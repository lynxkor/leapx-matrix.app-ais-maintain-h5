<template>
  <div class="create-pre-auth">
    <!-- 固定顶部导航 -->
    <div class="nav-header">
      <van-icon name="arrow-left" size="22" color="#333333" @click="goBack" />
      <span class="nav-title">预授权申请</span>
      <van-icon name="ellipsis" size="24" color="#333333" @click="showMore" />
    </div>

    <!-- 标签页 -->
    <div class="tabs-container">
      <div
        v-for="tab in tabs"
        :key="tab.name"
        class="tab-item"
        :class="{ 'tab-active': activeTab === tab.name }"
        @click="onTabChange(tab.name)"
      >
        <span class="tab-text">{{ tab.title }}</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 基础信息 -->
      <div v-show="activeTab === 'basic'" class="tab-content">
        <!-- 接车施工单卡片 -->
        <div class="main-card">
          <div class="section-title">接车施工单</div>

          <!-- 施工单 -->
          <div class="card-row" @click="showConstructionPicker = true">
            <span class="row-label">施工单</span>
            <span class="row-value">
              {{ constructionNo || '请选择' }}
              <van-icon name="arrow" size="14" color="#888888" />
            </span>
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
          <div class="vehicle-info-item" @click="showWarningInfo">
            <span class="info-label">预警信息</span>
            <span class="info-value warning-value">{{ vehicleInfo.warningInfo }}</span>
            <van-icon name="arrow" size="14" color="#888888" />
          </div>
        </div>

        <!-- 质量反馈报告卡片 -->
        <div class="feedback-card">
          <div class="section-title">质量反馈报告</div>
          <div class="card-row" @click="showFeedbackPicker = true">
            <span class="row-label">质量反馈单号</span>
            <span class="row-value">
              {{ feedbackNo || '请选择' }}
              <van-icon name="arrow" size="14" color="#888888" />
            </span>
          </div>
          <div v-if="qualityFeedback.title" class="feedback-content">
            <div class="feedback-label">报告类型</div>
            <div class="feedback-text">{{ qualityFeedback.title }}</div>
          </div>
          <div v-if="qualityFeedback.description" class="feedback-content">
            <div class="feedback-label">故障描述</div>
            <div
              class="feedback-text"
              :class="{ 'text-collapsed': !faultDescExpanded }"
              @click="faultDescExpanded = !faultDescExpanded"
            >
              {{ qualityFeedback.description }}
              <van-icon
                v-if="qualityFeedback.description && qualityFeedback.description.length > 30"
                :name="faultDescExpanded ? 'arrow-up' : 'arrow-down'"
                size="14"
                color="#888888"
              />
            </div>
          </div>
          <div v-if="qualityFeedback.faultProcess" class="feedback-content no-border">
            <div class="feedback-label">故障排查流程</div>
            <div
              class="feedback-text"
              :class="{ 'text-collapsed': !faultProcessExpanded }"
              @click="faultProcessExpanded = !faultProcessExpanded"
            >
              {{ qualityFeedback.faultProcess }}
              <van-icon
                v-if="qualityFeedback.faultProcess && qualityFeedback.faultProcess.length > 30"
                :name="faultProcessExpanded ? 'arrow-up' : 'arrow-down'"
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

        <!-- 维修项目卡片 -->
        <div class="repair-card">
          <div class="repair-card-header">维修项目</div>
          <div
            v-for="(item, index) in repairItems"
            :key="index"
            class="repair-item"
          >
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
          <div
            class="parts-content"
            :class="{ 'parts-content-collapsed': !partsExpanded }"
            @click="partsExpanded = !partsExpanded"
          >
            <div class="parts-text">
              <span
                v-for="(item, index) in partsList"
                :key="index"
                class="parts-item-inline"
              >
                <span class="parts-name">{{ item.name }}</span>
                <span class="parts-separator" v-if="index < partsList.length - 1">、</span>
              </span>
            </div>
            <van-icon
              :name="partsExpanded ? 'arrow-up' : 'arrow-down'"
              size="14"
              color="#888888"
            />
          </div>
          <div v-if="partsExpanded" class="parts-detail">
            <div
              v-for="(item, index) in partsList"
              :key="index"
              class="parts-item"
            >
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
      </div>

      <!-- 项目零件 -->
      <div v-show="activeTab === 'parts'" class="tab-content">
        <div class="repair-card">
          <div class="repair-card-header">维修项目</div>
          <div
            v-for="(item, index) in repairItems"
            :key="index"
            class="repair-item"
          >
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
      </div>

      <!-- 附件信息 -->
      <div v-show="activeTab === 'attachments'" class="tab-content">
        <div class="empty-attachments">
          <van-icon name="photo-o" size="48" color="#cccccc" />
          <span>暂无附件信息</span>
        </div>
      </div>
    </div>

    <!-- 底部提交按钮 -->
    <div class="bottom-action">
      <div class="submit-btn" :class="{ 'submit-btn-disabled': !canSubmit }">
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
                placeholder="搜索"
              />
              <div class="search-btn">搜索</div>
            </div>
          </div>
          <div class="popup-content-list">
            <template v-if="filteredConstructionList.length > 0">
              <div
                v-for="item in filteredConstructionList"
                :key="item.value"
                class="construction-item"
                @click="onConstructionSelect(item)"
              >
                <div class="construction-header">
                  <span class="construction-no">{{ item.constructionNo }}</span>
                  <span class="construction-status" :class="'status-' + item.status">{{ item.statusText }}</span>
                </div>
                <div class="construction-vehicle">
                  <span class="vehicle-plate">{{ item.plate }}</span>
                  <div class="vehicle-icons">
                    <svg class="icon" viewBox="0 0 16 16">
                      <path fill="#C8A12B" stroke="#C8A12B" stroke-width="4" stroke-linejoin="round" d="M8 2L14 13H2Z"/>
                      <text x="8" y="12" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">!</text>
                    </svg>
                    <svg class="icon" viewBox="0 0 16 16">
                      <path fill="#009100" stroke="#009100" stroke-width="4" stroke-linejoin="round" d="M8 2L14 13H2Z"/>
                      <text x="8" y="12" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">!</text>
                    </svg>
                    <svg class="icon" viewBox="0 0 16 16">
                      <path fill="#B91919" stroke="#B91919" stroke-width="4" stroke-linejoin="round" d="M8 2L14 13H2Z"/>
                      <text x="8" y="12" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">!</text>
                    </svg>
                  </div>
                  <div class="vehicle-tags">
                    <span v-for="tag in item.tags" :key="tag" class="vehicle-tag">{{ tag }}</span>
                  </div>
                </div>
                <div class="construction-vehicle-info">{{ item.vehicleModel }} · {{ item.vin }}</div>
                <div class="construction-detail">
                  <div class="detail-row">
                    <span class="detail-label">送修人</span>
                    <span class="detail-value">{{ item.customerName }}</span>
                    <span v-if="item.customerType" class="customer-tag">{{ item.customerType }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">客户经理</span>
                    <span class="detail-value">{{ item.manager }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">预计交车</span>
                    <span class="detail-value">{{ item.deliveryDate }}</span>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-state">
              <van-icon name="search" size="48" color="#cccccc" />
              <span>暂无搜索结果</span>
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
                placeholder="搜索"
              />
              <div class="search-btn">搜索</div>
            </div>
          </div>
          <div class="popup-content-list">
            <template v-if="filteredFeedbackList.length > 0">
              <div
                v-for="item in filteredFeedbackList"
                :key="item.value"
                class="feedback-item"
                @click="onFeedbackSelect(item)"
              >
                <div class="feedback-item-serial">
                  <span class="serial-text">
                    {{ getSerialPrefix(item.serialNumber) }}<span class="date-part">{{ getSerialDate(item.serialNumber) }}</span>{{ getSerialRest(item.serialNumber) }}
                  </span>
                </div>
                <div class="feedback-item-info">
                  <div class="info-title">{{ item.title }}</div>
                  <div class="info-desc">{{ item.description }}</div>
                </div>
              </div>
            </template>
            <div v-else class="empty-state">
              <van-icon name="search" size="48" color="#cccccc" />
              <span>暂无搜索结果</span>
            </div>
          </div>
        </div>
      </template>
    </AisPopup>

    <!-- 更多操作弹窗 -->
    <AisPopup
      v-model:show="showMorePopup"
      title="更多操作"
      :closeable="true"
      position="top"
      :round="false"
    >
      <template #content>
        <div class="more-popup-content">
          <div class="more-item" @click="handleSaveDraft">保存草稿</div>
          <div class="more-item" @click="handleCancel">取消申请</div>
        </div>
      </template>
    </AisPopup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import AisPopup from '@/components/AisPopup.vue'

const router = useRouter()

// 标签页配置
const tabs = [
  { name: 'basic', title: '基础信息' },
  { name: 'parts', title: '项目零件' },
  { name: 'attachments', title: '附件信息' }
]

const activeTab = ref('basic')

// 表单数据
const constructionNo = ref('')
const authType = ref('')
const feedbackNo = ref('')
const applyReason = ref('')

// 是否显示车辆信息
const showVehicleInfo = ref(false)

// 折叠状态
const faultDescExpanded = ref(false)
const faultProcessExpanded = ref(false)
const partsExpanded = ref(false)

// 车辆信息数据
const vehicleInfo = ref({
  vin: '2358446753543340032',
  warrantyTime: '2026-01-01 至 2029-12-31',
  mileage: '47007km',
  vehicleUse: '非营运',
  lifetimeWarranty: '这是一段文案',
  serviceStore: '杭州零跑中心建设四路店',
  storeArea: '浙江杭州',
  warningInfo: '这是一条预警描述内容这是一…'
})

// 质量反馈数据
const qualityFeedback = ref({
  title: '',
  description: '',
  faultDescription: '',
  faultProcess: ''
})

// 维修项目数据
const repairItems = ref([
  {
    name: '前保险杠补漆',
    partNo: 'C1031000035',
    type: '一般维修-保险-无',
    price: '621.50',
    discount: '0.00',
    subtotal: '700.00',
    quantity: '1.00',
    actualQuantity: '1',
    returnQuantity: '0',
    tag: ''
  }
])

// 维修配件数据
const partsList = ref([
  {
    name: '前保险杠漆面',
    partNo: 'P1031000035',
    type: '一般维修-配件-无',
    price: '320.00',
    discount: '0.00',
    subtotal: '320.00',
    quantity: '1.00',
    actualQuantity: '1',
    returnQuantity: '0',
    tag: ''
  },
  {
    name: '左前大灯总成',
    partNo: 'P1031000036',
    type: '一般维修-配件-无',
    price: '4200.00',
    discount: '200.00',
    subtotal: '4000.00',
    quantity: '1.00',
    actualQuantity: '1',
    returnQuantity: '0',
    tag: '原厂件'
  },
  {
    name: 'ABS传感器',
    partNo: 'P1031000037',
    type: '一般维修-配件-无',
    price: '580.00',
    discount: '0.00',
    subtotal: '580.00',
    quantity: '2.00',
    actualQuantity: '2',
    returnQuantity: '0',
    tag: '原厂件'
  }
])

// 选择器配置
const showConstructionPicker = ref(false)
const showFeedbackPicker = ref(false)
const showMorePopup = ref(false)

// 施工单搜索
const constructionSearchText = ref('')
const constructionList = ref([
  {
    constructionNo: '3318938923892839283',
    status: 'pending',
    statusText: '待派工',
    plate: '浙AA12345',
    tags: ['一般维修', '钣金', '喷漆'],
    vehicleModel: 'B10-510激光雷达版',
    vin: 'LFV3H6686RKYM3393',
    customerName: '王小虎',
    customerType: '预约客户',
    manager: '王小丫',
    deliveryDate: '2026-03-20 17:30',
    value: '001'
  },
  {
    constructionNo: '3318938923892839284',
    status: 'pending',
    statusText: '待派工',
    plate: '浙BB12345',
    tags: ['一般维修'],
    vehicleModel: 'C11增程版',
    vin: 'LFV3H6686RKYM3400',
    customerName: '李大明',
    customerType: '到店客户',
    manager: '张小丫',
    deliveryDate: '2026-03-21 10:00',
    value: '002'
  },
  {
    constructionNo: '3318938923892839285',
    status: 'processing',
    statusText: '施工中',
    plate: '浙CC12345',
    tags: ['一般维修', '保养'],
    vehicleModel: 'C10舒享版',
    vin: 'LFV3H6686RKYM3411',
    customerName: '赵小明',
    customerType: '',
    manager: '王小丫',
    deliveryDate: '2026-03-22 15:00',
    value: '003'
  }
])

// 过滤后的施工单列表
const filteredConstructionList = computed(() => {
  if (!constructionSearchText.value) return constructionList.value
  const search = constructionSearchText.value.toLowerCase()
  return constructionList.value.filter(item =>
    item.constructionNo.toLowerCase().includes(search) ||
    item.constructionName.toLowerCase().includes(search)
  )
})

// 质量反馈列表数据
const feedbackSearchText = ref('')
const feedbackList = [
  {
    serialNumber: 'ZLR-260115092347261804',
    title: '技术支持申请报告',
    description: '仪表提示ABS灯常亮',
    faultDescription: '仪表提示ABS灯常亮,左后轮速传感器信号丢失',
    faultProcess: '传感器检测 → 线路排查 → 更换传感器 → 系统复位 → 故障码清除',
    hasError: false
  },
  {
    serialNumber: 'ZLR-251219132442675085',
    title: '技术支持申请报告',
    description: '电池包高温告警',
    faultDescription: '电池包高温告警,温度传感器信号异常',
    faultProcess: '温度检测 → 传感器校准 → 冷却系统检查 → 更换传感器 → 性能验证',
    hasError: true,
    customerName: '王小虎'
  },
  {
    serialNumber: 'ZLR-251218084512390471',
    title: '技术支持申请报告',
    description: '车辆前保险杠右侧有明显划痕',
    faultDescription: '车辆前保险杠右侧有明显划痕,长度约5cm,深度未伤及底漆',
    faultProcess: '外观检查 → 划痕测量 → 腻子填补 → 打磨平整 → 底漆喷涂 → 面漆喷涂 → 抛光处理',
    hasError: false
  },
  {
    serialNumber: 'ZLR-251217145623789023',
    title: '技术支持申请报告',
    description: '左前大灯无法点亮',
    faultDescription: '左前大灯无法点亮,夜间行车存在安全隐患',
    faultProcess: '电路检测 → 灯泡检查 → 保险丝排查 → 线路诊断 → 更换灯泡或线束',
    hasError: true,
    customerName: '李明'
  }
]

// 过滤后的质量反馈列表
const filteredFeedbackList = computed(() => {
  if (!feedbackSearchText.value) return feedbackList
  const search = feedbackSearchText.value.toLowerCase()
  return feedbackList.filter(item =>
    item.serialNumber.toLowerCase().includes(search) ||
    item.title.toLowerCase().includes(search) ||
    item.description.toLowerCase().includes(search)
  )
})

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

// 计算是否可以提交
const canSubmit = computed(() => {
  return constructionNo.value && applyReason.value.length > 0
})

// 方法
const goBack = () => {
  router.back()
}

const onTabChange = (tabName) => {
  activeTab.value = tabName
}

const onAuthTypeChange = (type) => {
  authType.value = type
  showVehicleInfo.value = true
}

const showWarningInfo = () => {
  showToast('查看预警信息')
}

const showMore = () => {
  showMorePopup.value = true
}

const onConstructionConfirm = ({ selectedOptions }) => {
  constructionNo.value = selectedOptions[0].text
  showConstructionPicker.value = false
  showVehicleInfo.value = true
}

const onConstructionSelect = (item) => {
  constructionNo.value = item.constructionNo
  showConstructionPicker.value = false
  showVehicleInfo.value = true
}

const onFeedbackConfirm = ({ selectedOptions }) => {
  feedbackNo.value = selectedOptions[0].text
  qualityFeedback.value.faultDescription = selectedOptions[0].faultDescription || ''
  qualityFeedback.value.faultProcess = selectedOptions[0].faultProcess || ''
  showFeedbackPicker.value = false
}

const onFeedbackSelect = (item) => {
  feedbackNo.value = item.serialNumber
  qualityFeedback.value.title = item.title || ''
  qualityFeedback.value.description = item.description || ''
  qualityFeedback.value.faultDescription = item.faultDescription || ''
  qualityFeedback.value.faultProcess = item.faultProcess || ''
  showFeedbackPicker.value = false
}

const handleSaveDraft = () => {
  showMorePopup.value = false
  showToast('已保存草稿')
}

const handleCancel = () => {
  showMorePopup.value = false
  router.back()
}
</script>

<style lang="scss" scoped>
.create-pre-auth {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 89px;

  // 导航头部
  .nav-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 44px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    z-index: 100;
    box-sizing: border-box;

    .nav-title {
      font-family: 'PingFang SC';
      font-size: 17px;
      font-weight: 500;
      color: #333333;
    }
  }

  // 标签页容器
  .tabs-container {
    position: fixed;
    top: 44px;
    left: 0;
    right: 0;
    height: 42px;
    background: #ffffff;
    display: flex;
    align-items: center;
    border-bottom: 0.5px solid #e6e6e5;
    z-index: 99;

    .tab-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      position: relative;

      .tab-text {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #545454;
      }

      &.tab-active {
        .tab-text {
          color: #009100;
          font-weight: 500;
        }

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 56px;
          height: 2px;
          background: #009100;
        }
      }
    }
  }

  // 内容区域
  .content-area {
    padding-top: 42px;
    padding-bottom: 66px;
    min-height: calc(100vh - 86px - 89px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  // 标签内容
  .tab-content {
    padding: 12px;
  }

  // 卡片区块
  .card-section {
    background: #ffffff;
    border-radius: 6px;
    margin-bottom: 12px;
    overflow: hidden;
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

      &.textarea-row {
        align-items: flex-start;
        padding: 12px 0;
        flex-direction: column;

        .row-label {
          margin-bottom: 8px;
        }

        .reason-textarea {
          width: 100%;
          padding: 0;
          background: transparent;

          :deep(.van-field__control) {
            font-family: 'PingFang SC';
            font-size: 14px;
            color: #191a1b;
            text-align: left;
          }

          :deep(.van-field__word-limit) {
            display: none;
          }
        }
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
    margin-bottom: 12px;
    overflow: hidden;

    .reason-header {
      padding: 12px;
      border-bottom: 0.5px solid #e6e6e5;
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
    margin-bottom: 12px;
    overflow: hidden;

    .repair-card-header {
      padding: 12px;
      border-bottom: 0.5px solid #e6e6e5;
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
    margin-bottom: 12px;
    overflow: hidden;

    .parts-card-header {
      padding: 12px;
      border-bottom: 0.5px solid #e6e6e5;
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
    }

    .parts-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      cursor: pointer;

      &.parts-content-collapsed {
        .parts-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .parts-text {
        flex: 1;
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
        line-height: 1.5;
        padding-right: 8px;

        .parts-item-inline {
          .parts-name {
            color: #191a1b;
          }

          .parts-separator {
            color: #888888;
          }
        }
      }
    }

    .parts-detail {
      .parts-item {
        padding: 12px;
        border-top: 0.5px solid #e6e6e5;

        &:last-child {
          border-bottom: none;
        }

        .parts-item-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;

          .parts-item-left {
            .parts-item-top {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 4px;

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
          gap: 12px;
          padding-top: 8px;
          border-top: 0.5px dashed #e6e6e5;

          .parts-subtotal {
            font-family: 'PingFang SC';
            font-size: 14px;
            font-weight: 500;
            color: #191a1b;
          }

          .parts-actual,
          .parts-return {
            font-family: 'PingFang SC';
            font-size: 12px;
            color: #888888;
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
  }

  // 质量反馈报告卡片
  .feedback-card {
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

    .card-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 0;
      border-bottom: 0.5px solid #e6e6e5;

      &:last-child {
        border-bottom: none;
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

        &.warning-value {
          color: #ee0a24;
        }
      }
    }

    .feedback-content {
      padding: 12px 0;

      &.no-border {
        padding-top: 0;
      }

      .feedback-label {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #545454;
        margin-bottom: 8px;
      }

      .feedback-text {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
        line-height: 1.5;
        display: flex;
        align-items: center;
        gap: 4px;

        &.text-collapsed {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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

  // 附件信息空状态
  .empty-attachments {
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

  // 搜索无结果空状态
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

  // 更多操作弹窗
  .more-popup-content {
    padding: 20px 0;

    .more-item {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'PingFang SC';
      font-size: 16px;
      color: #333333;
      background: #ffffff;
      border-bottom: 0.5px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
        color: #ee0a24;
      }
    }
  }

  // 施工单弹窗
  .construction-popup {
    height: 727px;
    background: #F4F4F4;
    border-radius: 16px 16px 0 0;
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

      .search-icon {
        width: 20px;
        height: 20px;
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
        color: #191A1B;

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
          border-bottom: 0.5px solid #E6E6E5;
          padding-bottom: 12px;
          margin-bottom: 8px;

          .construction-no {
            font-family: 'PingFang SC';
            font-size: 14px;
            color: #191A1B;
          }

          .construction-status {
            font-family: 'PingFang SC';
            font-size: 12px;
            font-weight: 500;

            &.status-pending {
              color: #C8A12B;
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
            color: #191A1B;
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
            margin-left: auto;

            .vehicle-tag {
              font-family: 'PingFang SC';
              font-size: 12px;
              color: #191A1B;
              border: 0.5px solid #191A1B;
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
              color: #191A1B;
            }

            .customer-tag {
              font-family: 'PingFang SC';
              font-size: 12px;
              color: #191A1B;
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

  // 质量反馈弹窗
  .feedback-popup {
    height: 727px;
    background: #F4F4F4;
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

      .search-icon {
        width: 20px;
        height: 20px;
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
        color: #191A1B;

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

    .popup-content-list {
      flex: 1;
      overflow-y: auto;

      .feedback-item {
        border: 0.5px solid #E6E6E5;
        background-color: #fff;
        border-radius: 4px;
        margin-bottom: 8px;
        overflow: hidden;

        &:last-child {
          margin-bottom: 0;
        }

        .feedback-item-serial {
          padding: 12px 0;
          border-bottom: 0.5px solid #E6E6E5;
          border-radius: 6px 6px 0 0;

          .serial-text {
            display: block;
            font-family: 'PingFang SC';
            font-size: 14px;
            color: #191A1B;
            padding: 0 8px;

            .date-part {
              color: #009100;
            }
          }
        }

        .feedback-item-info {
          padding: 12px 0;

          .info-title {
            font-family: 'PingFang SC';
            font-size: 14px;
            font-weight: 500;
            color: #191A1B;
            margin-bottom: 8px;
            padding: 0 8px;
          }

          .info-desc {
            font-family: 'PingFang SC';
            font-size: 14px;
            color: #191A1B;
            padding: 0 8px;
          }
        }
      }
    }
  }
}
</style>
