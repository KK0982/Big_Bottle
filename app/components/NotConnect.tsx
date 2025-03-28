import { Box, Button, Text } from "@chakra-ui/react";
import { useConnectModal } from "@vechain/vechain-kit";

export function NotConnect() {
  const { open } = useConnectModal();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={3}
      borderRadius="20px"
      backgroundColor="white"
      minHeight="120px"
    >
      <Button
        fontWeight="600"
        fontSize="14px"
        lineHeight="20px"
        p="6px 8px"
        borderRadius="8px"
        backgroundColor="primary.500"
        color="white"
        onClick={() => {
          open();
        }}
        _hover={{
          backgroundColor: "primary.600",
        }}
      >
        Connect Wallet
      </Button>
      <Text
        fontSize="14px"
        lineHeight="20px"
        fontWeight="400"
        color="rgba(0, 0, 0, 0.5)"
      >
        Please connect your wallet.
      </Text>
    </Box>
  );
}
