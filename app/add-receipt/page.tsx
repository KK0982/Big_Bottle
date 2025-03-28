"use client";

import React, { useState } from "react";
import { Box, Heading, Button, VStack, useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import MobileLayout from "../components/MobileLayout";
import S3PhotoUploader from "../components/S3PhotoUploader";

export default function AddReceiptPage() {
  const router = useRouter();
  const toast = useToast();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    try {
      // Submit receipt information to backend API
      const response = await fetch("/api/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          imageKey,
          // Other receipt information...
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit receipt information");
      }

      toast({
        title: "Submission Successful",
        description: "Your receipt has been successfully submitted",
        status: "success",
        duration: 3000,
      });

      // Return to homepage after success
      router.push("/");
    } catch (error) {
      console.error("Error submitting receipt information:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again later",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
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
            isLoading={isSubmitting}
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
