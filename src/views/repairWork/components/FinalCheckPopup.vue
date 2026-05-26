<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '90%' }"
    round
    teleport="body"
    @close="handleClose"
  >
    <div class="final-check-popup">
      <!-- 标题栏 -->
      <div class="popup-header">
        <div class="close-btn" @click="handleClose">
          <van-icon name="cross" />
        </div>
        <div class="header-title">终检确认</div>
        <div class="header-right"></div>
      </div>

      <!-- 内容区域 -->
      <div class="popup-content" v-loading="loadingDetail">
        <!-- 电池更换信息 -->
        <div v-if="detailData?.batteryFlag" class="info-card">
          <div class="card-title">电池更换信息</div>
          <div class="form-item">
            <div class="form-label">去向单位</div>
            <div class="form-field">
              <SearchDropdown
                v-model="formData.batteryUnitId"
                :search-keyword="formData.batteryUnitName"
                :options="batteryUnitOptions"
                placeholder="请搜索去向单位"
                @onSearch="searchBatteryUnit"
                @focus="onBatteryUnitFocus"
                @select="handleBatteryUnitSelect"
                @clear="handleBatteryUnitClear"
              />
            </div>
          </div>
          <div class="form-item">
            <div class="form-label">去向单位统一代码</div>
            <van-field
              v-model="formData.targetUnitCode"
              placeholder="选填，请输入"
              :border="false"
              input-align="right"
              disabled
            />
          </div>
          <div class="form-item">
            <div class="form-label">更换前编号</div>
            <van-field
              v-model="formData.beforeChangeCode"
              placeholder="请输入"
              :border="false"
              input-align="right"
            />
          </div>
          <div class="form-item last-item">
            <div class="form-label">更换后编号</div>
            <van-field
              v-model="formData.afterChangeCode"
              placeholder="请输入"
              :border="false"
              input-align="right"
            />
          </div>
        </div>

        <!-- 维修配件追溯 -->
        <div v-if="detailData?.tranceFlag" class="info-card parts-card">
          <div class="card-title">维修配件追溯</div>
          <div class="parts-list">
            <div v-for="(part, index) in partsList" :key="index" class="part-item">
              <div class="part-header">
                <div class="part-name">{{ part.partsName }}</div>
                <div v-if="part.code" class="part-trace-code">追溯编码：{{ part.code }}</div>
              </div>
              <div class="part-form-item">
                <div class="form-label">去向单位</div>
                <div class="form-field">
                  <SearchDropdown
                    v-model="part.targetUnitId"
                    :search-keyword="part.targetUnitName"
                    :options="batteryUnitOptions"
                    placeholder="请搜索去向单位"
                    @onSearch="searchBatteryUnit"
                    @focus="onBatteryUnitFocus"
                    @select="(option) => handlePartUnitSelect(option, part)"
                    @clear="handlePartUnitClear(part)"
                  />
                </div>
              </div>
              <div class="part-form-item">
                <div class="form-label">去向单位统一代码</div>
                <van-field
                  v-model="part.buinessLicense"
                  placeholder="选填，请输入"
                  :border="false"
                  input-align="right"
                  disabled
                />
              </div>
              <div class="part-form-item">
                <div class="form-label">更换前编号</div>
                <van-field
                  v-model="part.beforeChangeCode"
                  placeholder="请输入"
                  :border="false"
                  input-align="right"
                />
              </div>
              <div class="part-form-item last-item">
                <div class="form-label">更换后编号</div>
                <van-field
                  v-model="part.afterChangeCode"
                  placeholder="请输入"
                  :border="false"
                  input-align="right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="popup-footer">
        <div class="footer-bar">
          <van-button
            type="primary"
            color="var(--leap-color-primary)"
            round
            block
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            提交
          </van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import SearchDropdown from '@/libs/components/SearchDropdown.vue'
import { finalInspectionDetail, getBatteryUnitList, finalInspection, saveTraceRecord } from '../../../api/repairWork'
import { formatDateTime } from '@/libs/utils'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  serviceProxyId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'close'])

const visible = ref(props.modelValue)
const loadingDetail = ref(false)
const detailData = ref(null)

// 电池单位搜索选项
const batteryUnitOptions = ref([])

// 电池更换信息表单
const formData = ref({
  batteryUnitId: '',
  batteryUnitName: '',
  targetUnitCode: '',
  beforeChangeCode: '',
  afterChangeCode: ''
})

// 维修配件列表
const partsList = ref([])

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal && props.serviceProxyId) {
      loadDetail()
    }
  }
)

// 监听 visible 变化
watch(visible, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false)
    emit('close')
  }
})

