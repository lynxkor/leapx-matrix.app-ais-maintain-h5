<template>
  <div class="create-pre-auth">
    <van-nav-bar
      title="新建预授权"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      right-text="保存"
      @click-right="savePreAuth"
    />

    <van-form @submit="onSubmit" class="form-container">
      <!-- 客户信息卡片 -->
      <ListItem>
        <template #header>
          <span class="card-title">客户信息</span>
        </template>
        <template #card-info>
          <van-field
            v-model="formData.customerName"
            name="customerName"
            label="客户姓名"
            placeholder="请输入客户姓名"
            :rules="[{ required: true, message: '请填写客户姓名' }]"
          />
          <van-field
            v-model="formData.phone"
            name="phone"
            label="联系电话"
            placeholder="请输入联系电话"
            :rules="[
              { required: true, message: '请填写联系电话' },
              { validator: phoneValidator, message: '手机号格式错误' }
            ]"
          />
          <van-field
            v-model="formData.vin"
            name="vin"
            label="VIN码"
            placeholder="请输入车辆VIN码"
            :rules="[{ required: true, message: '请填写VIN码' }]"
          />
          <van-field
            v-model="formData.model"
            name="model"
            label="车型"
            placeholder="请输入车型"
            :rules="[{ required: true, message: '请填写车型' }]"
          />
        </template>
      </ListItem>

      <!-- 维修项目卡片 -->
      <ListItem style="margin-top: 12px;">
        <template #header>
          <div class="card-header">
            <span class="card-title">维修项目</span>
            <van-button size="small" type="primary" @click="addItem">
              添加项目
            </van-button>
          </div>
        </template>
        <template #card-info>
          <div class="repair-items">
            <div
              v-for="(item, index) in formData.repairItems"
              :key="index"
              class="repair-item"
            >
              <div class="item-header">
                <span class="item-index">项目 {{ index + 1 }}</span>
                <van-button size="mini" type="danger" @click="removeItem(index)">
                  删除
                </van-button>
              </div>

              <van-field
                v-model="item.name"
                :name="`itemName${index}`"
                label="项目名称"
                placeholder="请输入项目名称"
                :rules="[{ required: true, message: '请填写项目名称' }]"
              />

              <van-field
                v-model="item.description"
                :name="`itemDesc${index}`"
                label="项目描述"
                type="textarea"
                placeholder="请输入项目描述"
                rows="2"
              />

              <van-field
                v-model="item.price"
                :name="`itemPrice${index}`"
                label="价格"
                type="digit"
                placeholder="请输入价格"
                :rules="[{ required: true, message: '请填写价格' }]"
              />
            </div>
          </div>
        </template>
      </ListItem>

      <!-- 预授权信息卡片 -->
      <ListItem style="margin-top: 12px;">
        <template #header>
          <span class="card-title">预授权信息</span>
        </template>
        <template #card-info>
          <van-field
            v-model="formData.amount"
            name="amount"
            label="预授权金额"
            type="digit"
            placeholder="请输入预授权金额"
            :rules="[{ required: true, message: '请填写预授权金额' }]"
          />
          <van-field
            v-model="formData.validityPeriod"
            name="validityPeriod"
            label="有效期(天)"
            type="digit"
            placeholder="请输入有效期"
            :rules="[{ required: true, message: '请填写有效期' }]"
          />
          <van-field
            v-model="formData.notes"
            name="notes"
            label="备注"
            type="textarea"
            placeholder="请输入备注信息"
            rows="3"
          />
        </template>
      </ListItem>

      <!-- 提交按钮 -->
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          提交预授权申请
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import ListItem from '@/components/ListItem.vue'

const router = useRouter()

// 表单数据
const formData = ref({
  customerName: '',
  phone: '',
  vin: '',
  model: '',
  amount: '',
  validityPeriod: '',
  notes: '',
  repairItems: [
    {
      name: '',
      description: '',
      price: ''
    }
  ]
})

// 方法定义
const onClickLeft = () => {
  router.back()
}

const savePreAuth = () => {
  // 保存草稿功能
  Toast('已保存草稿')
}

const onSubmit = (values) => {
  // 提交表单验证
  console.log('提交数据:', values)

  // 验证维修项目
  const hasValidItems = formData.value.repairItems.some(
    item => item.name && item.price
  )

  if (!hasValidItems) {
    Toast.fail('请至少添加一个有效的维修项目')
    return
  }

  // 计算总金额
  const totalAmount = formData.value.repairItems.reduce((sum, item) => {
    return sum + parseFloat(item.price || 0)
  }, 0)

  if (Math.abs(totalAmount - parseFloat(formData.value.amount)) > 0.01) {
    Toast.fail('维修项目总金额与预授权金额不符')
    return
  }

  Toast.success('预授权申请提交成功！')
  router.push('/pre-authorization')
}

const phoneValidator = (val) => {
  return /^1[3-9]\d{9}$/.test(val)
}

const addItem = () => {
  formData.value.repairItems.push({
    name: '',
    description: '',
    price: ''
  })
}

const removeItem = (index) => {
  if (formData.value.repairItems.length > 1) {
    formData.value.repairItems.splice(index, 1)
  } else {
    Toast('至少保留一个维修项目')
  }
}
</script>

<style lang="scss" scoped>
.create-pre-auth {
  min-height: 100vh;
  background-color: #f5f5f5;

  .form-container {
    padding-top: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px 16px 16px;

    .card-title {
      font-weight: bold;
      color: #323233;
      font-size: 16px;
    }
  }

  .repair-items {
    .repair-item {
      border-bottom: 1px solid #f2f3f5;
      padding-bottom: 16px;
      margin-bottom: 16px;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .item-index {
          font-weight: bold;
          color: #323233;
        }
      }

      :deep(.van-field) {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
