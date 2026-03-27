<template>
  <div class="empty-state">
    <!-- <img
      src="https://image-resource.mastergo.com/134288810350885/167886913559801/5a46c498b007bf55839d32c0237b2418.png"
      alt="暂无数据"
      class="empty-image"
    /> -->
    <p class="empty-text">{{ text }}</p>
  </div>
</template>

<script setup>
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
  height: 183px;
  margin: 40px auto;

  .empty-image {
    width: 230px;
    height: 142px;
    object-fit: contain;
  }

  .empty-text {
    /* token: #6C6E6C */
    color: #6c6e6c;
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