// 加载终检详情
const loadDetail = async() => {
  loadingDetail.value = true
  try {
    const res = await finalInspectionDetail(props.serviceProxyId)
    if (res.code === 200) {
      const data = res.data || {}
      detailData.value = data
      // 填充电池信息
      formData.value = {
        batteryUnitId: data.batteryUnitId || '',
        batteryUnitName: data.batteryUnitName || '',
        targetUnitCode: data.targetUnitCode || '',
        beforeChangeCode: data.beforeChangeCode || '',
        afterChangeCode: data.afterChangeCode || ''
      }
      if (data.batteryUnitId && data.batteryUnitName) {
        batteryUnitOptions.value = [{
          label: data.batteryUnitName,
          value: data.batteryUnitId
        }]
      }
      // 填充配件追溯列表
      partsList.value = (data.partsTraceRecordResps || []).map((item) => ({
        ...item,
        beforeChangeCode: item.beforeChangeCode || '',
        afterChangeCode: item.afterChangeCode || ''
      }))
    }
  } catch {
    showToast('获取终检详情失败')
  } finally {
    loadingDetail.value = false
  }
}

// 搜索电池去向单位
const searchBatteryUnit = async(keyword) => {
  try {
    const res = await getBatteryUnitList({ name: keyword })
    if (res.code === 200) {
      batteryUnitOptions.value = (res.data || []).map((item) => ({
        ...item,
        label: item.name,
        value: item.id
      }))
    } else {
      batteryUnitOptions.value = []
      showToast(res.message)
    }
  } catch {
    batteryUnitOptions.value = []
  }
}

// 聚焦时加载默认列表
const onBatteryUnitFocus = () => {
  searchBatteryUnit('')
}

// 选择电池去向单位
const handleBatteryUnitSelect = (option) => {
  formData.value.batteryUnitId = option.value
  formData.value.batteryUnitName = option.label
  formData.value.targetUnitCode = option.buinessLicense
}

// 清除电池去向单位
const handleBatteryUnitClear = () => {
  formData.value.batteryUnitId = ''
  formData.value.batteryUnitName = ''
  formData.value.targetUnitCode = ''
}

// 选择零件去向单位
const handlePartUnitSelect = (option, part) => {
  part.targetUnitId = option.value
  part.targetUnitName = option.label
  part.buinessLicense = option.buinessLicense
}

// 清除零件去向单位
const handlePartUnitClear = (part) => {
  part.targetUnitId = ''
  part.targetUnitName = ''
  part.buinessLicense = ''
  part.batteryUnitId = ''
  part.batteryUnitName = ''
}

// 是否可以提交
const canSubmit = computed(() => {
  // 电池更换信息必填项（如果展示了电池区域）
  const batteryValid = !detailData.value?.batteryFlag ||
    (formData.value.batteryUnitId && formData.value.beforeChangeCode && formData.value.afterChangeCode)

  // 配件追溯必填项（如果展示了追溯区域）
  const partsValid = !detailData.value?.tranceFlag ||
    partsList.value.every((part) => part.beforeChangeCode && part.afterChangeCode && part.targetUnitId && part.targetUnitName)

  return batteryValid && partsValid
})

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  formData.value = {
    batteryUnitId: '',
    batteryUnitName: '',
    targetUnitCode: '',
    beforeChangeCode: '',
    afterChangeCode: ''
  }
}

// 提交
const handleSubmit = () => {
  if (!canSubmit.value) return
  const userStore = useUserStore()

  const submitData = {
    id: props.serviceProxyId
    // finalCheckAt: formatDateTime(new Date()),
    // finalCheckerId: userStore.userId,
    // finalChecker: userStore.userName,
    // faultAlertRecordParams: detailData.value.faultAlertRecordResps || [],
    // repairWorkRecordResps: detailData.value.repairWorkRecordResps || [],
    // currentFault: detailData.value.faultFlag ? 1 : 0
  }

  // 电池信息
  if (detailData.value?.batteryFlag) {
    submitData.batteryUnitId = formData.value.batteryUnitId
    submitData.batteryUnitName = formData.value.batteryUnitName
    submitData.targetUnitCode = formData.value.targetUnitCode
    submitData.beforeChangeCode = formData.value.beforeChangeCode
    submitData.afterChangeCode = formData.value.afterChangeCode
  }

  // 配件追溯
  if (detailData.value?.tranceFlag) {
    submitData.traceRecordParams = partsList.value
  }

  saveTraceRecord(submitData).then(target => {
    if (target.code === 200) {
      Object.assign(submitData, {
        finalCheckAt: formatDateTime(new Date()),
        finalCheckerId: userStore.userId,
        finalChecker: userStore.userName,
        faultAlertRecordParams: detailData.value.faultAlertRecordResps || [],
        repairWorkRecordResps: detailData.value.repairWorkRecordResps || [],
        currentFault: detailData.value.faultFlag ? 1 : 0
      })
      finalInspection(submitData).then(res => {
        if (res.code === 200) {
          showToast('终检成功')
          emit('refresh')
          emit('update:modelValue', false)
        } else {
          showToast(res.msg || '终检失败')
        }
      }).catch(err => {
        showToast(err.msg || '终检失败')
        emit('refresh')
      })
    } else {
      showToast({
        message: target.message,
        duration: 5000
      })
    }
  }).catch(res => {
    showToast(res.message)
    emit('refresh')
  })
}
</script>

