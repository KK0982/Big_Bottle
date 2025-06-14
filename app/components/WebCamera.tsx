"use client";

import React, { useRef, useCallback, useState } from "react";
import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import Webcam from "react-webcam";
import imageCompression from "browser-image-compression";
import { IoArrowBack, IoCamera } from "react-icons/io5";

interface WebCameraProps {
  onPhotoCapture: (file: File) => void;
  onClose?: () => void;
}

export function WebCamera({ onPhotoCapture, onClose }: WebCameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;

    setIsCapturing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // Convert base64 to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(blob as File, options);

      // Create proper file with name
      const file = new File([compressedFile], `photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      onPhotoCapture(file);
    } catch (error) {
      console.error("Photo capture failed:", error);
    } finally {
      setIsCapturing(false);
    }
  }, [onPhotoCapture]);

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      bg="black"
      zIndex="9999"
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        p="16px"
        color="white"
        bg="rgba(0,0,0,0.7)"
        position="relative"
        zIndex="1"
      >
        <IconButton
          aria-label="Close camera"
          icon={<IoArrowBack />}
          variant="ghost"
          color="white"
          onClick={onClose}
        />
        <Text fontSize="18px" fontWeight="600">
          Web Camera
        </Text>
        <Box width="40px" />
      </Flex>

      {/* Camera */}
      <Box flex="1" position="relative">
        <Webcam
          ref={webcamRef}
          audio={false}
          width="100%"
          height="100%"
          screenshotFormat="image/jpeg"
          screenshotQuality={0.8}
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "environment",
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* Controls */}
      <Box p="24px" bg="rgba(0,0,0,0.7)" display="flex" justifyContent="center">
        <Button
          onClick={capture}
          isLoading={isCapturing}
          loadingText="Taking photo..."
          leftIcon={<IoCamera />}
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          px="32px"
        >
          Take Photo
        </Button>
      </Box>
    </Box>
  );
}
