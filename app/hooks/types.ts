export enum BottleStatus {
  COMPLETED = "completed", // 已完成
  FAILED = "failed", // 失败
  PROCESSING = "processing", // 处理中
}

export interface SuccessBottleReceipt {
  drinkName: string;
  drinkCapacity: number;
  drinkAmount: number;
  points: number;
  status: BottleStatus.COMPLETED;
}

export interface FailedBottleReceipt {
  status: BottleStatus.FAILED;
}

export interface ProcessingBottleReceipt {
  status: BottleStatus.PROCESSING;
}

export type BottleReceipt =
  | SuccessBottleReceipt
  | FailedBottleReceipt
  | ProcessingBottleReceipt;
