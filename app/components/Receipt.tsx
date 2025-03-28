import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import BottleIcon from "./BottleIcon";
import { ReceiptList } from "./ReceiptList";

export function Receipt() {
  return (
    <Box mt={6}>
      <Heading>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontWeight="700" fontSize="24px" lineHeight="32px">
            My Receipt
          </Text>
          <Box>
            <Flex alignItems="center" gap={1}>
              <BottleIcon />
              <Text fontWeight="600" fontSize="18px" lineHeight="24px">
                0 Week Points
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Heading>
      <ReceiptList />
    </Box>
  );
}
