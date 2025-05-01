type Status = "available" | "timeout" | "unusable" | "waiting";

export interface BottleReceipt {
  drinkName: string;
  drinkCapacity: number;
  drinkAmount: number;
  points: number;
  receiptUploadTime: string;
  status: Status;
}
