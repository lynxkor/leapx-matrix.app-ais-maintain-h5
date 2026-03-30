<template>
  <div class="work-order-detail">
    <!-- 车辆信息卡片 -->
    <div class="vehicle-card">
      <div class="plate-row">
        <span class="plate-no">{{ detail.plateNo }}</span>
        <span v-if="detail.isAppointment" class="appointment-tag">预约客户</span>
      </div>
      <div class="vehicle-model">{{ detail.vehicleModel }} · {{ detail.vin }}</div>
      <div class="info-row">
        <span class="label">保修日期：</span>
        <span class="value">{{ detail.warrantyDate }}</span>
      </div>
      <div class="info-row">
        <span class="label">车主：</span>
        <span class="value">{{ detail.owner }} {{ detail.ownerPhone }}</span>
      </div>
      <div class="info-row">
        <span class="label">绑车人：</span>
        <span class="value">{{ detail.binder }} {{ detail.binderPhone }}</span>
      </div>

      <div class="divider"></div>

      <div class="select-row">
        <span class="label">送修人</span>
        <div class="value-wrapper">
          <span class="tag">[{{ detail.repairPersonTag }}]</span>
          <span class="value">{{ detail.repairPerson }} {{ detail.repairPersonPhone }}</span>
        </div>
      </div>

      <div class="select-row">
        <span class="label">业务类型</span>
        <div class="value-wrapper">
          <span class="value">{{ detail.businessType }}</span>
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
              <div class="sub-info">车联网里程数(总)：{{ detail.networkMileageTotal }}km</div>
              <div class="sub-info">车联网里程数(增)：{{ detail.networkMileageAdd }}km</div>
            </div>

            <!-- 进店电量 -->
            <div class="section-card borderB">
              <div class="section-title">
                <div>进店电量</div>
                <div>
                  <span class="number">{{ detail.battery }}</span>
                  <span class="unit">%</span>
                </div>
              </div>
              <div class="sub-info">车联网电量: {{ detail.networkBattery }}%</div>
            </div>

            <!-- 车内检查 -->
            <div class="section-card borderB">
              <div class="section-title">车内检查</div>
              <div class="image-grid readonly">
                <div
                  v-for="(img, index) in detail.interiorImages"
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
                  v-for="(img, index) in detail.exteriorImages"
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
                {{ detail.abnormalDesc || '无' }}
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
                <van-icon
                  name="checked"
                  size="20px"
                  :color="detail.hasFault === '1' ? '#009100' : '#888888'"
                />
                <span class="toggle-text">{{ detail.hasFault === '1' ? '是' : '否' }}</span>
              </div>
            </div>

            <!-- 故障模块列表 -->
            <div class="fault-modules" v-if="detail.hasFault === '1'">
              <div class="modules-list">
                <div
                  v-for="(module, index) in detail.faultModules"
                  :key="index"
                  class="fault-module-item"
                >
                  <span class="module-name">{{ module }}</span>
                </div>
              </div>
            </div>

            <!-- 客户故障描述 -->
            <div class="section-card" v-if="detail.hasFault === '1'">
              <div class="section-title">客户故障描述</div>
              <div class="expandable-text" :class="{ expanded: customerFaultDescExpanded }">
                {{ detail.customerFaultDesc || '无' }}
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
                <span class="amount">¥{{ partsData.repairAmount }}</span>
              </div>
              <span class="operator">+</span>
              <div class="summary-row">
                <span class="label">维修配件</span>
                <span class="amount">¥{{ partsData.partsAmount }}</span>
              </div>
              <span class="operator">=</span>
              <div class="summary-row total">
                <span class="label">费用合计</span>
                <span class="amount">¥{{ partsData.totalAmount }}</span>
              </div>
            </div>
          </div>

          <!-- 套餐列表 -->
          <div style="padding: 12px">
            <div
              v-for="(packageItem, pIndex) in partsData.packages"
              :key="'package-' + pIndex"
              class="package-card"
            >
              <div class="package-header">
                <span class="package-name">{{ packageItem.name }}</span>
              </div>
              <!-- 项目列表 -->
              <div
                v-for="itemData in packageItem.items"
                :key="itemData.code"
                class="parts-item-card"
              >
                <div class="item-main">
                  <div class="item-left">
                    <div class="item-name">{{ itemData.name }}</div>
                    <div class="item-code">{{ itemData.code }}</div>
                    <div class="item-category">{{ itemData.category }}</div>
                  </div>
                  <div class="item-right">
                    <div class="item-price">¥{{ itemData.price }}</div>
                    <div class="item-discount">优惠 ¥{{ itemData.discount }}</div>
                  </div>
                </div>
                <div class="item-footer">
                  <span class="item-subtotal">¥{{ itemData.subtotal }}</span>
                  <span class="item-quantity">x{{ itemData.quantity.toFixed(2) }}</span>
                </div>
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
              <span class="value">¥{{ signatureData.totalAmount }}</span>
            </div>
            <div class="signature-row">
              <span class="label">维修类型</span>
              <span class="value">{{ signatureData.repairTypes }}</span>
            </div>
            <div class="signature-row">
              <span class="label">预计交车时间</span>
              <span class="value">{{ signatureData.deliveryTime || '-' }}</span>
            </div>
            <div class="signature-row">
              <span class="label">开启维修直播</span>
              <van-switch
                v-model="signatureData.liveEnabled"
                size="20"
                active-color="#009100"
                disabled
              />
            </div>
            <div class="signature-row">
              <span class="label">签字渠道</span>
              <span class="value">{{ signatureData.signatureChannel || '-' }}</span>
            </div>
          </div>

          <!-- 附件信息 -->
          <div class="attachment-section" v-if="signatureData.attachments.length > 0">
            <div class="section-title">附件信息</div>
            <div class="image-grid readonly">
              <div
                v-for="(img, index) in signatureData.attachments"
                :key="'attachment-' + index"
                class="image-item"
              >
                <van-image :src="img" fit="cover" />
              </div>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <span class="more-btn" @click="onMore">更多</span>
      <span class="save-btn" @click="onSave">保存</span>
      <span class="complete-btn" @click="onComplete">预检完成</span>
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
      </template>
      <template #footer>
        <div class="confirm-btn" @click="onConfirmCancel">确定</div>
      </template>
    </ais-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useGlobalStore } from '@/stores/global'
