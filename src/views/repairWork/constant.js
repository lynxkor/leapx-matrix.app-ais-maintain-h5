export const RepairOrderStatusEnum = {
  /** 接车预检测 */
  RECEPTION_INSPECTION: 100,
  /** 制单中 */
  CREATING_ORDER: 110,
  /** 待派工 */
  PENDING_DISPATCH: 120,
  /** 施工中 */
  UNDER_CONSTRUCTION: 140,
  /** 待终检 */
  PENDING_FINAL_INSPECTION: 150,
  /** 待交车 */
  PENDING_DELIVERY: 160,
  /** 已交车 */
  DELIVERED: 180,
  /** 反结算 */
  ANTI_SETTLEMENT: 200,
  /** 已作废 */
  CANCEL: 210
}

// Tab对应的工单状态查询值
export const TabStatusMap = {
  dispatch: RepairOrderStatusEnum.PENDING_DISPATCH, // 120 待派工
  working: RepairOrderStatusEnum.UNDER_CONSTRUCTION, // 140 施工中
  inspection: RepairOrderStatusEnum.PENDING_FINAL_INSPECTION // 150 待终检
}

export const BusinessTypeEnum = {
  /** 自然到店 */
  NATURAL_ARRIVAL: 10,
  /** 取送车到店 */
  PICKUP_DELIVERY: 20,
  /** 上门服务 */
  DOOR_SERVICE: 30,
  /** 外出驻点服务 */
  ONSITE_SERVICE: 40,
  /** 预约到店 */
  APPOINTMENT_ARRIVAL: 50,
  /** 反结算审批 */
  ANTI_SETTLEMENT_APPROVAL: 60
}

// 结算类型枚举
export const CheckoutTypeEnum = {
  /** 自费 */
  SELF_PAY: '352BB70C-82AC-E911-B0BB-FC82BA5F9EDF',
  /** 保险 */
  INSURANCE: '372BB70C-82AC-E911-B0BB-FC82BA5F9EDF',
  /** 保修 */
  WARRANTY: '392BB70C-82AC-E911-B0BB-FC82BA5F9EDF',
  /** 合同 */
  CONTRACT: '3B2BB70C-82AC-E911-B0BB-FC82BA5F9EDF',
  /** 内部结算 */
  INTERNAL_SETTLEMENT: '3D2BB70C-82AC-E911-B0BB-FC82BA5F9EDF'
}

// 保修类型枚举
export const WarrantyTypeEnum = {
  /** 技术服务活动 */
  TECHNICAL_SERVICE_ACTIVITY: '64A3066F-82AC-E911-B0BB-FC82BA5F9EDF',
  /** 免费保养 */
  FREE_MAINTENANCE: '60A3066F-82AC-E911-B0BB-FC82BA5F9EDF',
  /** 终身保养 */
  LIFETIME_MAINTENANCE: '4EC01DDD-DD79-EC11-B0F9-9216EACB73F2',
  /** 保养套餐 */
  MAINTENANCE_PACKAGE: 'BA408917-12AE-EF11-B1BC-B6F71A4539C1',
  /** 售前保修 */
  PRE_SALE_WARRANTY: 'ED68D3F0-C1FB-E911-B0BB-FC82BA5F9EDF'
}

// 万能工时项目ID
export const UNIVERSAL_LABOR_HOUR_ITEM_ID = '999999'

// 提醒信息类型枚举
export const RemindInfoTypeEnum = {
  /** 服务活动提醒 */
  SERVICE_ACTIVITY: '1',
  /** 三包预警 */
  THREE_GUARANTEES: '2',
  /** 预授权提醒 */
  PRE_AUTH: '3'
}

// 三包预警等级枚举
export const AlarmLevelEnum = {
  /** 未指定 */
  NOT_SPECIFIED: 0,
  /** 过期 */
  EXPIRED: 10,
  /** 正常 */
  NORMAL: 20,
  /** 黄色 */
  WARNING: 30,
  /** 红色 */
  CRITICAL: 40
}

