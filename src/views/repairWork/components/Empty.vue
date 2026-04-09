<template>
  <div class="empty-state">
    <img
      :src="bg"
      alt="暂无数据"
      class="empty-image"
    />
    <p class="empty-text">{{ text }}</p>
  </div>
</template>

<script setup>
import bg from '@/libs/assets/image/no-data.png'

defineProps({
  text: {
    type: String,
    default: '没有找到相关内容'
  }
})
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 230px;
  height: 142px;
  margin: 120px auto 0 auto;

  .empty-image {
    width: 230px;
    height: 142px;
    object-fit: contain;
  }

  .empty-text {
    color: var(--leap-color-default-light-1);
    font-family:
      'PingFang SC',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    margin: 16px 0 0;
    text-align: center;
  }
}
</style>
