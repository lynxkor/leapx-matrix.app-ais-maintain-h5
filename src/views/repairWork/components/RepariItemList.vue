<template>
  <div class="repair-item-list">
    <!-- 折叠头部 -->
    <div class="collapse-header" @click="toggleExpand">
      <span class="header-title">查看维修项目</span>
      <van-icon :name="isExpanded ? 'arrow-up' : 'arrow-down'" />
    </div>

    <!-- 维修项目列表 -->
    <van-collapse v-model="expandedNames" v-show="isExpanded">
      <van-collapse-item title="" :name="1" :border="false" class="collapse-item-wrapper">
        <template #title>
          <div></div>
        </template>

        <div class="item-list">
          <div v-for="(item, index) in repairItems" :key="index" class="repair-item-card">
            <div class="item-content">
              <div class="item-left">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-meta">
                  <span class="meta-text">工位：{{ item.station }}</span>
                  <span class="meta-text">技师：{{ item.technician }}</span>
                </div>
              </div>
              <div class="item-actions">
                <template v-if="item.status === 'pending'">
                  <span class="action-text delete" @click="handleDelete(item)">删除派工</span>
                  <van-divider vertical />
                  <span class="action-text start" @click="handleStart(item)">作业开始</span>
                </template>
                <template v-else-if="item.status === 'working'">
                  <span class="action-text delete" @click="handleDelete(item)">删除派工</span>
                  <van-divider vertical />
                  <span class="action-text end" @click="handleEnd(item)">作业结束</span>
                </template>
                <template v-else-if="item.status === 'finished'">
                  <span class="action-text quality" @click="handleQuality(item)">质检</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </van-collapse-item>
    </van-collapse>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  repairItems: {
    type: Array,
    default: () => [
      {
        name: '更换或拆装更换或拆装气门嘴总成气门嘴总成',
        station: '0001',
        technician: '云佩玉',
        status: 'pending'
      },
      {
        name: '更换或拆装气门嘴总成',
        station: '0001',
        technician: '云佩玉',
        status: 'working'
      },
      {
        name: '更换或拆装左迁门电动防夹玻璃升降器总成更换或拆...',
        station: '0001',
        technician: '云佩玉',
        status: 'working'
      },
      {
        name: '更换或拆装气门嘴总成',
        station: '0001',
        technician: '云佩玉',
        status: 'finished'
      },
      {
        name: '更换或拆装气门嘴总成',
        station: '0001',
        technician: '云佩玉',
        status: 'finished'
      }
    ]
  }
})

const emit = defineEmits(['delete', 'start', 'end', 'quality'])

const isExpanded = ref(true)
const expandedNames = ref([1])

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    expandedNames.value = [1]
  } else {
    expandedNames.value = []
  }
}

const handleDelete = (item) => {
  emit('delete', item)
}

const handleStart = (item) => {
  emit('start', item)
}

const handleEnd = (item) => {
  emit('end', item)
}

const handleQuality = (item) => {
  emit('quality', item)
}
</script>

<style lang="scss" scoped>
.repair-item-list {
  width: 100%;
  border-top: 0.5px solid var(--leap-color-default-light-4);
  border-bottom: 0.5px solid var(--leap-color-default-light-4);
  padding: 10px 0;

  .collapse-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    .header-title {
      font-size: 14px;
      font-family: 'PingFang SC', sans-serif;
      font-weight: 400;
      color: var(--leap-color-default);
      line-height: 20px;
    }

    .van-icon {
      font-size: 16px;
      color: var(--leap-color-default-light-2);
    }
  }

  .collapse-item-wrapper {
    :deep(.van-collapse-item__wrapper) {
      border: none;
    }

    :deep(.van-collapse-item__content) {
      padding: 0;
    }
  }

  .item-list {
    display: flex;
    flex-direction: column;

    .repair-item-card {
      background-color: var(--leap-color-default-light-5);
      border-radius: 4px;
      border-left: 1px solid transparent;
      padding: 8px;
      margin-top: 8px;

      .item-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;

        .item-left {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;

          .item-name {
            font-size: 14px;
            font-family: 'PingFang SC', sans-serif;
            font-weight: 500;
            color: var(--leap-color-default);
            line-height: 20px;
            text-overflow: ellipsis;
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }

          .item-meta {
            display: flex;
            gap: 12px;

            .meta-text {
              font-size: 12px;
              font-family: 'PingFang SC', sans-serif;
              font-weight: 400;
              color: var(--leap-color-default-light-2);
              line-height: 17px;
            }
          }
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;

          .action-text {
            font-size: 14px;
            font-family: 'PingFang SC', sans-serif;
            font-weight: 400;
            line-height: 20px;
            cursor: pointer;

            &.delete {
              color: var(--leap-color-primary);
            }

            &.start {
              color: var(--leap-color-primary);
            }

            &.end {
              color: var(--leap-color-primary);
            }

            &.quality {
              color: var(--leap-color-primary);
            }
          }

          .van-divider {
            margin: 0;
            border-color: var(--leap-color-primary-light-5);
            height: 12px;
          }
        }
      }
    }
  }
}
</style>
