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
  ACCURATE: 1,
  /** 不准确 */
  INACCURATE: 2
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

