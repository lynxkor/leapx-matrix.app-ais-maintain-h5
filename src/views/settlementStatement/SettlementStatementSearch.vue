<template>
  <div class="settlement-search">
    <!-- loading 遮罩层 -->
    <van-loading v-if="submitLoading" color="#00AA00" class="page-loading" />

    <!-- 自定义搜索头部 -->
    <div class="search-header">
      <!-- 返回箭头 -->
      <div class="back-btn" @click="handleGoBack">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15.5 19L8 12L15.5 5" stroke="#191A1B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- 搜索框 -->
      <div class="search-input-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="#999" stroke-width="1.3"/>
          <path d="M11 11L14 14" stroke="#999" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchValue"
          class="search-input"
          placeholder="请输入工单号/车牌号/VIN"
          @search="handleSearch"
          @keyup.enter="handleSearch"
        />
        <div class="search-btn" @click="handleSearch">搜索</div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="hasSearched" class="search-result">
      <van-loading v-if="searchLoading" color="#00AA00" class="search-loading" />
      <template v-else>
        <div v-if="resultList.length === 0" class="empty-state">
          <img class="empty-image" src="@/libs/assets/image/no-data.png" alt="没有数据" />
          <p class="empty-text">没有找到相关内容</p>
        </div>
        <van-list
          v-else
          v-model:loading="listLoading"
          :finished="listFinished"
          finished-text="没有更多了"
          @load="onListLoad"
          class="search-list"
        >
          <ListItem
            v-for="item in resultList"
            :key="item.id"
            @click="goToDetail(item)"
            class="result-item"
          >
            <template #header>
              <div class="item-header">
                <span class="order-no">{{ item.code }}</span>
                <span class="status-tag" :class="getStatusClass(item.orderStatus)">
                  {{ item.orderStatusLabel }}
                </span>
              </div>
            </template>

            <template #card-info>
              <div class="card-body">
                <!-- 车牌行 -->
                <div class="plate-row">
                  <span class="plate-number">{{ item.carPlate }}</span>
                  <!-- 预警图标 - 根据 alarmLevel 显示不同颜色: 10=绿色, 20=橙色, 30=红色 -->
                  <svg
                    v-if="item.alarmLevel"
                    class="vehicle-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 15.35 13.88"
                    fill="none"
                  >
                    <path :fill="getAlarmColor(item.alarmLevel)" d="M7.3351851 0C7.9718513 0 8.5651855 0.31133342 8.9285183 0.83133328L8.998518 0.93799996L14.407852 9.9700003C15.123848 11.210074 14.297827 12.772247 12.869853 12.878666L12.739853 12.883999L1.9231861 12.883999C0.49417353 12.867918 -0.42892668 11.36636 0.20185265 10.083999L0.26785263 9.9606657L5.6745195 0.93533206C6.0265875 0.35477138 6.6562138 0.00014813742 7.3351851 0ZM7.3418517 8.8866673L7.257185 8.8913336C6.9218178 8.9312248 6.6692615 9.2156019 6.6692615 9.5533333C6.6692615 9.8910656 6.9218178 10.175444 7.257185 10.215334L7.3351851 10.22L7.4198513 10.215334C7.7552185 10.175442 8.0077753 9.8910656 8.0077753 9.5533333C8.0077753 9.2156019 7.7552185 8.9312248 7.4198513 8.8913336L7.3418517 8.8866673ZM7.3351851 4.2200003C6.9972014 4.2200446 6.7127285 4.4730048 6.6731849 4.8086672L6.6685181 4.8866668L6.6685181 7.5533333L6.6731849 7.6313334C6.7130756 7.9667006 6.9974532 8.2192574 7.3351851 8.2192574C7.6729164 8.2192574 7.957294 7.9667006 7.9971848 7.6313334L8.001852 7.5533333L8.001852 4.8866668L7.9971848 4.8086672C7.9576411 4.4730048 7.6731682 4.2200446 7.3351851 4.2200003Z"/>
                  </svg>
                  <!-- 业务类型标签 -->
                  <span
                    v-for="(tag, tagIdx) in (item.repairItemTypeDetailCollect || '').split('&').filter(Boolean)"
                    :key="tagIdx"
                    class="svc-tag"
                  >{{ tag }}</span>
                </div>

                <!-- VIN -->
                <div class="vehicle-line">
                  {{ item.vehModelName }}
                  ·
                  {{ item.vehProfileVin }}
                  <img
                    v-if="item.vehProfileVin"
                    :src="copyIcon"
                    class="copy-icon"
                    @click.stop="handleCopyVin(item.vehProfileVin)"
                  />
                </div>

                <!-- 信息行 -->
                <div class="info-rows">
                  <div class="info-row">
                    <span class="info-label">车主</span>
                    <div class="info-value-wrap">
                      <span class="info-value">{{ item.customerName }}</span>
                      <span v-if="item.custType" class="cust-type-tag">{{ { '10': '预约客户', '20': '随到客户' }[item.custType] || item.custType }}</span>
                    </div>
                  </div>
                  <div class="info-row">
                    <span class="info-label">客户经理</span>
                    <span class="info-value">{{ item.creatorName }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">开单时间</span>
                    <span class="info-value">{{ item.createTime }}</span>
                  </div>
                </div>
              </div>
            </template>

            <template #btn-content>
              <div class="action-btns">
                <div
                  v-if="showCancelBtn(item)"
                  class="btn-pill btn-outline"
                  @click.stop="handleCancel(item)"
                >
                  作废
                </div>
                <div class="btn-pill btn-outline" @click.stop="handleContact(item)">联系车主</div>
                <div
                  v-if="currentTab === 'pending' && item.isCreateStatementInfo === 0"
                  class="btn-pill btn-primary"
                  @click.stop="handleSettle(item)"
                >
                  结算
                </div>
              </div>
            </template>
          </ListItem>
        </van-list>
      </template>
    </div>

    <!-- 结算确认弹窗（存在故障） -->
    <AisPopup v-model:show="showSettlePopup" title="结算" position="bottom" round>
      <template #content>
        <div class="question-card">
          <div class="question-text">客户反馈故障是否全部解决</div>
          <div class="option-row">
            <div
              class="option-btn"
              :class="settleOption === 'resolved' ? 'active resolved-active' : ''"
              @click="settleOption = 'resolved'"
            >
              已解决
            </div>
            <div
              class="option-btn"
              :class="settleOption === 'unresolved' ? 'active unresolved-active' : ''"
              @click="settleOption = 'unresolved'"
            >
              未解决
            </div>
          </div>
        </div>

        <!-- 未解决原因单选标签 -->
        <div v-if="settleOption === 'unresolved'" class="reason-card">
          <div class="reason-text">未解决原因</div>
          <div class="reason-tags">
            <div
              v-for="reason in reasonOptions"
              :key="reason.value"
              class="reason-tag"
              :class="{ active: selectedReason === reason.value }"
              @click="selectedReason = reason.value"
            >
              {{ reason.label }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="settle-footer">
          <div class="submit-btn" @click="confirmSettle">确认结算</div>
        </div>
      </template>
    </AisPopup>

    <!-- 二次确认弹窗 -->
    <van-dialog
      v-model:show="showConfirmPopup"
      title=" "
      :show-confirm-button="false"
      :show-cancel-button="false"
      class="confirm-dialog-vant"
      close-on-click-overlay
    >
      <div class="confirm-dialog">
        <div class="confirm-text">确定要生成结算单吗？</div>
        <div class="confirm-actions">
          <div class="confirm-btn cancel" @click="showConfirmPopup = false">取消</div>
          <div class="confirm-divider"></div>
          <div class="confirm-btn confirm" @click="executeSettle">确定结算</div>
        </div>
      </div>
    </van-dialog>

    <!-- 作废弹窗 -->
    <AisPopup v-model:show="showCancelPopup" title="作废" position="bottom" round>
      <template #content>
        <div class="cancel-card">
          <div class="cancel-text">作废原因</div>
          <van-field
            v-model="cancelReason"
            rows="4"
            autosize
            type="textarea"
            maxlength="500"
            placeholder="请输入作废原因"
            show-word-limit
            class="cancel-textarea"
          />
        </div>
      </template>
      <template #footer>
        <div class="cancel-footer">
          <div class="submit-btn" @click="confirmCancel">确认作废</div>
        </div>
      </template>
    </AisPopup>

    <!-- 作废确认弹窗 -->
    <van-dialog
      v-model:show="showCancelConfirmPopup"
      title=" "
      :show-confirm-button="false"
      :show-cancel-button="false"
      class="confirm-dialog-vant"
      close-on-click-overlay
    >
      <div class="confirm-dialog">
        <div class="confirm-text">确定要作废该工单吗？</div>
        <div class="confirm-actions">
          <div class="confirm-btn cancel" @click="showCancelConfirmPopup = false">取消</div>
          <div class="confirm-divider"></div>
          <div class="confirm-btn confirm" @click="executeCancel">确定作废</div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import ListItem from '@/components/ListItem.vue'
import AisPopup from '@/libs/components/AisPopup.vue'
import { getSettlementStatementPage, addServiceProxyStatement, cancelServiceProxy } from '@/api/settlementStatement'
import { callPhone } from '@/libs/utils/nativeFn'
import { copyText } from '@/libs/utils'
import copyIcon from '@/libs/assets/image/copy_icon.svg'
import { usePageSafeArea } from '@/utils/safeArea'

const router = useRouter()
const route = useRoute()

usePageSafeArea()

// 搜索值
const searchValue = ref('')
const hasSearched = ref(false)
const resultList = ref([])

// 结算相关
const showSettlePopup = ref(false)
const showConfirmPopup = ref(false)
const settleOption = ref('resolved')
const selectedReason = ref('')
const currentItem = ref(null)
const submitLoading = ref(false)

// 作废相关
const showCancelPopup = ref(false)
const showCancelConfirmPopup = ref(false)
const cancelReason = ref('')
const cancelItem = ref(null)

// 未解决原因选项
const reasonOptions = [
  { label: '需求不明确', value: '10' },
  { label: '技术方案待确认', value: '20' },
  { label: '依赖第三方接口未联调', value: '30' },
  { label: '测试环境异常', value: '40' },
  { label: '数据缺失或错误', value: '50' },
  { label: '优先级较低暂未处理', value: '60' },
  { label: '涉及多部门协作未对齐', value: '70' },
  { label: '代码修复后未验证', value: '80' },
  { label: '硬件资源不足', value: '90' },
  { label: '其他原因', value: '99' }
]

// 从路由获取当前tab状态，默认为pending
const currentTab = ref(route.query.tab || 'pending')
const statusMap = {
  pending: '160',
  completed: '180'
}

// 搜索列表相关
const searchLoading = ref(false)
const listLoading = ref(false)
const listFinished = ref(false)
const currentPage = ref(1)

const fetchData = async(isRefresh = false) => {
  if (isRefresh) {
    currentPage.value = 1
    resultList.value = []
    listFinished.value = false
  }
  try {
    const res = await getSettlementStatementPage({
      appSearchKeyWord: searchValue.value.trim(),
      orderStatus: statusMap[currentTab.value],
      pageNum: currentPage.value,
      pageSize: 50
    })
    if (res.code === 200) {
      const data = res.data
      const records = data.records || []
      if (isRefresh) {
        resultList.value = records
      } else {
        resultList.value.push(...records)
      }
      if (records.length === 0 || currentPage.value * (data.pageSize || 10) >= data.total) {
        listFinished.value = true
      } else {
        currentPage.value++
      }
    } else {
      listFinished.value = true
    }
  } catch {
    listFinished.value = true
  } finally {
    searchLoading.value = false
    listLoading.value = false
  }
}

const onListLoad = () => {
  fetchData()
}

// 获取状态样式类
const getStatusClass = (status) => {
  // 根据orderStatus返回对应样式
  if (status === 160) return 'status-orange'
  if (status === 180) return 'status-green'
  return 'status-gray'
}

// 根据预警等级返回对应颜色
const getAlarmColor = (alarmLevel) => {
  const colorMap = {
    '10': '#009100', // 绿色
    '20': '#C8A12B', // 橙色
    '30': '#B91919' // 红色
  }
  return colorMap[alarmLevel] || '#009100'
}

// 作废按钮展示逻辑：排除已作废(210)、反结算(200)、已生成结算单(isCreateStatementInfo === 1)
const showCancelBtn = (item) => {
  const orderStatus = Number(item.orderStatus)
  // 已作废、反结算不显示
  if (orderStatus === 210 || orderStatus === 200) {
    return false
  }
  // 已生成结算单不显示
  if (item.isCreateStatementInfo === 1) {
    return false
  }
  return true
}

// 处理搜索
const handleSearch = () => {
  if (!searchValue.value.trim()) {
    showToast('请输入搜索关键词')
    return
  }
  hasSearched.value = true
  searchLoading.value = true
  fetchData(true)
}

// 处理取消（返回按钮）
const handleGoBack = () => {
  router.back()
}

// 联系车主
const handleContact = (item) => {
  const phone = item.customerPhone
  if (phone) {
    callPhone(phone)
  } else {
    showToast('暂无联系电话')
  }
}

// 作废相关函数
const handleCancel = (item) => {
  cancelItem.value = item
  cancelReason.value = ''
  showCancelPopup.value = true
}

// 确认作废 - 显示二次确认弹窗
const confirmCancel = () => {
  if (!cancelReason.value.trim()) {
    showToast('请输入作废原因')
    return
  }
  showCancelPopup.value = false
  showCancelConfirmPopup.value = true
}

// 执行作废
const executeCancel = async() => {
  showCancelConfirmPopup.value = false
  try {
    const res = await cancelServiceProxy({
      id: cancelItem.value.id,
      invaildDesc: cancelReason.value.trim()
    })
    if (res.success) {
      showToast('作废成功')
      fetchData(true)
    } else {
      showToast(res.msg || '作废失败')
    }
  } catch {
    showToast('作废失败')
  }
}

// 跳转到详情
const handleCopyVin = (vin) => {
  copyText(vin)
}

const goToDetail = (item) => {
  const serviceProxyId = item.serviceProxyId || item.id

  if (!serviceProxyId) {
    showToast('缺少施工单ID')
    return
  }

  router.push({
    path: '/settlement-statement/after-sales',
    query: {
      serviceProxyId,
      status: currentTab.value,
      serviceProxyCode: item.serviceProxyCode || item.code || '',
      vehProfileVin: item.vehProfileVin || ''
    }
  })
}

// 结算相关函数
const currentFault = ref(0)

const handleSettle = (item) => {
  currentItem.value = item
  currentFault.value = item.currentFault ?? 0
  settleOption.value = 'resolved'
  selectedReason.value = ''
  if (currentFault.value === 1) {
    showSettlePopup.value = true
  } else {
    showConfirmPopup.value = true
  }
}

const confirmSettle = () => {
  // 非故障进店：直接弹出确认对话框
  if (currentFault.value !== 1) {
    showConfirmPopup.value = true
    return
  }
  // 存在故障：校验未解决原因
  if (settleOption.value === 'unresolved' && !selectedReason.value) {
    showToast('请选择未解决原因')
    return
  }
  showSettlePopup.value = false
  showConfirmPopup.value = true
}

// 执行结算
const executeSettle = async() => {
  showConfirmPopup.value = false
  submitLoading.value = true
  try {
    // 基于列表项数据，添加/修改结算相关字段
    const res = await addServiceProxyStatement({
      ...currentItem.value,
      serviceProxyId: currentItem.value.serviceProxyId || currentItem.value.id,
      faultSolve: settleOption.value === 'resolved' ? 1 : 0,
      faultSolveLabel: settleOption.value === 'resolved' ? '已解决' : '未解决',
      reason: settleOption.value === 'unresolved' ? selectedReason.value : ''
    })
    if (res.success) {
      showToast('结算成功')
      router.push({
        path: '/settlement-statement/after-sales',
        query: {
          serviceProxyId: currentItem.value.serviceProxyId || currentItem.value.id,
          status: currentTab.value,
          serviceProxyCode: currentItem.value.serviceProxyCode || currentItem.value.code || '',
          vehProfileVin: currentItem.value.vehProfileVin || ''
        }
      })
    } else {
      showToast(res.msg || '结算失败')
    }
  } catch {
    showToast('结算失败')
  } finally {
    submitLoading.value = false
  }
}

// 初始化
if (route.params.initialValue) {
  searchValue.value = route.params.initialValue
  handleSearch()
}
</script>

<style lang="scss" scoped>
.settlement-search {
  --safe-area-top: var(--page-safe-area-top, env(safe-area-inset-top, 0px));
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  min-height: 100%;

  // 页面加载中样式
  .page-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.7);
  }

  .search-header {
    flex-shrink: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: calc(44px + var(--safe-area-top));
    padding-top: var(--safe-area-top);
    display: flex;
    align-items: center;
    padding-left: 12px;
    padding-right: 12px;
    background: #fff;
    gap: 10px;

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      cursor: pointer;
    }

    .search-input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0 2px 0 8px;
      height: 30px;
      background: rgba(216, 216, 216, 0.3);
      border-radius: 15px;
      gap: 4px;

      .search-icon {
        flex-shrink: 0;
      }

      .search-input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #191a1b;
        line-height: 1;

        &::placeholder {
          color: #999;
        }
      }

      .search-btn {
        padding: 0 14px;
        height: 26px;
        background: #009100;
        border-radius: 13px;
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        cursor: pointer;
      }
    }
  }

  .search-result {
    margin-top: calc(44px + var(--safe-area-top));
    padding: 12px;

    .search-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 60px;
    }

    .search-list {
      .result-item {
        margin-bottom: 12px;
        background: #ffffff;
        border-radius: 6px;
        padding: 12px;
      }
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-bottom: 8px;
      border-bottom: 0.5px solid #e6e6e5;

      .order-no {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
      }

      .status-tag {
        font-family: 'PingFang SC';
        font-size: 12px;
        font-weight: 500;

        &.status-orange {
          color: #c8a12b;
        }

        &.status-green {
          color: #009100;
        }

        &.status-gray {
          color: #999999;
        }
      }
    }

    .card-body {
      padding-top: 8px;

      .plate-row {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: nowrap;
        overflow: visible;
        margin-bottom: 2px;

        .plate-number {
          font-family: 'PingFang SC';
          font-size: 16px;
          font-weight: 500;
          color: #191a1b;
          white-space: nowrap;
        }

        .vehicle-icon {
          width: 16px;
          height: 16px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .svc-tag {
          padding: 1px 4px;
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #191a1b;
          background: #ffffff;
          border: 0.5px solid #191a1b;
          border-radius: 4px;
          flex-shrink: 0;
          white-space: nowrap;
        }
      }

      .vehicle-line {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
        margin-bottom: 8px;
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

      .info-rows {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;

          .info-label {
            color: #545454;
            width: 56px;
            flex-shrink: 0;
          }

          .info-value-wrap {
            display: flex;
            align-items: center;
            gap: 4px;
            flex: 1;
          }

          .info-value {
            color: #191a1b;
          }

          .cust-type-tag {
            padding: 1px 4px;
            font-family: 'PingFang SC';
            font-size: 12px;
            color: #191a1b;
            background: rgba(25, 26, 27, 0.06);
            border-radius: 4px;
          }
        }
      }
    }

    .action-btns {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 8px;
      padding-top: 8px;

      .btn-pill {
        padding: 0 16px;
        height: 32px;
        font-family: 'PingFang SC';
        font-size: 14px;
        border-radius: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .btn-outline {
        color: #009100;
        background: #ffffff;
        border: 1px solid #009100;
      }

      .btn-primary {
        color: #ffffff;
        background: #009100;
        border: 1px solid #009100;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 0;

      .empty-image {
        width: 230px;
        height: 142px;
        margin-bottom: 16px;
      }

      .empty-text {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #6C6E6C;
      }
    }
  }
}

// 结算弹窗
.question-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;

  .question-text {
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 12px;
  }

  .option-row {
    display: flex;
    gap: 8px;

    .option-btn {
      padding: 0 16px;
      height: 32px;
      font-family: 'PingFang SC';
      font-size: 14px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      // 已解决按钮默认样式
      &:first-child {
        color: #191a1b;
        background: #f8f7f7;
        border: 1px solid transparent;
      }

      // 未解决按钮默认样式
      &:last-child {
        color: #191a1b;
        background: #f8f7f7;
        border: 1px solid transparent;
      }
    }

    // 已解决选中状态
    .resolved-active {
      color: #009100 !important;
      border-color: #009100 !important;
      background: rgba(0, 145, 0, 0.08) !important;
    }

    // 未解决选中状态
    .unresolved-active {
      color: #009100 !important;
      border-color: #009100 !important;
      background: rgba(0, 145, 0, 0.08) !important;
    }
  }
}

