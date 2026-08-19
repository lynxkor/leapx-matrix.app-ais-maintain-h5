<template>
  <div class="rights-query">
    <!-- 车辆信息头部 - 固定在nav bar下面 -->
    <div class="vehicle-header" v-if="vehicleInfo.vin">
      <div class="vin-text">{{ vehicleInfo.vin }}</div>
    </div>

    <!-- Tab 导航 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="0px">
      <van-tab title="未使用" :name="RightsStatusEnum.USABLE"></van-tab>
      <van-tab title="已失效" :name="RightsStatusEnum.EXPIRED"></van-tab>
    </van-tabs>

    <!-- 列表内容 -->
    <div class="common-scroll-content" ref="scrollEle">
      <RefreshList :requestData="requestData" @setData="onSetData">
        <div v-if="list.length > 0" class="card-list">
          <div v-for="item in list" :key="item.id" class="rights-card" @click="onCardClick(item)">
            <div class="card-main">
              <div class="card-left">
                <div class="card-top">
                  <span
                    class="rights-name"
                    :style="{
                      color: item.rightsStatus == RightsStatusEnum.USABLE ? '#191a1b' : '#888'
                    }"
                    >{{ item.rightsName }}</span
                  >
                </div>
                <div class="card-bottom">
                  <span v-if="item.forever == 1" class="validity-period">永久有效</span>
                  <span v-else>{{ item.effectDate }} 至 {{ item.expiryDate }}</span>
                </div>
              </div>
              <div class="card-divider"></div>
              <div class="card-right">
                <span
                  v-if="item.rightsStatus == RightsStatusEnum.USABLE"
                  class="status-tag status-usable"
                  >可使用</span
                >
                <span
                  v-if="item.rightsStatus == RightsStatusEnum.EXPIRED"
                  class="status-tag status-expired"
                  >已失效</span
                >
              </div>
            </div>
          </div>
        </div>
        <Empty v-else />
      </RefreshList>
    </div>

    <!-- 身份权益卡权益说明弹窗 -->
    <AisPopup
      v-model:show="showRightsDesc"
      :title="currentRights?.rightsName"
      style="height: 70%"
    >
      <template #content>
        <div class="rights-desc" v-html="currentRights?.rightsDesc"></div>
      </template>
    </AisPopup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import RefreshList from '@/libs/components/RefreshList.vue'
import AisPopup from '@/components/AisPopup.vue'
import Empty from '@/views/repairWork/components/Empty.vue'
import { getRightsList } from '@/api/reception'
import { RightsStatusEnum, RightsTypeEnum } from './constant'
import { useRoute } from 'vue-router'
import { usePageSafeArea } from '@/utils/safeArea'

const route = useRoute()
usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })
// 车辆信息
const vehicleInfo = reactive({
  vin: ''
})

// Tab 状态
const activeTab = ref(RightsStatusEnum.USABLE)

// 全量列表数据（接口不支持按状态搜索，一次性拉取后前端过滤）
const allList = ref([])

// 当前 tab 按权益使用状态过滤后的展示数据
const list = computed(() =>
  allList.value.filter((item) => item.rightsStatus === activeTab.value)
)

// 权益说明弹窗
const showRightsDesc = ref(false)
const currentRights = ref(null)

// 请求参数
const requestData = reactive({
  data: {
    rightsTypeList: [RightsTypeEnum.LIFETIME_CARD, RightsTypeEnum.COUPON],
    serviceProxyId: route.query.id
  },
  api: getRightsList
})

// 设置列表数据
const onSetData = (data) => {
  if (data.isRefresh) {
    allList.value = data.list
  } else {
    allList.value.push(...data.list)
  }
}

// 身份权益卡（终身/期限）点击查看权益说明
const onCardClick = (item) => {
  if (
    item.rightsType === RightsTypeEnum.LIFETIME_CARD ||
    item.rightsType === RightsTypeEnum.TERM_CARD
  ) {
    currentRights.value = item
    showRightsDesc.value = true
  }
}

// 页面加载时获取车辆信息
onMounted(() => {
  const { vin } = route.query
  if (vin) {
    vehicleInfo.vin = vin
  }
})
</script>

<style lang="scss" scoped>
.rights-query {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f7f7;

  .vehicle-header {
    background: #ffffff;
    padding: 8px 12px;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 1;

    .vin-text {
      font-size: 14px;
      color: #888;
      line-height: 17px;
      text-align: center;
    }
  }

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
  padding: 12px 0;
  height: auto;
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

.rights-desc {
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  color: #333333;
  line-height: 1.6;
  word-break: break-word;

  :deep(img) {
    max-width: 100%;
    height: auto;
  }

  :deep(p) {
    margin: 0 0 8px;
  }
}
</style>
