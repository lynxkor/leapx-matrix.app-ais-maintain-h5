<template>
  <div class="pre-auth-container">
    <!-- 快速操作面板 -->
    <ListItem>
      <template #header>
        <div class="section-title">快速操作</div>
      </template>
      <template #card-info>
        <van-grid :column-num="2" :border="false">
          <van-grid-item
            icon="add-o"
            text="新建预授权"
            @click="createNewAuth"
          />
          <van-grid-item
            icon="search"
            text="查询预授权"
            @click="searchAuth"
          />
        </van-grid>
      </template>
    </ListItem>

    <!-- 统计卡片 -->
    <ListItem style="margin-top: 12px;">
      <template #header>
        <div class="section-title">统计数据</div>
      </template>
      <template #card-info>
        <van-grid :column-num="3" direction="vertical">
          <van-grid-item text="总计">
            <div class="stat-number">128</div>
            <div class="stat-label">笔</div>
          </van-grid-item>
          <van-grid-item text="待处理">
            <div class="stat-number pending">24</div>
            <div class="stat-label">笔</div>
          </van-grid-item>
          <van-grid-item text="本月新增">
            <div class="stat-number">36</div>
            <div class="stat-label">笔</div>
          </van-grid-item>
        </van-grid>
      </template>
    </ListItem>

    <!-- 功能入口 -->
    <ListItem style="margin-top: 12px;">
      <template #header>
        <div class="section-title">功能入口</div>
      </template>
      <template #card-info>
        <van-cell-group :border="false">
          <van-cell title="我的预授权" is-link to="/pre-authorization" />
          <van-cell title="预授权审批" is-link to="/pre-authorization?tab=approval" />
          <van-cell title="预授权统计" is-link to="/pre-authorization?tab=statistics" />
          <van-cell title="历史记录" is-link to="/pre-authorization?tab=history" />
        </van-cell-group>
      </template>
    </ListItem>

    <!-- 最近活动 -->
    <ListItem style="margin-top: 12px;">
      <template #header>
        <div class="section-title">最近活动</div>
      </template>
      <template #card-info>
        <div class="activity-list">
          <div class="activity-item" v-for="(item, index) in recentActivities" :key="index">
            <div class="activity-icon" :class="item.type">
              <van-icon :name="getActivityIcon(item.type)" />
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ item.title }}</div>
              <div class="activity-time">{{ item.time }}</div>
            </div>
          </div>
        </div>
      </template>
    </ListItem>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ListItem from '@/components/ListItem.vue'

const router = useRouter()

// 最近活动数据
const recentActivities = ref([
  {
    type: 'approval',
    title: '张三的预授权申请已批准',
    time: '今天 14:30'
  },
  {
    type: 'create',
    title: '李四提交了新的预授权申请',
    time: '昨天 16:45'
  },
  {
    type: 'update',
    title: '王五的预授权状态已更新',
    time: '前天 09:20'
  }
])

// 方法定义
const createNewAuth = () => {
  router.push('/pre-authorization/create')
}

const searchAuth = () => {
  // 实现搜索功能
  router.push('/pre-authorization')
}

const getActivityIcon = (type) => {
  switch (type) {
    case 'approval': return 'checked'
    case 'create': return 'add'
    case 'update': return 'edit'
    default: return 'info'
  }
}
</script>

<style lang="scss" scoped>
.pre-auth-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 16px;

  .section-title {
    font-weight: bold;
    color: #323233;
    font-size: 16px;
    margin-bottom: 12px;
  }

  :deep(.list-item-content) {
    margin-bottom: 12px;
  }

  .quick-actions {
    background: linear-gradient(135deg, #2261DD, #4A90E2);
    padding: 16px 0;
    border-radius: 8px;

    :deep(.van-grid-item__content) {
      background-color: transparent !important;

      .van-grid-item__icon {
        font-size: 28px;
        color: white;
      }

      .van-grid-item__text {
        color: white;
        font-weight: 500;
      }
    }
  }

  .stat-number {
    font-size: 24px;
    font-weight: bold;
    color: #323233;

    &.pending {
      color: #ff976a;
    }
  }

  .stat-label {
    font-size: 12px;
    color: #969799;
    margin-top: 4px;
  }

  .function-list {
    border-radius: 8px;
  }

  .activity-list {
    padding: 0;
  }

  .activity-item {
    display: flex;
    align-items: center;
    padding: 12px 0;

    &:not(:last-child) {
      border-bottom: 1px solid #f2f3f5;
    }
  }

  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;

    &.approval {
      background-color: #d4f7ea;
      color: #00c48f;
    }

    &.create {
      background-color: #eef9ff;
      color: #2261dd;
    }

    &.update {
      background-color: #fff7e8;
      color: #ff976a;
    }
  }

  .activity-content {
    flex: 1;
  }

  .activity-title {
    font-size: 14px;
    color: #323233;
    margin-bottom: 4px;
  }

  .activity-time {
    font-size: 12px;
    color: #969799;
  }
}
</style>
