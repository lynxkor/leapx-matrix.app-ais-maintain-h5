<template>
  <div class="fault-info-page">
    <!-- 施工单编号 -->
    <div class="order-number-section">
      <div class="order-number">
        施工单编号：{{ orderNo }}
      </div>
    </div>

    <!-- 本次进店是否存在故障 -->
    <div class="section-card">
      <div class="section-row">
        <span class="section-label">本次进店是否存在故障</span>
        <div class="radio-group">
          <div
            class="radio-item"
            :class="{ active: hasFault === true }"
            @click="hasFault = true"
          >
            <van-icon v-if="hasFault === true" name="checked" color="#009100" size="20" />
            <span>是</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 故障模块 -->
    <div class="section-card">
      <div class="section-header-row">
        <span class="section-title">故障模块</span>
      </div>
      <div class="module-content">
        <!-- 添加故障模块按钮 -->
        <div class="add-module-btn" @click="showAddModulePopup = true">
          <van-icon name="add-o" size="20" color="#009100" />
          <span class="add-text">添加故障模块</span>
        </div>
        <!-- 故障模块列表 -->
        <div
          v-for="(item, index) in faultModules"
          :key="index"
          class="module-item"
        >
          <span class="module-text">{{ item.label }}</span>
          <van-icon name="delete-o" size="16" color="#3B3E3B" @click="handleDeleteModule(index)" />
        </div>
      </div>
    </div>

    <!-- 故障描述 -->
    <div class="section-card">
      <div class="section-header-row">
        <span class="section-title">故障描述</span>
      </div>
      <div class="textarea-wrapper">
        <van-field
          v-model="faultDescription"
          type="textarea"
          placeholder="请输入"
          rows="3"
          autosize
          :maxlength="500"
          class="fault-textarea"
        />
      </div>
    </div>

    <!-- 底部保存按钮 -->
    <div class="bottom-bar">
      <div class="save-btn" @click="handleSubmit">
        保存
      </div>
    </div>

    <!-- 添加故障模块弹窗 -->
    <AddFaultInfoPopup
      v-model:visible="showAddModulePopup"
      @change="handleModuleChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showSuccessToast } from 'vant'
import AddFaultInfoPopup from './components/AddFaultInfoPopup.vue'

// 施工单编号
const orderNo = ref('3318938923892839283')

// 是否存在故障
const hasFault = ref(true)

// 故障模块列表
const faultModules = ref([])

// 故障描述
const faultDescription = ref('')

// 显示添加模块弹窗
const showAddModulePopup = ref(false)

// 删除故障模块
const handleDeleteModule = (index) => {
  faultModules.value.splice(index, 1)
}

// 处理模块变化（从弹窗接收数据）
const handleModuleChange = (modules) => {
  if (modules && modules.length > 0) {
    faultModules.value = modules
  }
}

// 提交保存
const handleSubmit = () => {
  const submitData = {
    orderNo: orderNo.value,
    hasFault: hasFault.value,
    faultModules: faultModules.value,
    faultDescription: faultDescription.value
  }

  console.log('提交数据:', submitData)
  showSuccessToast('保存成功')
}
</script>

<style lang="scss" scoped>
.fault-info-page {
  min-height: 100%;
  background-color: #f7f7f7;
  padding-bottom: 88px;

  // 施工单编号区域
  .order-number-section {
    background-color: #fff;
    padding: 10px 12px;

    .order-number {
      font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #191a1b;
      line-height: 20px;
    }
  }

  // 通用卡片样式
  .section-card {
    background-color: #fff;
    margin-top: 12px;
    padding: 12px;
  }

  // 标题行
  .section-header-row {
    margin-bottom: 12px;

    .section-title {
      font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #191a1b;
      line-height: 20px;
    }
  }

  // 本次进店是否存在故障
  .section-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .section-label {
      font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #191a1b;
      line-height: 20px;
    }

    .radio-group {
      display: flex;
      align-items: center;
      gap: 16px;

      .radio-item {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;

        span {
          font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #191a1b;
          line-height: 20px;
        }

        &.active {
          span {
            color: #191a1b;
          }
        }
      }
    }
  }

  // 故障模块内容
  .module-content {
    .add-module-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #E6F4E6;
      border-radius: 6px;
      gap: 4px;
      height: 40px;
      cursor: pointer;

      .add-text {
        font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: #009100;
        line-height: 20px;
      }
    }

    .module-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      padding: 0 8px;
      background-color: #f8f7f7;
      border-radius: 6px;
      margin-top: 8px;

      .module-text {
        flex: 1;
        font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: #191a1b;
        line-height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  // 故障描述文本框
  .textarea-wrapper {
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 6px;
    overflow: hidden;

    .fault-textarea {
      background: transparent;
      padding: 8px;

      :deep(.van-field__control) {
        font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: #191a1b;
        line-height: 20px;

        &::placeholder {
          color: #888;
        }
      }
    }
  }

  // 底部按钮
  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 7px 12px;
    padding-bottom: 34px;

    .save-btn {
      height: 40px;
      background-color: #009100;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #fff;
      cursor: pointer;
    }
  }
}
</style>
