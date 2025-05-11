"use client";

import React, { useEffect } from "react";
import MobileLayout from "./components/MobileLayout";
import { Receipt } from "./components/Receipt";
import { AddReceiptButton } from "./components/AddReceiptButton";
import { Box } from "@chakra-ui/react";
import { useBlacklist } from "./hooks/use-blacklist";
import { BlackList } from "./components/BlackList";

export default function Home() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
          console.log("Service Worker 已注销");
        }
      });
    }
  }, []);

  return (
    <MobileLayout title="BigBottle">
      <BlackList />
      <Box
        width="100%"
        aspectRatio="327/200"
        borderRadius="20px"
        backgroundImage="/images/cover.jpg"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
      />
      <Receipt />
      <AddReceiptButton />
    </MobileLayout>
  );
}
