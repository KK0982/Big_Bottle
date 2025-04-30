"use client";

import React, { useState } from "react";
import {
  Box,
  Heading,
  Button,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  useDisclosure,
} from "@chakra-ui/react";
import MobileLayout from "../components/MobileLayout";
import { useUploadReceipt } from "../hooks/use-upload-receipt";
import { PhotoCapture } from "../components/PhotoCapture";
import { S3PhotoProvider, useS3Photo } from "../contexts/S3PhotoContext";
import { WebCamera } from "../components/WebCamera";

function AddReceiptContent() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  // Photo capture handler
  const handleCapture = (file: File) => {
    capturePhoto(file);
    onClose();
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
          onClick={onOpen}
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

      {/* Camera Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        motionPreset="slideInBottom"
        isCentered={false}
      >
        <ModalOverlay />
        <ModalContent
          margin={0}
          borderRadius={0}
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          height="100%"
          width="100%"
          overflow="hidden"
        >
          <WebCamera onPhotoCapture={handleCapture} onClose={onClose} />
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
