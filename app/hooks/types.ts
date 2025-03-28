// 定义瓶子状态的枚举
export enum BottleStatus {
  COMPLETED = "completed", // 已完成
  FAILED = "failed", // 失败
  PROCESSING = "processing", // 处理中
}

// 瓶子收据项目类型
export interface SuccessBottleReceipt {
  id: string; // 唯一标识符
  bottleName: string; // 瓶子名称
  capacity: number; // 容量（毫升）
  quantity: number; // 数量
  points: number; // 获得的点数
  date: string; // 日期
  status: BottleStatus.COMPLETED; // 状态
  txHash?: string; // 可选：交易哈希
}

export interface FailedBottleReceipt {
  id: string; // 唯一标识符
  status: BottleStatus.FAILED; // 状态
}

export interface ProcessingBottleReceipt {
  id: string; // 唯一标识符
  status: BottleStatus.PROCESSING; // 状态
}

export type BottleReceipt =
  | SuccessBottleReceipt
  | FailedBottleReceipt
  | ProcessingBottleReceipt;
