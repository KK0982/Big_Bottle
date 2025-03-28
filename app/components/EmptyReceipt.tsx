import { Box, Text } from "@chakra-ui/react";

export function EmptyReceipt() {
  return (
    <Box
      mt={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      borderRadius="20px"
      backgroundColor="white"
      minHeight="120px"
      p="24px"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={48}
        height={48}
        fill="none"
      >
        <path
          fill="#C4C4C4"
          d="M30.492 9.846C33.732 15.788 36 20.755 36 27.554V36c0 6.619-1.507 8-8.727 8h-6.546C13.507 44 12 42.619 12 36v-8.446c0-6.8 2.213-11.783 5.454-17.725"
        />
        <path
          fill="#C4C4C4"
          d="M32.727 7c0 1.657-1.465 3-3.272 3h-10.91c-1.807 0-3.272-1.343-3.272-3s1.465-3 3.272-3h10.91c1.807 0 3.272 1.343 3.272 3Z"
        />
      </svg>

      <Text
        fontSize="14px"
        lineHeight="20px"
        fontWeight="400"
        color="rgba(0, 0, 0, 0.5)"
      >
        You don&apos;t have a receipt at present. Upload your drink receipt to
        earn points!
      </Text>
    </Box>
  );
}
