"use client";

import React, { useState } from "react";
import { Box, Heading, Button, VStack, useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";
import S3PhotoUploader from "../components/S3PhotoUploader";
import { useUploadReceipt } from "../hooks/use-upload-receipt";

export default function AddReceiptPage() {
  const router = useRouter();
  const toast = useToast();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const { mutate: uploadReceipt, isPending } = useUploadReceipt();

  const handleImageSelected = (fileUrl: string, fileKey: string) => {
    setImageUrl(fileUrl);
    setImageKey(fileKey);
  };

  const handleSubmit = async () => {
    if (!imageUrl || !imageKey) {
      toast({
        title: "Please upload a photo first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    uploadReceipt(imageUrl);
  };

  return (
    <MobileLayout title="Add Receipt">
      <Box my={4}>
        <Heading size="lg" mb={6}>
          Upload Bottle Photo
        </Heading>

        <VStack spacing={6} align="stretch">
          <S3PhotoUploader
            onImageSelected={handleImageSelected}
            title="Bottle Photo"
            description="Please take or upload a bottle photo. Make sure the barcode is clearly visible."
          />

          <Button
            colorScheme="primary"
            size="lg"
            isLoading={isPending}
            loadingText="Submitting..."
            onClick={handleSubmit}
            isDisabled={!imageUrl}
          >
            Submit
          </Button>
        </VStack>
      </Box>
    </MobileLayout>
  );
}
