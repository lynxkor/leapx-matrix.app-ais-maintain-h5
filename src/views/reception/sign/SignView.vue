<template>
  <shared-sign-view @submit="submitSign" />
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SharedSignView from '@/libs/components/SignView.vue'
import { spSignFinish } from '@/api/reception'
import { uploadFile, uploadFileByUrl } from '@/libs/api/fileConfig'
import { showToast } from 'vant'

defineOptions({
  name: 'DeliverySignView'
})

const route = useRoute()
const router = useRouter()

// 接收路由参数
const signParams = ref({
  vin: route.query.vin || '',
  serviceProxyNo: route.query.serviceProxyNo || ''
})

const submitSign = async(val) => {
  console.log('submitSign', val)

  try {
    // 1. 将 base64 转成文件流
    const base64Data = val.signatureImageData
    // base64 转 Blob
    const byteString = atob(base64Data.split(',')[1])
    const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    const blob = new Blob([ab], { type: mimeString })
    // Blob 转 File
    const file = new File([blob], 'sign.png', { type: mimeString })

    // 2. 调用 uploadFile 方法上传文件流
    const formData = new FormData()
    formData.append('file', file)
    const uploadRes = await uploadFile(formData)

    if (uploadRes.code !== 200) {
      showToast(uploadRes.msg || '上传签字图片失败')
      return
    }

    // 3. 拿到返回的 url
    const fileUrl = uploadRes.data?.authFileUrl || uploadRes.data?.[0]?.authFileUrl || ''

    // 4. 把 url 赋值给 uploadParams.fileUrl，调用 uploadFileByUrl
    const uploadParams = {
      fileUrl: fileUrl,
      businessId: route.query.serviceProxyId || '',
      configCode: 'mcs_serviceproxy',
      attachType: '制单签字'
    }

    const bindRes = await uploadFileByUrl([uploadParams])
    if (bindRes.code !== 200) {
      showToast(bindRes.msg || '绑定签字图片失败')
      return
    }

    const bindData = bindRes.data && bindRes.data.length > 0 ? bindRes.data[0] : {}
    const signImageUrl = bindData.authFileUrl || fileUrl

    // 调用签字完成接口
    const params = {
      ...signParams.value,
      signType: 1,
      signChannel: 30,
      signUrl: signImageUrl
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
