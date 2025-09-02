// utils/request.js
import axios from 'axios'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量读取基础URL
  timeout: 10000, // 超时时间
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    
    // 从Pinia store获取token
    const token = userStore.token
    
    // 添加Authorization头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    // 请求错误处理
    return Promise.reject(error)
  }
)

export function post(url, data) {
  return service({
    url,
    headers: { 'Content-Type': 'application/json' },
    method: 'post',
    data
  })
}

export function get(url, params) {
  return service({
    url,
    method: 'get',
    params
  })
}

export default service