import AisPopup from '@/libs/components/AisPopup.vue'
import './detail.scss'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
const changeCarDialog = ref(false)

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
      // query: {
      //   id: route.query.id,
      // },
    })
  }
  if (action.name === '权益查询') {
    router.push({
      path: '/reception/rights-query',
      // query: {
      //   id: route.query.id,
      // },
    })
  }
}
// 确认作废
const onConfirmCancel = () => {
  if (!cancelReason.value.trim()) {
    showToast('请输入作废原因')
    return
  }
  console.log('作废原因:', cancelReason.value)
  showToast('作废成功')
  showCancelReason.value = false
  cancelReason.value = ''
}

const onTabScroll = (e) => {
  if (e.isFixed) {
    // 触发吸顶时设置标题
    globalStore.setTitle(detail.plateNo)
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
const showRepairPersonPicker = ref(false)
const showBusinessTypePicker = ref(false)
const showMoreActions = ref(false)

// 详情数据
const detail = reactive({
  plateNo: '浙AA12345',
  isAppointment: true,
  vehicleModel: 'B10-510激光雷达版',
  vin: 'LFV3H6686RKYM3393',
  warrantyDate: '2026-01-01 至 2029-12-31',
  owner: '王小虎',
  ownerPhone: '13012345678',
  binder: '张小龙',
  binderPhone: '13012341234',
  repairPerson: '王小虎',
  repairPersonPhone: '13012345678',
  repairPersonTag: '车主',
  businessType: '预约到店',
  mileage: '47004',
  networkMileageTotal: '47003.00',
  networkMileageAdd: '1002.00',
  battery: '74',
  networkBattery: '74',
  interiorImages: [
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  ],
  exteriorImages: [
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  ],
  abnormalDesc:
    '这是一条异常描述内容，这是一条异常描述内容，这是一条异常描述内容这是一条异常描述内容，这是一条异常描述内容异常描述内容',
  hasFault: '1',
  faultModules: [
    'F02-电子电器 V21-热管理系统零跑机电',
    'F03-底盘系统 V22-悬挂系统',
    'F0333-底盘系统 V22-悬挂系统',
    'F0111-底盘系统 V22-悬挂系统',
  ],
  customerFaultDesc: '客户说主驾空调不出暖风',
})

// 项目零件数据
const partsData = reactive({
  repairAmount: '17,676.00',
  partsAmount: '20,525.56',
  totalAmount: '38,201.56',
  packages: [
    {
      name: '省心保养套餐-9AB102382372389238',
      items: [
        {
          name: '前保险杠补漆',
          code: 'C1031000035',
          category: '一般维修-保险-无',
          price: '621.50',
          discount: '0.00',
          subtotal: '700.00',
          quantity: 1,
        },
        {
          name: '前保险杠补漆',
          code: 'C1031000035',
          category: '一般维修-保险-无',
          price: '621.50',
          discount: '0.00',
          subtotal: '700.00',
          quantity: 1,
        },
      ],
    },
    {
      name: '省心保养套餐-9AB102382372389238',
      items: [
        {
          name: '前保险杠补漆',
          code: 'C1031000035',
          category: '一般维修-保险-无',
          price: '621.50',
          discount: '0.00',
          subtotal: '700.00',
          quantity: 1,
        },
        {
          name: '前保险杠补漆',
          code: 'C1031000035',
          category: '一般维修-保险-无',
          price: '621.50',
          discount: '0.00',
          subtotal: '700.00',
          quantity: 1,
        },
      ],
    },
  ],
})

// 签字确认数据
const signatureData = reactive({
  totalAmount: '38,201.56',
  repairTypes: '一般维修、钣金、美容装潢、三电维修、精品附件',
  deliveryTime: '',
  liveEnabled: false,
  signatureChannel: '',
  attachments: [],
})

// 获取详情
const fetchDetail = async () => {
  const id = route.query.id
  if (!id) return
  // TODO: 调用接口获取详情
  console.log('获取详情:', id)
}

// 更多操作
const onMore = () => {
  showMoreActions.value = !showMoreActions.value
}

// 保存
const onSave = () => {
  showToast('保存成功')
}

// 预检完成
const onComplete = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定预检完成吗？',
  })
    .then(() => {
      showToast('预检完成')
      router.back()
    })
    .catch(() => {})
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
})
</script>
