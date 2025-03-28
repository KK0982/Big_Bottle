import { Box } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import { EmptyReceipt } from "./EmptyReceipt";
import { NotConnect } from "./NotConnect";

export function ReceiptList() {
  const { connection } = useWallet();

  const isConnected = connection.isConnected;
  const isEmpty = isConnected && true;

  return (
    <Box mt={3}>
      {isConnected ? null : <NotConnect />}
      {isEmpty ? <EmptyReceipt /> : null}
    </Box>
  );
}
