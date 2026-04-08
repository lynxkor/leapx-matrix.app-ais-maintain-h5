<template>
  <div class="repair-item-card">
    <div class="card-delete" @click="$emit('delete')">
      <div class="delete-circle">
        <van-icon name="delete-o" size="16" color="#B91919" />
      </div>
    </div>
    <div class="card-body">
      <!-- 上半区：信息行 -->
      <div class="card-info-row">
        <!-- 左列 -->
        <div class="info-left">
          <div class="name-row">
            <span class="card-name" @click="openNameEditPopup">{{ item.name }}</span>
            <van-icon name="edit" size="16" color="#888888" class="edit-icon" @click="openNameEditPopup" />
          </div>
          <div class="code-row">
            <span class="card-code">{{ item.code }}</span>
          </div>
          <div class="checkout-row" @click="emit('update-item', item, { _action: 'checkout' })">
            <span class="checkout-label">{{ checkoutLabel }}</span>
            <van-icon name="arrow-down" size="12" color="#545454" class="checkout-arrow" />
          </div>
        </div>
        <!-- 右列 -->
        <div class="info-right">
          <div class="main-price">¥{{ (item.price * item.quantity - item.discountAmount) || '0.00' }}</div>
          <div class="discount-wrapper" @click="startEditDiscount">
            <span class="discount-tag-label">优惠</span>
            <template v-if="editingDiscount">
              <input
                ref="discountInputRef"
                v-model="tempDiscountAmount"
                class="discount-input"
                type="number"
                @blur="saveDiscountAmount"
                @keydown.enter="saveDiscountAmount"
              />
            </template>
            <span v-else class="discount-tag-amount">¥{{ item.discountAmount || 0 }}</span>
          </div>
        </div>
      </div>
      <!-- 下半区：原价 + 步进器 -->
      <div class="card-bottom-row">
        <span class="original-price">¥{{ item.price || '0.00' }}</span>
        <van-stepper
          :model-value="item.quantity"
          min="1"
          class="card-stepper"
          input-width="32px"
          button-size="32px"
          @change="(val) => emit('update-item', item, { quantity: val })"
        />
      </div>
    </div>

    <!-- 名称编辑弹窗 -->
    <van-popup v-model:show="showNameEditPopup" round position="center" :style="{ width: '295px' }">
      <div class="name-edit-popup">
        <div class="popup-title">维修项目名称</div>
        <div class="input-container">
          <van-field ref="nameInputRef" v-model="tempName" placeholder="请输入维修项目名称" clearable/>
        </div>
        <div class="popup-actions">
          <div class="action-btn cancel-btn" @click="cancelNameEdit">取消</div>
          <div class="divider"></div>
          <div class="action-btn save-btn" @click="saveName">保存</div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'update-item'])

// 名称编辑
const showNameEditPopup = ref(false)
const tempName = ref('')

// 优惠金额编辑
const editingDiscount = ref(false)
const tempDiscountAmount = ref('0')
const discountInputRef = ref(null)
const nameInputRef = ref(null)

// 打开名称编辑弹窗并初始化数据
const openNameEditPopup = () => {
  tempName.value = props.item.name || ''
  showNameEditPopup.value = true
  nextTick(() => {
    nameInputRef.value?.focus()
  })
}

const checkoutLabel = computed(() => {
  const { item } = props
  return [item.repairItemTypeName, item.checkoutTypeName, item.warrantyTypeName].filter(item => item).join('-') || '请选择'
})

// 开始编辑优惠金额
const startEditDiscount = () => {
  editingDiscount.value = true
  tempDiscountAmount.value = String(props.item.discountAmount || 0)
  nextTick(() => {
    discountInputRef.value?.focus()
  })
}

// 保存优惠金额
const saveDiscountAmount = () => {
  let amount = parseFloat(tempDiscountAmount.value) || 0
  if (amount < 0) {
    amount = 0
  }
  if (amount > props.item.price * props.item.quantity) {
    amount = props.item.price * props.item.quantity
  }
  emit('update-item', props.item, { discountAmount: amount })
  editingDiscount.value = false
}

// 取消名称编辑
const cancelNameEdit = () => {
  showNameEditPopup.value = false
  tempName.value = ''
}

// 保存名称
const saveName = () => {
  const name = tempName.value.trim()
  if (name) {
    emit('update-item', props.item, { name })
  }
  showNameEditPopup.value = false
  tempName.value = ''
}
</script>

