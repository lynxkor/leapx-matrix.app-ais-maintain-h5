<template>
  <div class="rights-query">
    <!-- Tab 导航 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="0px" @change="onTabChange">
      <van-tab title="未使用" name="unused"></van-tab>
      <van-tab title="已失效" name="expired"></van-tab>
    </van-tabs>

    <!-- 列表内容 -->
    <div class="common-scroll-content" ref="scrollEle">
      <RefreshList :requestData="requestData" :needRefresh="needRefresh" @setData="onSetData">
        <div v-if="list.length > 0" class="card-list">
          <div v-for="item in list" :key="item.id" class="rights-card">
            <div class="card-main">
              <div class="card-left">
                <div class="card-top">
                  <span class="rights-name">{{ item.name }}</span>
                </div>
                <div class="card-bottom">
                  <span class="validity-period">{{ item.validityPeriod }}</span>
                </div>
              </div>
              <div class="card-divider"></div>
              <div class="card-right">
                <span class="status-tag" :class="getStatusClass(item.status)">{{
                  item.statusText
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-list">
          <img src="@/assets/image/noList.png" alt="" />
        </div>
      </RefreshList>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RefreshList from '@/libs/components/RefreshList.vue'
import { getRightsQueryList } from '@/api/workOrder'

const needRefresh = ref(false)

// Tab 状态
const activeTab = ref('unused')

// 列表数据
const list = ref([])

// 请求参数
const requestData = computed(() => ({
  api: getRightsQueryList,
  data: {
    tabType: activeTab.value,
    pageNum: 1,
    pageSize: 10
  }
}))

// Tab 切换
const onTabChange = (name) => {
  needRefresh.value = true
}

// 设置列表数据
const onSetData = (data) => {
  if (data.isRefresh) {
    list.value = data.list
  } else {
    list.value.push(...data.list)
  }
  needRefresh.value = false
}

// 获取状态样式类
const getStatusClass = (status) => {
  const statusMap = {
    usable: 'status-usable',
    expired: 'status-expired'
  }
  return statusMap[status] || 'status-usable'
}
</script>

<style lang="scss" scoped>
.rights-query {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f7f7;

  :deep(.van-tabs) {
    flex-shrink: 0;
  }

  :deep(.van-tabs__nav) {
    background: #ffffff;
  }

  :deep(.van-tab--active) {
    color: #009100;
    font-weight: 500;
  }

  :deep(.van-tabs__line) {
    background: #009100;
  }

  .common-scroll-content {
    overflow-y: auto;
    flex: 1;
  }
}

.card-list {
  padding: 12px;
}

.rights-card {
  margin-bottom: 12px;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }

  .card-main {
    padding: 16px;
    background-image: url('@/assets/image/interests.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 6px;
      min-width: 0;

      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .rights-name {
          font-size: 16px;
          font-weight: 500;
          color: #191a1b;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .card-bottom {
        .validity-period {
          font-size: 12px;
          color: #888888;
        }
      }
    }

    .card-divider {
      width: 1px;
      height: 60px;
      background-image: linear-gradient(to bottom, transparent 0%, #dce0e4 50%, transparent 100%);
      background-size: 1px 6px;
      background-repeat: repeat-y;
      margin: 0 16px;
      flex-shrink: 0;
    }

    .card-right {
      flex-shrink: 0;

      .status-tag {
        font-size: 14px;
        padding: 8px 16px;
        border-radius: 20px;
        display: inline-block;

        &.status-usable {
          color: #009100;
          background: #e6f4e6;
        }

        &.status-expired {
          color: #888888;
          background: #f5f5f5;
        }
      }
    }
  }
}

.no-list {
  height: 45vh;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 200px;
  }
}
</style>
