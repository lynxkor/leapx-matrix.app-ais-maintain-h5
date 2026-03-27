<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '90%' }"
    round
    @close="handleClose"
  >
    <div class="final-check-popup">
      <!-- 标题栏 -->
      <div class="popup-header">
        <div class="close-btn" @click="handleClose">
          <van-icon name="cross" />
        </div>
        <div class="header-title">终检确认</div>
      </div>

      <!-- 内容区域 -->
      <div class="popup-content">
        <!-- 电池更换信息 -->
        <div class="info-card">
          <div class="card-title">电池更换信息</div>
          <div class="form-item">
            <div class="form-label">去向单位</div>
            <van-field
              v-model="formData.targetUnit"
              placeholder="请输入"
              :border="false"
              input-align="right"
            />
          </div>
          <div class="form-item">
            <div class="form-label">去向单位统一代码</div>
            <van-field
              v-model="formData.targetUnitCode"
              placeholder="选填，请输入"
              :border="false"
              input-align="right"
            />
          </div>
          <div class="form-item">
            <div class="form-label">更换前编号</div>
            <van-field
              v-model="formData.beforeCode"
              placeholder="请输入"
              :border="false"
              input-align="right"
            />
          </div>
          <div class="form-item last-item">
            <div class="form-label">更换后编号</div>
            <van-field
              v-model="formData.afterCode"
              placeholder="请输入"
              :border="false"
              input-align="right"
            />
          </div>
        </div>

        <!-- 维修配件追溯 -->
        <div class="info-card parts-card">
          <div class="card-title">维修配件追溯</div>
          <div class="parts-list">
            <div v-for="(part, index) in partsList" :key="index" class="part-item">
              <div class="part-header">
                <div class="part-name">{{ part.name }}</div>
                <div class="part-trace-code">追溯编码：{{ part.traceCode }}</div>
              </div>
              <div class="part-form-item">
                <div class="form-label">更换前编号</div>
                <van-field
                  v-model="part.beforeCode"
                  placeholder="请输入"
                  :border="false"
                  input-align="right"
                />
              </div>
              <div class="part-form-item last-item">
                <div class="form-label">更换后编号</div>
                <van-field
                  v-model="part.afterCode"
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
        <div class="footer-bar"></div>
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
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // 配件列表数据
  parts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'close'])

const visible = ref(props.modelValue)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
  }
)

// 监听 visible 变化
watch(visible, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false)
    emit('close')
  }
})

// 电池更换信息表单
const formData = ref({
  targetUnit: '',
  targetUnitCode: '',
  beforeCode: '',
  afterCode: ''
})

// 维修配件列表
const partsList = ref([
  {
    name: '电池包',
    traceCode: 'TR20260317194900123456',
    beforeCode: '',
    afterCode: ''
  },
  {
    name: '这是一个很长很长的很长很长的很长很长的很长很长的零件名称',
    traceCode: 'TR20260317194900123456',
    beforeCode: '',
    afterCode: ''
  }
])

// 是否可以提交
const canSubmit = computed(() => {
  // 电池更换信息必填项
  const batteryValid =
    formData.value.targetUnit && formData.value.beforeCode && formData.value.afterCode

  // 配件追溯必填项
  const partsValid = partsList.value.every((part) => part.beforeCode && part.afterCode)

  return batteryValid && partsValid
})

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}

// 提交
const handleSubmit = () => {
  if (!canSubmit.value) return

  emit('submit', {
    batteryInfo: { ...formData.value },
    partsList: partsList.value.map((part) => ({ ...part }))
  })

  handleClose()
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
    justify-content: center;
    height: 58px;
    background-color: #f4f4f4;
    position: relative;
    flex-shrink: 0;

    .close-btn {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      background-color: var(--leap-color-default-light-2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
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
        height: 50px;
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
          overflow: hidden;
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
    padding: 0 12px 7px;
    flex-shrink: 0;

    .footer-bar {
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;

      &::before {
        content: '';
        width: 134px;
        height: 5px;
        background-color: #000;
        border-radius: 2.5px;
      }
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
