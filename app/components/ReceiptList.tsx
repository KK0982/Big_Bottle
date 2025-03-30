import { Box } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { EmptyReceipt } from "./EmptyReceipt";
import { NotConnect } from "./NotConnect";
import { useReceipts } from "../hooks/use-receipts";
import { ReceiptLoading } from "./ReceiptLoading";
import { ReceiptItem } from "./ReceiptItem";
import { BottleStatus } from "../hooks/types";

export function ReceiptList() {
  const { connection } = useWallet();
  const { data, isLoading } = useReceipts();

  const isConnected = connection.isConnected;

  return (
    <Box mt={3} display="flex" flexDirection="column" gap={3}>
      {isConnected ? null : <NotConnect />}
      {isLoading ? <ReceiptLoading /> : null}
      {data && <ReceiptItem receipt={data} />}
    </Box>
  );
}