<style lang="scss" scoped>
.repair-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 4px;
  border-bottom: 0.5px solid #e6e6e5;
  &:last-child {
    border-bottom: none;
  }

  // 删除按钮
  .card-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .delete-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #f8e8e8; // 功能色/danger-10%
      border-radius: 60px;
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }
    }
  }

  // 卡片主体
  .card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;

    // 上半区：信息行
    .card-info-row {
      display: flex;
      justify-content: space-between;
      gap: 2px;

      // 左列：名称、代码、结算类型
      .info-left {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .name-row {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 20px;

          .card-name {
            font-family: 'PingFang SC', sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: #191a1b;
            line-height: 20px;
            cursor: pointer;
          }

          .edit-icon {
            flex-shrink: 0;
            cursor: pointer;
          }
        }

        .code-row {
          margin: 2px 0;
          .card-code {
            font-family: 'PingFang SC', sans-serif;
            font-size: 12px;
            color: #545454;
            line-height: 17px;
          }
        }

        .checkout-row {
          display: flex;
          align-items: center;
          height: 20px;
          padding: 2px 4px;
          background: rgba(84, 84, 84, 0.06);
          border-radius: 4px;
          cursor: pointer;

          .checkout-label {
            font-family: 'PingFang SC', sans-serif;
            font-size: 12px;
            color: #545454;
            line-height: 17px;
          }

          .checkout-arrow {
            margin-left: auto;
          }

          &:active {
            background: rgba(84, 84, 84, 0.1);
          }
        }
      }

      // 右列：价格、优惠
      .info-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
        flex-shrink: 0;

        .main-price {
          font-family: 'PingFang SC', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #191a1b;
          line-height: 20px;
          text-align: right;
        }

        .discount-wrapper {
          display: flex;
          flex-shrink: 0;
          margin-top: 3px;
          padding: 4px;
          border-radius: 4px;
          background: #faf6ea; // 功能色/warning-10%
          align-items: center;
          justify-content: space-between;
          width: 92px;
          font-size: 12px;
          cursor: pointer;

          .discount-tag-label {
            color: #545454;
          }

          .discount-tag-amount {
            color: #c8a12b;
          }

          .discount-input {
            width: 50px;
            height: 20px;
            text-align: right;
            border: 1px solid #191A1B;
            border-radius: 2px;
            padding: 0 4px;
            font-family: 'PingFang SC', sans-serif;
            font-size: 12px;
            color: #c8a12b;
            background: #faf6ea; // 功能色/warning-10%
            outline: none;
            &:focus {
              border-color: #faf6ea;
            }
          }
        }
      }
    }

    // 下半区：原价 + 步进器
    .card-bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      height: 32px;

      .original-price {
        font-family: 'PingFang SC', sans-serif;
        font-size: 12px;
        color: #545454;
        line-height: 17px;
      }

      .card-stepper {
        border: 1px solid #191A1B;
        color: #191A1B;
        border-radius: 4px;
        ::v-deep .van-stepper__minus, ::v-deep .van-stepper__plus {
          background: #fff;
          color: #191A1B;
          font-weight: 500;
        }
        ::v-deep .van-stepper__minus--disabled, ::v-deep.van-stepper__plus--disabled {
          color: #ddd;
        }
        ::v-deep .van-stepper__input {
          background: #fff;
        }
      }
    }
  }
}

// 名称编辑弹窗
.name-edit-popup {
  display: flex;
  flex-direction: column;
  padding-top: 32px;
  background: #fff;
  border-radius: 8px;

  .popup-title {
    font-family: 'PingFang SC', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #191a1b;
    line-height: 24px;
    text-align: center;
    margin-bottom: 8px;
  }

  .input-container {
    position: relative;
    margin: 0 12px;
    margin-bottom: 32px;
    ::v-deep .van-field{
      background: rgba(0, 0, 0, 0.04);
      border-radius: 7px;
    }
    .name-input {
      width: 100%;
      height: 40px;
      padding: 0 40px 0 7px;
      background: rgba(0, 0, 0, 0.04);
      border: none;
      border-radius: 11.2px;
      font-family: 'PingFang SC', sans-serif;
      font-size: 14px;
      color: #191a1b;
      line-height: 20px;
      outline: none;

      &::placeholder {
        color: #9d9f9d;
      }

      &:focus {
        background: rgba(0, 0, 0, 0.04);
      }
    }

    .error-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }
    }
  }

  .popup-actions {
    display: flex;
    align-items: center;
    height: 54px;
    border-top: 0.5px solid #e6e6e5;
    padding: 0 16px;

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 22px;
      font-family: 'PingFang SC', sans-serif;
      font-size: 14px;
      color: #191a1b;
      line-height: 22px;
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }
    }

    .save-btn {
      color: #009100;
    }

    .divider {
      height: 54px;
      width: 0.5px;
      background: #e6e6e5;
      margin: 0 16px;
    }
  }
}
</style>
