import { post } from './request.js'

/**
 * 获取接车施工单列表
 * @param {Object} data - 请求参数
 * @param {string} data.tabType - tab类型: today/week/all
 * @param {number} data.pageNum - 页码
 * @param {number} data.pageSize - 每页数量
 * @param {string} data.searchValue - 搜索关键词
 * @param {string} data.status - 工单状态
 * @param {Array} data.repairType - 维修类型
 */
export function getWorkOrderList(data) {
  // TODO: 替换为真实接口地址
  // return post('/api/reception/work-order/list', data)

  // Mock数据用于开发调试
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockList = []
      const pageSize = data.pageSize || 10
      const pageNum = data.pageNum || 1

      // 生成模拟数据
      for (let i = 0; i < pageSize; i++) {
        const index = (pageNum - 1) * pageSize + i
        mockList.push({
          id: `order_${index}`,
          orderNo: `33189389238928392${index % 10}`,
          status: ['pending', 'completed'][index % 4],
          statusText: ['待派工', '预检中', '维修中', '已完成'][index % 4],
          plateNo: index % 3 === 0 ? '' : `浙AA1234${index % 10}`,
          tags: ['一般维修', '钣金', '喷漆'].slice(0, (index % 3) + 1),
          vehicleModel: 'B10-510激光雷达版',
          vin: 'LFV3H6686RKYM3393',
          owner: '王小虎',
          isAppointment: index % 2 === 0,
          manager: '王小丫',
          expectedDelivery: '2026-03-20 17:30'
        })
      }

      resolve({
        code: 200,
        data: {
          records: mockList,
          current: pageNum,
          pageSize: pageSize,
          total: 100
        }
      })
    }, 500)
  })
}

/**
 * 获取工单详情
 * @param {string} id - 工单ID
 */
export function getWorkOrderDetail(id) {
  return post('/api/reception/work-order/detail', { id })
}

/**
 * 创建施工单
 * @param {Object} data - 施工单数据
 */
export function createWorkOrder(data) {
  return post('/api/reception/work-order/create', data)
}

/**
 * 获取维修履历列表
 * @param {Object} data - 请求参数
 * @param {number} data.pageNum - 页码
 * @param {number} data.pageSize - 每页数量
 * @param {string} data.searchValue - 搜索关键词
 * @param {Array} data.repairType - 维修类型
 */
export function getMaintenanceHistoryList(data) {
  // TODO: 替换为真实接口地址
  // return post('/api/reception/maintenance-history/list', data)

  // Mock数据用于开发调试
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockList = []
      const pageSize = data.pageSize || 10
      const pageNum = data.pageNum || 1

      // 生成模拟数据
      for (let i = 0; i < pageSize; i++) {
        const index = (pageNum - 1) * pageSize + i
        mockList.push({
          id: `history_${index}`,
          orderNo: `235844675354334003${index % 10}`,
          status: ['已交车', '维修中', '待派工'][index % 3],
          serviceStore: '杭州零跑中心建设四路店',
          workOrderTime: '2026-03-01 13:15 至 2026-03-10 10:00',
          mileage: `${47000 + index * 100}km`,
          customerManager: '张小龙',
          repairItems: [
            { name: '大电池外观举升检查', paymentType: '保险' },
            { name: '喷漆', paymentType: '自费' },
            { name: '钣金', paymentType: '保险' },
            { name: '机电', paymentType: '保险' }
          ],
          repairParts: [
            { name: '机油滤清器', paymentType: '自费' },
            { name: '发动机机油', paymentType: '自费' },
            { name: '空气滤芯', paymentType: '保险' }
          ]
        })
      }

      resolve({
        code: 200,
        data: {
          records: mockList,
          current: pageNum,
          pageSize: pageSize,
          total: 50
        }
      })
    }, 500)
  })
}

/**
 * 获取权益查询列表
 * @param {Object} data - 请求参数
 * @param {string} data.tabType - tab类型: unused/expired
 * @param {number} data.pageNum - 页码
 * @param {number} data.pageSize - 每页数量
 */
export function getRightsQueryList(data) {
  // TODO: 替换为真实接口地址
  // return post('/api/reception/rights-query/list', data)

  // Mock数据用于开发调试
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockList = []
      const pageSize = data.pageSize || 10
      const pageNum = data.pageNum || 1
      const tabType = data.tabType || 'unused'

      // 生成模拟数据
      for (let i = 0; i < pageSize; i++) {
        const index = (pageNum - 1) * pageSize + i
        const isUnused = tabType === 'unused'

        mockList.push({
          id: `rights_${index}`,
          name: [
            '原厂质保-三电',
            '整车终身质保（含三电）',
            '【服务包】轮胎换新服务',
            '动态-有车型年款-有替换件'
          ][index % 4],
          validityPeriod: isUnused
            ? (index % 2 === 0 ? '永久有效' : '2026-01-04至2026-12-31')
            : '2026-01-04至2026-12-31',
          status: isUnused ? 'usable' : 'expired',
          statusText: isUnused ? '可使用' : '已失效'
        })
      }

      resolve({
        code: 200,
        data: {
          records: mockList,
          current: pageNum,
          pageSize: pageSize,
          total: 50
        }
      })
    }, 500)
  })
}
