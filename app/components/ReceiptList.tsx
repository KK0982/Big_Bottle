import { Box } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { EmptyReceipt } from "./EmptyReceipt";
import { NotConnect } from "./NotConnect";
import { useReceipts } from "../hooks/use-receipts";
import { ReceiptLoading } from "./ReceiptLoading";
import { ReceiptItem } from "./ReceiptItem";

export function ReceiptList() {
  const { connection } = useWallet();
  const { data, isLoading } = useReceipts();

  const isConnected = connection.isConnected;
  const isEmpty = data?.length === 0 && !isLoading;

  return (
    <Box mt={3} display="flex" flexDirection="column" gap={3}>
      {isConnected ? null : <NotConnect />}
      {isLoading ? <ReceiptLoading /> : null}
      {isEmpty ? <EmptyReceipt /> : null}
      {data &&
        data.map((receipt) => (
          <ReceiptItem key={receipt.receiptUploadTime} receipt={receipt} />
        ))}
    </Box>
  );
}