// 本次进店情况枚举
export const CurrentSituationEnum = {
  /** 非故障进店 */
  NO_FAULT: 10,
  /** 首次故障进店 */
  FIRST_FAULT: 20,
  /** 多次非重复故障进店 */
  MULTIPLE_DIFFERENT_FAULT: 30,
  /** 多次重复故障进店 */
  MULTIPLE_REPEAT_FAULT: 40
}

// 维修类型枚举
export const MaintenanceTypeEnum = {
  /** 一般维修 */
  GENERAL_REPAIR: '898A364C-DD79-EC11-B0F9-9216EACB73F2',
  /** 钣喷 */
  SHEET_PAINT: '1073B058-DD79-EC11-B0F9-9216EACB73F2',
  /** 美容，装潢 */
  BEAUTY: '137F5860-DD79-EC11-B0F9-9216EACB73F2',
  /** 精品附件 */
  ACCESSORIES: '9C938267-DD79-EC11-B0F9-9216EACB73F2',
  /** 三电维修 */
  BATTERY_REPAIR: 'EC34606E-DD79-EC11-B0F9-9216EACB73F2',
  /** 保养 */
  MAINTENANCE: '6EA3066F-82AC-E911-B0BB-FC82BA5F9EDF'
}

// 维修作业记录状态枚举 (repairWorkRecord.status)
export const WorkRecordStatusEnum = {
  /** 作业未开始 */
  NOT_STARTED: 10,
  /** 作业中 */
  IN_PROGRESS: 20,
  /** 中断 */
  SUSPEND: 30,
  /** 作业完成 */
  COMPLETED: 40,
  /** 作业作废 */
  CANCELLED: 50
}

// 质检状态枚举
export const QualityCheckStatusEnum = {
  /** 待质检 */
  PENDING: 10,
  /** 质检完成 */
  COMPLETED: 30
}

// 派工状态枚举
export const DispatchStatusEnum = {
  /** 未派工 */
  NOT_DISPATCHED: 0,
  /** 已派工 */
  DISPATCHED: 1
}

export const PAGESIZE = 20

// 维修项目
export const MaintenanceTypeList = [
  {
    'code': '898A364C-DD79-EC11-B0F9-9216EACB73F2',
    'message': '一般维修'
  },
  {
    'code': '1073B058-DD79-EC11-B0F9-9216EACB73F2',
    'message': '钣喷'
  },
  {
    'code': '137F5860-DD79-EC11-B0F9-9216EACB73F2',
    'message': '美容，装潢'
  },
  {
    'code': '9C938267-DD79-EC11-B0F9-9216EACB73F2',
    'message': '精品附件'
  },
  {
    'code': 'EC34606E-DD79-EC11-B0F9-9216EACB73F2',
    'message': '三电维修'
  },
  {
    'code': '6EA3066F-82AC-E911-B0BB-FC82BA5F9EDF',
    'message': '保养'
  },
  {
    'code': '019D2E08-67B6-75D9-ACC4-9A832B44F9E9',
    'message': '保修'
  }
]

// 结算类型
export const CheckoutTypeList = [
  {
    'code': '352BB70C-82AC-E911-B0BB-FC82BA5F9EDF',
    'message': '自费'
  },
  {
    'code': '372BB70C-82AC-E911-B0BB-FC82BA5F9EDF',
    'message': '保险'
  },
  {
    'code': '392BB70C-82AC-E911-B0BB-FC82BA5F9EDF',
    'message': '保修'
  },
  {
    'code': '3B2BB70C-82AC-E911-B0BB-FC82BA5F9EDF',
    'message': '合同'
  },
  {
    'code': '3D2BB70C-82AC-E911-B0BB-FC82BA5F9EDF',
    'message': '内部结算'
  }
]