<style lang="scss" scoped>
.final-check-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f4f4f4;

  // 标题栏
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 58px;
    background-color: #f4f4f4;
    padding: 0 16px;
    flex-shrink: 0;

    .close-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--leap-color-default-light-2);
      border-radius: 50%;
      cursor: pointer;

      .van-icon {
        font-size: 12px;
        color: #fff;
      }
    }

    .header-title {
      font-size: 14px;
      font-family: 'PingFang SC', sans-serif;
      font-weight: 500;
      color: var(--leap-color-default);
      line-height: 20px;
    }

    .header-right {
      width: 20px;
    }
  }

  // 内容区域
  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 12px;

    .info-card {
      background-color: #fff;
      border-radius: 8px;
      margin-bottom: 12px;
      padding: 4px 12px;

      .card-title {
        padding: 12px 0;
        font-size: 14px;
        font-family: 'PingFang SC', sans-serif;
        font-weight: 600;
        color: var(--leap-color-default);
        line-height: 20px;
      }

      .form-item {
        display: flex;
        align-items: center;
        min-height: 50px;
        border-bottom: 0.5px solid var(--leap-color-default-light-4);

        &.last-item {
          border-bottom: none;
        }

        .form-label {
          flex-shrink: 0;
          font-size: 14px;
          font-family: 'PingFang SC', sans-serif;
          font-weight: 400;
          color: var(--leap-color-default);
          line-height: 20px;
          margin-right: 10px;
        }

        .form-field {
          flex: 1;
          min-width: 0;
        }

        :deep(.van-cell) {
          flex: 1;
          padding: 0;
          background: transparent;

          &::after {
            display: none;
          }

          .van-field__control {
            text-align: right;
            font-size: 14px;
            font-family: 'PingFang SC', sans-serif;
            font-weight: 400;
            background-color: #fff;
            padding-right: 0;
          }

          .van-field__control::placeholder {
            color: var(--leap-color-default-light-2);
          }
        }
      }
    }

    .parts-card {
      padding: 4px 12px 12px;

      .parts-list {
        .part-item {
          background-color: var(--leap-color-default-light-5);
          border-radius: 4px;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          .part-header {
            padding: 12px 0;
            background-color: transparent;
            border-bottom: 0.5px solid var(--leap-color-default-light-4);
            margin: 0 8px;

            .part-name {
              font-size: 14px;
              font-family: 'PingFang SC', sans-serif;
              font-weight: 600;
              color: var(--leap-color-default);
              line-height: 20px;
              word-break: break-all;
            }

            .part-trace-code {
              margin-top: 2px;
              font-size: 12px;
              font-family: 'PingFang SC', sans-serif;
              font-weight: 400;
              color: var(--leap-color-default-light-2);
              line-height: 17px;
            }
          }

          .part-form-item {
            display: flex;
            align-items: center;
            height: 50px;
            border-bottom: 0.5px solid var(--leap-color-default-light-4);
            padding: 0 8px;

            &.last-item {
              border-bottom: none;
            }

            .form-field {
              flex: 1;
              min-width: 0;
            }

            .form-label {
              flex-shrink: 0;
              font-size: 14px;
              font-family: 'PingFang SC', sans-serif;
              font-weight: 400;
              color: var(--leap-color-default);
              line-height: 20px;
            }

            :deep(.van-cell) {
              flex: 1;
              padding: 0;
              background: transparent;

              &::after {
                display: none;
              }

              .van-field__control {
                text-align: right;
                font-size: 14px;
                font-family: 'PingFang SC', sans-serif;
                font-weight: 400;
                padding-right: 0;
              }

              .van-field__control::placeholder {
                color: var(--leap-color-default-light-2);
              }
            }
          }
        }
      }
    }
  }

  // 底部按钮
  .popup-footer {
    height: 88px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0 12px 34px 12px;
    flex-shrink: 0;

    .footer-bar {
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;

      // &::before {
      //   content: '';
      //   width: 134px;
      //   height: 5px;
      //   background-color: #000;
      //   border-radius: 2.5px;
      // }
    }

    .van-button {
      height: 40px;
      font-size: 14px;
      font-family: 'PingFang SC', sans-serif;
      font-weight: 400;
    }
  }
}
</style>
