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

/** 签字渠道 */
export const SignChannelEnum = {
  /** 短信 */
  SMS: 10,
  /** APP */
  APP: 20,
  /** 零小跑 */
  LXPAO: 30,
  /** 纸质单据 */
  PAPER: 40
}

/** 签字状态 */
export const SignStatusEnum = {
  /** 待签字 */
  PENDING_SIGN: 10,
  /** 已签字 */
  SIGNED: 20
}

/** 当前故障 */
export const CurrentFaultEnum = {
  /** 无故障 */
  NONE: 0,
  /** 有故障 */
  HAS_FAULT: 1
}

/** 故障确认结果 */
export const ConfirmFaultEnum = {
  /** 准确 */
  ACCURATE: 10,
  /** 不准确 */
  INACCURATE: 20
}

/** 业务类型 */
export const BusinessTypeEnum = {
  /** 自然到店 */
  NATURAL_ARRIVAL: 10,
  /** 取送车到店 */
  PICKUP_DELIVERY_ARRIVAL: 20,
  /** 上门服务 */
  DOOR_SERVICE: 30,
  /** 外出驻点服务 */
  ONSITE_SERVICE: 40,
  /** 预约到店 */
  APPOINTMENT_ARRIVAL: 50
}

/** 客户类型 */
export const CustTypeEnum = {
  /** 预约客户 */
  APPOINTMENT: '10',
  /** 随到客户 */
  WALK_IN: '20'
}

/** 客户类型标签映射 */
export const CustTypeLabelMap = {
  [CustTypeEnum.APPOINTMENT]: '预约客户',
  [CustTypeEnum.WALK_IN]: '随到客户'
}

/** 故障提醒涉及的维修类型 */
export const FAULT_REMIND_REPAIR_TYPES = ['一般维修', '三电维修', '保修']

/** 故障提醒文案 */
export const FAULT_REMIND_MESSAGE =
  '维修类型为一般维修或三电维修或保修，系统默认调整 【本次进店是否存在故障】为是，存在故障，请填写故障模块信息!'

/** 权益使用状态 */
export const RightsStatusEnum = {
  /** 待生效 */
  PENDING: 1,
  /** 可使用 */
  USABLE: 2,
  /** 已锁定 */
  LOCKED: 3,
  /** 已使用 */
  USED: 4,
  /** 已失效 */
  EXPIRED: 5,
  /** 已回收 */
  RECYCLED: 6
}

/** 权益类型 */
export const RightsTypeEnum = {
  /** 终身身份权益卡 */
  LIFETIME_CARD: 1,
  /** 期限身份权益卡 */
  TERM_CARD: 2,
  /** 优惠券(尾款抵扣券/服务抵扣券) */
  COUPON: 3,
  /** 服务代金券 */
  SERVICE_VOUCHER: 4,
  /** 商品兑换券 */
  GOODS_VOUCHER: 5,
  /** 折扣券 */
  DISCOUNT_COUPON: 6
}

