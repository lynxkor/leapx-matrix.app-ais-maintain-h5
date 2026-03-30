<template>
  <div class="list-item-collapse">
    <div class="collapse-content">
      <van-collapse v-model="activeNames">
        <van-collapse-item :title="data.title" name="1">
          <div>
            <slot name="collapse_info"></slot>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'

defineProps({
  data: {
    type: Object,
    default: () => {}
  }
})

const activeNames = ref(['1'])
</script>

<style lang="scss" scoped>
.list-item-collapse {
  background: #ffffff;
  border-radius: 7px;
  margin-top: 12px;
  overflow: hidden;

  .collapse-content {
    cursor: pointer;
    transition: background-color 0.2s;
  }
}
</style>
