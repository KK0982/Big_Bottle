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
  const isEmpty = data?.length === 0;
  const isFetching = isLoading;
  // const isDataLoaded = sFetching && !isEmpty && data;
  const isDataLoaded = data && !isEmpty;

  return (
    <Box mt={3} display="flex" flexDirection="column" pb={20} gap={3}>
      {isConnected ? null : <NotConnect />}
      {isFetching ? <ReceiptLoading /> : null}
      {isEmpty ? <EmptyReceipt /> : null}
      {isDataLoaded &&
        data.map((receipt) => (
          <ReceiptItem key={receipt.receiptUploadTime} receipt={receipt} />
        ))}
    </Box>
  );
}
