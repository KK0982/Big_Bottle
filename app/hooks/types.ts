type Status = "available" | "timeout" | "unusable";

export interface BottleReceipt {
  drinkName: string;
  drinkCapacity: number;
  drinkAmount: number;
  points: number;
  receiptUploadTime: string;
  status: Status;
}
