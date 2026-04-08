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
            <span class="card-name">{{ item.name }}</span>
            <van-icon name="edit" size="16" color="#888888" class="edit-icon" />
          </div>
          <div class="code-row">
            <span class="card-code">{{ item.code }}</span>
          </div>
          <div class="checkout-row" @click="$emit('checkout-click', item)">
            <span class="checkout-label">{{ checkoutLabel }}</span>
            <van-icon name="arrow-down" size="12" color="#545454" class="checkout-arrow" />
          </div>
        </div>
        <!-- 右列 -->
        <div class="info-right">
          <div class="main-price">¥{{ item.price * item.quantity || '0.00' }}</div>
          <div class="discount-wrapper">
            <span class="discount-tag-label">优惠</span>
            <span class="discount-tag-amount">¥{{ item.discountAmount || 0 }}</span>
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
          @change="(val) => $emit('quantity-change', item, val)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['delete', 'checkout-click', 'quantity-change'])

const checkoutLabel = computed(() => {
  const { item } = props
  return [item.repairItemTypeName, item.checkoutTypeName, item.warrantyTypeName].filter(item => item).join('-') || '请选择'
})
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

          .discount-tag-label {
            color: #545454;
          }

          .discount-tag-amount {
            color: #c8a12b;
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
</style>