// 未解决原因卡片
.reason-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;

  .reason-text {
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 12px;
  }

  .reason-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .reason-tag {
      padding: 0 12px;
      height: 32px;
      font-family: 'PingFang SC';
      font-size: 14px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #191a1b;
      background: #f8f7f7;
      border: 1px solid transparent;

      &.active {
        color: #009100;
        border-color: #009100;
        background: rgba(0, 145, 0, 0.08);
      }
    }
  }
}

// 结算弹窗高度
:deep(.popup) {
  height: 602px !important;
}

.settle-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .submit-btn {
    width: 100%;
    height: 40px;
    background: #009100;
    border-radius: 8px;
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}

// 二次确认弹窗
.confirm-dialog {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;

  .confirm-text {
    height: 80px;
    display: flex;
    justify-content: center;
    font-family: 'PingFang SC';
    font-size: 16px;
    color: #222222;
    padding: 0 24px;
  }

  .confirm-actions {
    height: 54px;
    display: flex;
    align-items: center;
    border-top: 0.5px solid #e6e6e5;

    .confirm-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'PingFang SC';
      font-size: 14px;
      cursor: pointer;

      &.cancel {
        color: #222222;
      }

      &.confirm {
        color: #009100;
      }
    }

    .confirm-divider {
      width: 0.5px;
      height: 54px;
      background: #e6e6e5;
    }
  }
}

:deep(.confirm-dialog-vant) {
  width: 295px;
  background: #ffffff;
  border-radius: 8px;
  padding: 0;

  .van-dialog__content {
    padding: 0;
  }
}

// 作废弹窗样式
.cancel-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;

  .cancel-text {
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 12px;
  }

  .cancel-textarea {
    background: #f8f7f7;
    border-radius: 6px;
    padding: 12px;

    :deep(.van-field__control) {
      background: transparent;
    }
  }
}

.cancel-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .submit-btn {
    width: 100%;
    height: 40px;
    background: #b91919;
    border-radius: 8px;
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}

// 作废弹窗高度
:deep(.popup.cancel-popup) {
  height: 280px !important;
}
</style>
