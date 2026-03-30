<template>
  <div class="parts-item-card">
    <!-- 左侧删除按钮 -->
    <div class="delete-btn" @click="onDelete">
      <van-icon name="delete-o" color="#B91919" size="16" />
    </div>

    <!-- 右侧内容区域 -->
    <div class="card-content">
      <!-- 上部信息 -->
      <div class="info-section">
        <!-- 左侧项目信息 -->
        <div class="project-info">
          <div class="project-name">{{ data.name }}</div>
          <div class="project-code">{{ data.code }}</div>
          <div class="category-tag" @click="onCategoryClick">
            <span>{{ data.category }}</span>
          </div>
        </div>

        <!-- 右侧价格信息 -->
        <div class="price-info">
          <div class="price">¥{{ data.price }}</div>
          <div class="discount-row" v-if="data.discount !== undefined">
            <span class="discount-label">优惠</span>
            <span class="discount-value">¥{{ data.discount }}</span>
          </div>
        </div>
      </div>

      <!-- 底部小计和数量 -->
      <div class="footer-section">
        <span class="subtotal">¥{{ data.subtotal }}</span>
        <van-stepper v-model="data.quantity" :min="1" @change="onQuantityChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      name: '',
      code: '',
      category: '',
      price: '0.00',
      discount: '0.00',
      subtotal: '0.00',
      quantity: 1
    })
  }
})

const emit = defineEmits(['delete', 'change', 'categoryClick'])

const onDelete = () => {
  emit('delete', props.data)
}

const onQuantityChange = (value) => {
  emit('change', { ...props.data, quantity: value })
}

const onCategoryClick = () => {
  emit('categoryClick', props.data)
}
</script>

<style lang="scss" scoped>
.parts-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;

  .delete-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #f8e8e8;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .info-section {
      display: flex;
      justify-content: space-between;
      gap: 2px;

      .project-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .project-name {
          font-size: 14px;
          font-weight: 500;
          color: #191a1b;
        }

        .project-code {
          font-size: 12px;
          color: #545454;
        }

        .category-tag {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 2px 4px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 12px;
          color: #545454;
          width: fit-content;
          cursor: pointer;
        }
      }

      .price-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;

        .price {
          font-size: 14px;
          font-weight: 500;
          color: #191a1b;
        }

        .discount-row {
          display: flex;
          align-items: center;

          .discount-label {
            padding: 2px 4px;
            background: #faf6ea;
            border: 0.5px solid #faf6ea;
            border-radius: 4px 0 0 4px;
            font-size: 12px;
            color: #545454;
          }

          .discount-value {
            padding: 2px 4px;
            background: #faf6ea;
            border: 0.5px solid #faf6ea;
            border-radius: 0 4px 4px 0;
            font-size: 12px;
            color: #c8a12b;
          }
        }
      }
    }

    .footer-section {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .subtotal {
        font-size: 12px;
        color: #545454;
      }
    }
  }

  .van-stepper {
    border: 1px solid #191a1b;
    border-radius: 4px;
  }
  :deep(.van-stepper__minus),
  :deep(.van-stepper__plus),
  :deep(.van-stepper__input) {
    background: #fff;
  }

  :deep(.van-stepper__minus--disabled),
  :deep(.van-stepper__plus--disabled) {
    background-color: #fff;
  }
}
</style>
