import { Box, CloseButton, Text } from "@chakra-ui/react";

interface DistributeProps {
  onClose: () => void;
}

export function Distribute({ onClose }: DistributeProps) {
  return (
    <Box
      backgroundColor="#01E35C33"
      padding="16px 24px"
      display="flex"
      alignItems="center"
      gap="8px"
      justifyContent="center"
      margin="-24px -24px 24px -24px"
    >
      <Text color="#000000" fontSize="14px" lineHeight="20px" fontWeight="400">
        This week’s rewards will be distributed next Tuesday.
      </Text>
      <CloseButton size="sm" onClick={onClose} />
    </Box>
  );
}
