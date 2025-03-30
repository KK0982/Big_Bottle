export enum BottleStatus {
  EMPTY = "empty", // no bottle receipt data
  COMPLETED = "completed", // bottle receipt data is completed
  FAILED = "failed", // bottle receipt data is failed
  PROCESSING = "processing", // bottle receipt data is processing
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

export interface EmptyBottleReceipt {
  status: BottleStatus.EMPTY;
}

export type BottleReceipt =
  | SuccessBottleReceipt
  | FailedBottleReceipt
  | ProcessingBottleReceipt
  | EmptyBottleReceipt;
