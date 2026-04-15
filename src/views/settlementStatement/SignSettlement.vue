<template>
  <div class="sign-settlement-page">
    <div class="sign-header">
      <div class="sign-tip">请使用正楷字体在下方区域签字</div>
    </div>
    <div class="sign-body">
      <SignView :submitting="isSubmitting" @submit="handleSignSubmit" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import SignView from '@/libs/components/SignView.vue'
import { signSettlementStatement } from '@/api/settlementStatement'
import { uploadFile, bindFile } from '@/libs/api/fileConfig'

const router = useRouter()
const route = useRoute()

const isSubmitting = ref(false)

// base64 转 Blob
const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

const handleSignSubmit = async({ signatureImageData }) => {
  const statementId = route.query.statementId
  if (!statementId) {
    showToast('缺少结算单信息')
    return
  }

  if (!signatureImageData) {
    showToast('签名数据为空')
    return
  }

  isSubmitting.value = true
  showLoadingToast({ message: '提交中...', forbidClick: true, duration: 0 })

  try {
    // 1. 上传签名图片
    const blob = dataURLtoBlob(signatureImageData)
    const file = new File([blob], `sign_${statementId}_${Date.now()}.png`, { type: 'image/png' })
    const formData = new FormData()
    formData.append('file', file)

    const uploadRes = await uploadFile(formData)
    let fileUrl = ''
    if (uploadRes?.code === 200 || uploadRes?.code === 0) {
      fileUrl = uploadRes?.data?.url || uploadRes?.data || ''
    } else {
      closeToast()
      showToast(uploadRes?.msg || '签名上传失败')
      isSubmitting.value = false
      return
    }

    // 2. 绑定附件与业务关系（如有需要）
    if (fileUrl) {
      try {
        await bindFile({
          businessId: statementId,
          attachType: 'sign',
          fileList: [
            {
              fileName: file.name,
              fileUrl,
              fileType: 'image/png'
            }
          ]
        })
      } catch (e) {
        // 绑定失败不影响主流程，仅打印日志
        console.warn('绑定附件失败', e)
      }
    }

    // 3. 提交签字
    const payload = {
      id: statementId,
      signUrl: fileUrl
    }
    const res = await signSettlementStatement(payload)
    closeToast()
    if (res?.code === 200 || res?.code === 0 || res?.success) {
      showToast('签字提交成功')
      router.replace({
        path: '/settlement-statement/signed',
        query: {
          statementId,
          serviceProxyId: route.query.serviceProxyId || '',
          sourceStatus: route.query.sourceStatus || 'pending',
          signed: 'true'
        }
      })
    } else {
      showToast(res?.msg || '签字提交失败')
    }
  } catch (error) {
    closeToast()
    showToast('签字提交失败')
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.sign-settlement-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;

  .sign-header {
    padding: 12px;
    background: #f5f5f5;

    .sign-tip {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #545454;
      text-align: center;
    }
  }

  .sign-body {
    flex: 1;
    overflow: hidden;
    padding: 12px;
  }
}
</style>
