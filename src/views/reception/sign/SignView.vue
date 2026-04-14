<template>
  <shared-sign-view @submit="submitSign" />
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SharedSignView from '@/libs/components/SignView.vue'
import { spSignFinish } from '@/api/reception'
import { uploadFileByUrl } from '@/libs/api/fileConfig'
import { showToast } from 'vant'

defineOptions({
  name: 'DeliverySignView',
})

const route = useRoute()
const router = useRouter()

// 接收路由参数
const signParams = ref({
  vin: route.query.vin || '',
  serviceProxyNo: route.query.serviceProxyNo || '',
})

const submitSign = async (val) => {
  console.log('submitSign', val)
  // 先上传 base64 签名图片，获取 URL
  const uploadParams = {
    fileUrl: val.signatureImageData, // base64 格式
    businessId: route.query.serviceProxyId || '',
    configCode: 'mcs_serviceproxy',
    attachType: '制单签字',
  }

  try {
    const uploadRes = await uploadFileByUrl([uploadParams])
    if (uploadRes.code !== 200) {
      showToast(uploadRes.msg || '上传签字图片失败')
      return
    }

    const uploadData = uploadRes.data && uploadRes.data.length > 0 ? uploadRes.data[0] : {}
    const signImageUrl = uploadData.authFileUrl || ''

    // 调用签字完成接口
    const params = {
      ...signParams.value,
      signType: 1,
      signChannel: 30,
      signUrl: signImageUrl,
    }

    const res = await spSignFinish(params)
    console.log('spSignFinish', res)
    if (res.code === 200) {
      showToast('提交成功')
      router.back()
    } else {
      showToast(res.msg || '提交失败')
    }
  } catch (err) {
    showToast(err.msg || '提交失败')
  }
}
</script>
