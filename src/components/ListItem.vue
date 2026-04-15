<template>
  <div class="list-item-content">
    <div class="card_title_header">
      <slot name="header"> </slot>
    </div>
    <div>
      <slot name="card-info"> </slot>
    </div>
    <div class="btn-content" v-if="$slots['btn-content']">
      <slot name="btn-content"> </slot>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.list-item-content {
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;

  .card_title_header {
    display: flex;
    justify-content: space-between;
    font-family: "PingFang SC";
    font-size: 16px;
    font-weight: 500;
    color: #191a1b;
  }

  .card-subtitle-text {
    font-family: "PingFang SC";
    font-size: 13px;
    color: #545454;
  }

  .btn-content {
    margin-top: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
