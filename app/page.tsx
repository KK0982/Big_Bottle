"use client";

import React from "react";
import MobileLayout from "./components/MobileLayout";
import Image from "next/image";
import { Receipt } from "./components/Receipt";
import { AddReceiptButton } from "./components/AddReceiptButton";

export default function Home() {
  return (
    <MobileLayout title="BigBottle">
      <Image
        src="/images/cover.jpg"
        alt="BigBottle"
        width={500}
        height={500}
        style={{
          width: "100%",
          height: "auto",
          maxHeight: "70vh",
          objectFit: "contain",
        }}
      />
      <Receipt />
      <AddReceiptButton />
    </MobileLayout>
  );
}
