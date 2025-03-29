import { Box, Flex, Heading, Skeleton, Text } from "@chakra-ui/react";
import BottleIcon from "./icons/BottleIcon";
import { ReceiptList } from "./ReceiptList";
import { useWeeklyPoints } from "../hooks/use-weekly-points";
import { useWallet } from "@vechain/vechain-kit";

export function Receipt() {
  const { connection, connectedWallet } = useWallet();
  const isConnected = connection.isConnected;

  const { data: weeklyPoints, isLoading } = useWeeklyPoints();
  const displayPoint = isConnected ? weeklyPoints : 0;

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
              <Skeleton
                isLoaded={!isLoading || !isConnected}
                height="24px"
                borderRadius={8}
                startColor="rgba(0, 0, 0, 0.2)"
                endColor="rgba(0, 0, 0, 0.1)"
              >
                <Text fontWeight="600" fontSize="18px" lineHeight="24px">
                  {displayPoint} Week Points
                </Text>
              </Skeleton>
            </Flex>
          </Box>
        </Flex>
      </Heading>
      <ReceiptList />
    </Box>
  );
}
