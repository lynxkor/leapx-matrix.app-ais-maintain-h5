<template>
  <div class="step-nav">
    <div class="steps-container">
      <div v-for="(item, index) in steps" :key="index" class="step-item">
        <div class="step-title" :class="{ 'is-done': index <= active }">
          {{ item.title }}
        </div>

        <div v-if="index < steps.length - 1" class="step-line">
          <img
            :src="
              index <= active
                ? '../src/assets/img/arrow_green.png'
                : '../src/assets/img/arrow_gray.png'
            "
            alt="arrow"
            class="step-arrow"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'StepNav' })

defineProps({
  active: { type: Number, default: 0 },
  steps: {
    type: Array,
    default: () => [
      { title: '交付信息' },
      { title: '权益核销' },
      { title: '收款记录' },
      { title: '交车完成' }
    ]
  }
})
</script>

<style lang="scss" scoped>
.step-nav {
  background: #f5f5f5;
  padding: 0.5rem;
  width: 100%;

  .steps-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    height: 32px;

    .step-item {
      position: relative;
      z-index: 1;
      flex: none;

      .step-title {
        font-size: 12px;
        color: #888;
        text-align: center;
        transition: all 0.3s ease;

        &.is-done {
          color: #009100;
          font-weight: 500;
        }
      }

      .step-line {
        position: absolute;
        top: 6px;
        left: calc(50% + 32px);
        transform: translateY(-50%);
        z-index: -1;

        .step-arrow {
          width: 35px;
          height: 10px;
        }
      }
    }
  }
}
</style>
