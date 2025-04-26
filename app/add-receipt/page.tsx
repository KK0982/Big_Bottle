"use client";

import React, { useState } from "react";
import { Box, Heading, Button, VStack, useToast } from "@chakra-ui/react";
import MobileLayout from "../components/MobileLayout";
import S3PhotoUploader from "../components/S3PhotoUploader";
import { useUploadReceipt } from "../hooks/use-upload-receipt";

export default function AddReceiptPage() {
  const toast = useToast();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const { mutate: uploadReceipt, isPending } = useUploadReceipt();
  const [isCameraOpen, setIsCameraOpen] = useState(true);

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

  const handleRetake = () => {
    setIsCameraOpen(true);
  };

  return (
    <MobileLayout title="Add Receipt">
      <Box display="flex" flexDirection="column" gap={4}>
        <Heading fontSize="24px" lineHeight="36px" fontWeight="600" mb={3}>
          Upload Bottle Receipt
        </Heading>
        <VStack spacing={6} align="stretch" flex={1}>
          <S3PhotoUploader
            onImageSelected={handleImageSelected}
            isCameraOpen={isCameraOpen}
            setIsCameraOpen={setIsCameraOpen}
          />
        </VStack>
        <Box py={6} display="flex" justifyContent="space-between" gap={3}>
          <Button
            flex={1}
            minH="54px"
            borderRadius="20px"
            colorScheme="primary"
            variant="outline"
            borderWidth="2px"
            size="lg"
            onClick={handleRetake}
          >
            Retake
          </Button>
          <Button
            flex={1}
            minH="54px"
            borderRadius="20px"
            colorScheme="primary"
            size="lg"
            isLoading={isPending}
            loadingText="Submitting..."
            onClick={handleSubmit}
            isDisabled={!imageUrl}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </MobileLayout>
  );
}
