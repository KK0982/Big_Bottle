"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import theme from "../../chakra-theme";

export function ChakraProviders({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </>
  );
}
