"use client";

import React, { useState, useRef } from "react";
import { Box, Heading, Button, VStack, useToast } from "@chakra-ui/react";
import MobileLayout from "../components/MobileLayout";
import { useUploadReceipt } from "../hooks/use-upload-receipt";
import { PhotoCapture } from "../components/PhotoCapture";
import { S3PhotoProvider, useS3Photo } from "../contexts/S3PhotoContext";
import imageCompression from "browser-image-compression";

function AddReceiptContent() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    photoKey,
    photoFile,
    serverUrl,
    isUploading,
    uploadError,
    uploadPhoto,
    capturePhoto,
  } = useS3Photo();
  const { mutate: uploadReceipt, isPending } = useUploadReceipt();

  // Handle file selection from camera
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Compress image before processing
      const options = {
        maxSizeMB: 1, // Max file size in MB
        maxWidthOrHeight: 1920, // Resize image if larger
        useWebWorker: true, // Use web worker for better performance
        fileType: "image/jpeg", // Output format
      };

      const compressedBlob = await imageCompression(file, options);
      console.log("Original size:", file.size / 1024 / 1024, "MB");
      console.log("Compressed size:", compressedBlob.size / 1024 / 1024, "MB");

      // Create file from compressed blob
      const compressedFile = new File(
        [compressedBlob],
        `photo-${Date.now()}.jpg`,
        {
          type: "image/jpeg",
        }
      );

      capturePhoto(compressedFile);
    } catch (error) {
      console.error("Error processing captured image:", error);
      toast({
        title: "Photo processing failed",
        description: "Please try again",
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  // Open camera
  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!photoFile && !photoKey) {
      toast({
        title: "Please take a photo first",
        status: "warning",
        duration: 3000,
        position: "top",
      });
      return;
    }

    // If photoKey exists, photo has already been uploaded, submit directly
    if (photoKey && serverUrl) {
      uploadReceipt(serverUrl);
      return;
    }

    // Otherwise, upload the photo first, then submit
    const result = await uploadPhoto();
    if (result) {
      toast({
        title: "Photo uploaded successfully",
        status: "success",
        duration: 2000,
        position: "top",
      });
      uploadReceipt(result.fileUrl);
    } else {
      toast({
        title: "Photo upload failed",
        description: uploadError || "Please try again",
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Heading fontSize="24px" lineHeight="36px" fontWeight="600" mb={3}>
        Upload Bottle Receipt
      </Heading>

      <VStack spacing={6} align="stretch" flex={1}>
        <PhotoCapture />
      </VStack>

      <Box
        py={6}
        display="flex"
        justifyContent="space-between"
        gap={3}
        pb={{ base: "env(safe-area-inset-bottom, 16px)", md: 6 }}
      >
        <Button
          flex={1}
          minH="54px"
          borderRadius="20px"
          colorScheme="primary"
          variant="outline"
          borderWidth="2px"
          size="lg"
          leftIcon={<span className="fa fa-camera" />}
          onClick={handleTakePhoto}
        >
          Take Photo
        </Button>
        <Button
          flex={1}
          minH="54px"
          borderRadius="20px"
          colorScheme="primary"
          size="lg"
          isLoading={isPending || isUploading}
          loadingText={isUploading ? "Uploading..." : "Submitting..."}
          onClick={handleSubmit}
          isDisabled={!photoFile && !photoKey}
        >
          Submit
        </Button>
      </Box>

      {/* Hidden file input for camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </Box>
  );
}

export default function AddReceiptPage() {
  return (
    <S3PhotoProvider>
      <MobileLayout title="Add Receipt">
        <AddReceiptContent />
      </MobileLayout>
    </S3PhotoProvider>
  );
}
