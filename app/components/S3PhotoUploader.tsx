"use client";

import React, { useState, useEffect } from "react";
import { Box, Text, Flex, useToast, Progress, Spinner } from "@chakra-ui/react";
import { WebcamCaptureModal } from "./WebcamCapture";

interface PhotoUploaderProps {
  onImageSelected: (fileUrl: string, fileKey: string) => void;
  initialValue?: string;
}

const S3PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onImageSelected,
  initialValue,
}) => {
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    initialValue
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();
  const [isCameraOpen, setIsCameraOpen] = useState(true);

  // Auto-open camera when no preview image is available
  useEffect(() => {
    if (!previewImage) {
      setIsCameraOpen(true);
    }
  }, [previewImage]);

  const closeCamera = () => setIsCameraOpen(false);

  const handleCapturedImage = (imageData: string) => {
    setPreviewImage(imageData);

    // Convert base64 image to File object
    fetch(imageData)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "camera_capture.jpg", {
          type: "image/jpeg",
        });
        uploadViaServer(file);
      })
      .catch((error) => {
        console.error("Image conversion failed:", error);
        toast({
          title: "Image processing failed",
          status: "error",
          duration: 3000,
        });
      });
  };

  const uploadViaServer = async (file: File) => {
    try {
      setIsUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      // Upload to server
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Server upload failed");
      }

      const { fileUrl, fileKey } = await response.json();
      setPreviewImage(fileUrl);
      onImageSelected(fileUrl, fileKey);
      setUploadProgress(100);

      toast({
        title: "Upload successful",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box>
      <Flex
        direction="column"
        align="center"
        justify="center"
        p={4}
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="gray.300"
        borderRadius="md"
        bg="gray.50"
        minH="200px"
        position="relative"
      >
        {isUploading && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(255, 255, 255, 0.8)"
            zIndex="2"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner size="xl" mb={4} color="primary.500" />
            <Text mb={2}>Uploading photo...</Text>
            <Box w="80%" maxW="300px">
              <Progress
                value={uploadProgress}
                size="sm"
                colorScheme="primary"
                borderRadius="full"
              />
            </Box>
          </Box>
        )}

        {previewImage ? (
          <Box position="relative" w="100%">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Preview"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "300px",
                objectFit: "contain",
                borderRadius: "4px",
              }}
            />
          </Box>
        ) : (
          <Text color="gray.500">
            Camera not open. Click retake to open camera.
          </Text>
        )}
      </Flex>

      {previewImage && (
        <Flex mt={4} justify="center">
          <Box
            as="button"
            onClick={() => setIsCameraOpen(true)}
            py={2}
            px={4}
            borderRadius="md"
            bg="gray.200"
            _hover={{ bg: "gray.300" }}
            _active={{ bg: "gray.400" }}
          >
            Retake
          </Box>
        </Flex>
      )}

      <WebcamCaptureModal
        isOpen={isCameraOpen}
        onClose={closeCamera}
        onCapture={handleCapturedImage}
      />
    </Box>
  );
};

export default S3PhotoUploader;
