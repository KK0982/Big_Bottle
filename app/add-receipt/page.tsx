"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Heading,
  Button,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
} from "@chakra-ui/react";
import MobileLayout from "../components/MobileLayout";
import { useUploadReceipt } from "../hooks/use-upload-receipt";
import { PhotoCapture } from "../components/PhotoCapture";
import { S3PhotoProvider, useS3Photo } from "../contexts/S3PhotoContext";
import { WebCamera } from "../components/WebCamera";
import imageCompression from "browser-image-compression";

function AddReceiptContent() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isWebCameraOpen, setIsWebCameraOpen] = useState(false);
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

  // Handle file selection from native camera
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Compress image before processing
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      // Create proper file with name
      const finalFile = new File([compressedFile], `photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      capturePhoto(finalFile);
    } catch (error) {
      console.error("Image processing failed:", error);
      toast({
        title: "Image processing failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle web camera photo capture
  const handleWebCameraCapture = (file: File) => {
    capturePhoto(file);
    setIsWebCameraOpen(false);
  };

  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleWebCameraClick = () => {
    setIsWebCameraOpen(true);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!photoFile && !serverUrl) {
      toast({
        title: "Please take a photo first",
        status: "warning",
        duration: 3000,
        position: "top",
      });
      return;
    }

    // If serverUrl exists, photo has already been uploaded, submit directly
    if (serverUrl) {
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
        flexDirection="column"
        gap={3}
        pb={{ base: "env(safe-area-inset-bottom, 16px)", md: 6 }}
      >
        <Box display="flex" gap={3}>
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
            colorScheme="green"
            variant="outline"
            borderWidth="2px"
            size="lg"
            leftIcon={<span className="fa fa-video" />}
            onClick={handleWebCameraClick}
          >
            Web Camera
          </Button>
        </Box>

        <Button
          w="100%"
          minH="54px"
          borderRadius="20px"
          colorScheme="primary"
          size="lg"
          isLoading={isPending || isUploading}
          loadingText={isUploading ? "Uploading..." : "Submitting..."}
          onClick={handleSubmit}
          isDisabled={!photoFile && !serverUrl}
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

      {/* Web Camera Modal */}
      <Modal
        isOpen={isWebCameraOpen}
        onClose={() => setIsWebCameraOpen(false)}
        size="full"
      >
        <ModalOverlay />
        <ModalContent>
          <WebCamera
            onPhotoCapture={handleWebCameraCapture}
            onClose={() => setIsWebCameraOpen(false)}
          />
        </ModalContent>
      </Modal>
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
