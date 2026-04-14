<template>
  <div class="info-card" @click="onCardClick">
    <!-- 卡片头部 -->
    <div class="card-header">
      <span class="title">{{ data.title }}</span>
      <div class="status-wrapper" v-if="data.status">
        <span class="status-text">{{ data.status }}</span>
        <van-icon name="arrow" size="12" color="#6C6E6C" />
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <div
        v-for="(item, index) in data.items"
        :key="index"
        class="info-row"
      >
        <span class="label">{{ item.label }}</span>
        <span class="value">{{ item.value }}</span>
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
      title: '',
      status: '',
      items: []
    })
  }
})

const emit = defineEmits(['click'])

const onCardClick = () => {
  emit('click', props.data)
}
</script>

<style lang="scss" scoped>
.info-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0px 0px 4px 0px rgba(57, 61, 58, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #191a1b;
    }

    .status-wrapper {
      display: flex;
      align-items: center;
      gap: 4px;

      .status-text {
        font-size: 12px;
        color: #6c6e6c;
      }
    }
  }

  .card-content {
    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 56px;
        font-size: 14px;
        color: #545454;
        flex-shrink: 0;
      }

      .value {
        font-size: 14px;
        color: #191a1b;
        margin-left: 12px;
      }
    }
  }
}
</style>
