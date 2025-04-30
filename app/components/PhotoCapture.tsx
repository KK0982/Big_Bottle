"use client";

import React from "react";
import { Box, Text, Flex, Progress, Spinner } from "@chakra-ui/react";
import { useS3Photo } from "../contexts/S3PhotoContext";

interface PhotoCaptureProps {
  onImageSelected?: (fileUrl: string, fileKey: string) => void;
}

export function PhotoCapture({ onImageSelected }: PhotoCaptureProps) {
  const {
    photoUrl,
    photoKey,
    serverUrl,
    isUploading,
    uploadProgress,
    uploadError,
  } = useS3Photo();

  // Notify parent component when both server URL and key exist
  React.useEffect(() => {
    if (serverUrl && photoKey && onImageSelected) {
      onImageSelected(serverUrl, photoKey);
    }
  }, [serverUrl, photoKey, onImageSelected]);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p={4}
      borderRadius="20px"
      bg="white"
      minH="400px"
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

      {uploadError && (
        <Box mb={4} p={3} bg="red.50" color="red.500" borderRadius="md">
          <Text>Upload error: {uploadError}</Text>
        </Box>
      )}

      {photoUrl ? (
        <Box
          position="relative"
          w="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
          maxH="350px"
        >
          <img
            src={photoUrl}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "350px",
              objectFit: "contain",
              borderRadius: "4px",
            }}
          />
        </Box>
      ) : (
        <Text color="gray.500">
          Click the &quot;Take Photo&quot; button to capture a receipt
        </Text>
      )}
    </Flex>
  );
}
