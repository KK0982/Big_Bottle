import { Box, Flex, Text } from "@chakra-ui/react";
import { BottleReceipt } from "../hooks/types";
import { SuccessIcon } from "./icons/success";
import { ErrorIcon } from "./icons/error";
import BottleIcon from "./icons/BottleIcon";
// import { ProcessingIcon } from "./icons/Processing";
import dayjs from "dayjs";
import { ProcessingIcon } from "./icons/Processing";

export function ReceiptItem({ receipt }: { receipt: BottleReceipt }) {
  if (receipt.status === "unusable" || receipt.status === "timeout") {
    return (
      <Box borderRadius={20} background="white" minH="120px" p={4}>
        <Flex justifyContent="space-between">
          <Text
            fontSize="18px"
            lineHeight="24px"
            fontWeight="600"
            color="error"
          >
            Your receipt doesn&apos;t meet the requirements
          </Text>
          <ErrorIcon width={40} height={40} />
        </Flex>
        <Flex justifyContent="end" mt={4} alignItems="end">
          <Text fontSize="14px" lineHeight="14px" fontWeight="400">
            {dayjs(receipt.receiptUploadTime).format("DD/MM/YYYY HH:mm")}
          </Text>
        </Flex>
      </Box>
    );
  }

  if (receipt.status === "waiting") {
    return (
      <Box borderRadius={20} background="white" minH="120px" p={4}>
        <Flex justifyContent="space-between">
          <Text fontSize="18px" lineHeight="24px" fontWeight="600">
            Analyzing your receipt, please wait...
          </Text>
          <ProcessingIcon width={40} height={40} />
        </Flex>
      </Box>
    );
  }

  // if (receipt.status === "timeout") {
  //   return (
  //     <Box borderRadius={20} background="white" minH="120px" p={4}>
  //       <Flex justifyContent="space-between">
  //         <Text fontSize="18px" lineHeight="24px" fontWeight="600">
  //           Analyzing your receipt
  //         </Text>
  //         <ProcessingIcon width={40} height={40} />
  //       </Flex>
  //     </Box>
  //   );
  // }

  return (
    <Box borderRadius={20} background="white" minH="120px" p={4}>
      <Flex justifyContent="space-between">
        <Box>
          <Text fontSize="18px" lineHeight="24px" fontWeight="600">
            {receipt.drinkName}
          </Text>
          <Text fontSize="18px" lineHeight="24px" fontWeight="600">
            {receipt.drinkCapacity} * {receipt.drinkAmount}
          </Text>
        </Box>
        <SuccessIcon width={40} height={40} />
      </Flex>
      <Flex justifyContent="space-between" mt={4} alignItems="end">
        <Box display="flex" alignItems="center" gap={1}>
          <BottleIcon />
          <Text fontSize="24px" lineHeight="24px" fontWeight="600">
            {receipt.points} POINTS
          </Text>
        </Box>
        <Text fontSize="14px" lineHeight="14px" fontWeight="400">
          {dayjs(receipt.receiptUploadTime).format("DD/MM/YYYY HH:mm")}
        </Text>
      </Flex>
    </Box>
  );
}
