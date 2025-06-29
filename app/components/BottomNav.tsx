"use client";

import React from "react";
import { Box, Flex, Text, IconButton } from "@chakra-ui/react";
import { useRouter, usePathname } from "next/navigation";

const HomeIcon = ({ isActive }: { isActive: boolean }) => (
   <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fill="#000"
      fillOpacity={0.5}
      d="M12.75 1.25c.866 0 1.64.277 2.476.746.81.455 1.738 1.126 2.905 1.97l1.509 1.09c.937.677 1.685 1.218 2.249 1.718.583.517 1.018 1.033 1.295 1.681.277.65.344 1.315.307 2.083-.036.74-.174 1.635-.345 2.75l-.315 2.05c-.243 1.584-.438 2.846-.722 3.828-.295 1.016-.71 1.823-1.45 2.44-.738.613-1.618.887-2.692 1.017-1.045.127-2.363.127-4.028.127H11.56c-1.665 0-2.983 0-4.027-.127-1.075-.13-1.955-.404-2.693-1.018-.741-.616-1.156-1.423-1.45-2.439-.285-.982-.478-2.244-.722-3.827l-.315-2.052c-.171-1.114-.309-2.008-.345-2.749-.037-.768.03-1.433.308-2.083.276-.648.711-1.164 1.294-1.68.564-.501 1.313-1.042 2.25-1.72l1.508-1.09.833-.6c.79-.566 1.464-1.028 2.072-1.369.836-.469 1.61-.746 2.476-.746Zm3.592 15.29a.75.75 0 0 0-1.053-.132c-.665.518-1.552.842-2.539.842-.986 0-1.873-.324-2.539-.842a.75.75 0 0 0-.922 1.184c.934.727 2.147 1.158 3.461 1.158s2.528-.431 3.461-1.158a.75.75 0 0 0 .131-1.053Z"
    />
  </svg>
);

const StakingIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    viewBox="0 0 24 24"
    height={24}
    fill="none"
  >
    <path
      fill="#01E35C"
      d="M13.25 1.25c2.1 0 3.751-.001 5.038.172 1.308.176 2.352.545 3.174 1.366.821.822 1.19 1.866 1.366 3.174C23.001 7.249 23 8.9 23 11s.001 3.751-.172 5.038c-.176 1.308-.545 2.352-1.366 3.174-.667.666-1.48 1.032-2.462 1.241V22a.75.75 0 0 1-1.5 0v-1.343c-1.154.09-2.556.093-4.25.093h-2c-1.694 0-3.096-.002-4.25-.093V22a.75.75 0 0 1-1.5 0v-1.547c-.982-.21-1.795-.575-2.462-1.241-.821-.822-1.19-1.866-1.366-3.174C1.499 14.751 1.5 13.1 1.5 11s-.001-3.751.172-5.038c.176-1.308.545-2.352 1.366-3.174.822-.821 1.866-1.19 3.174-1.366 1.287-.173 2.938-.172 5.038-.172h2ZM7.912 6.648a.75.75 0 0 0-1.014-.31c-.692.368-1.074.89-1.25 1.583-.153.605-.148 1.357-.148 2.173v1.812c0 .816-.005 1.568.148 2.173.154.606.465 1.083 1.005 1.439l.245.144.07.033a.75.75 0 0 0 .7-1.318l-.066-.04-.107-.06c-.23-.146-.328-.308-.393-.566-.097-.382-.102-.912-.102-1.805v-1.812c0-.893.005-1.423.102-1.805.074-.295.193-.464.5-.627a.75.75 0 0 0 .31-1.014ZM15.25 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"
    />
  </svg>
);

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: HomeIcon,
    },
    {
      label: "Staking",
      path: "/staking",
      icon: StakingIcon,
    },
  ];

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg="rgba(255, 255, 255, 0.9)"
      backdropFilter="blur(10px)"
      borderTop="1px solid rgba(0, 0, 0, 0.1)"
      zIndex={1000}
      pb="env(safe-area-inset-bottom)"
    >
      <Flex
        justifyContent="space-around"
        alignItems="center"
        py="8px"
        px="16px"
        height="60px"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const IconComponent = item.icon;

          return (
            <Flex
              key={item.path}
              direction="column"
              alignItems="center"
              cursor="pointer"
              onClick={() => handleNavigation(item.path)}
              flex="1"
              gap="2px"
            >
              <IconComponent isActive={isActive} />
              <Text
                fontSize="10px"
                fontFamily="Roboto"
                fontWeight="400"
                color={isActive ? "#01E35C" : "rgba(0, 0, 0, 0.5)"}
                lineHeight="14px"
              >
                {item.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

export default BottomNav;
