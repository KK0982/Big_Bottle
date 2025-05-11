import { Box, Link, Text } from "@chakra-ui/react";
import { useBlacklist } from "../hooks/use-blacklist";

export function BlackList() {
  const { data: isBlacklisted } = useBlacklist();

  if (isBlacklisted) {
    return (
      <Box
        backgroundColor="#FF4E5933"
        padding="16px 24px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        margin="-24px -24px 24px -24px"
      >
        <Text
          color="#FF4E59"
          fontSize="14px"
          lineHeight="20px"
          fontWeight="400"
        >
          You have been restricted from using the system. We apologize for any
          inconvenience this may cause. If you wish to appeal, please contact us
          via our X account:&nbsp;
          <Link href="https://x.com/bigbottle_vet" target="_blank">
            @bigbottle_vet
          </Link>
          .
        </Text>
      </Box>
    );
  }

  return null;
}
