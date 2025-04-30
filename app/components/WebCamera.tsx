"use client";

import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import imageCompression from "browser-image-compression";
import { IoArrowBack } from "react-icons/io5";

interface WebCameraProps {
  onPhotoCapture: (file: File) => void;
  onClose?: () => void;
}

export function WebCamera({ onPhotoCapture, onClose }: WebCameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle camera initialization
  const handleUserMedia = useCallback(() => {
    setIsCameraReady(true);
    setError(null);
  }, []);

  // Handle camera errors
  const handleUserMediaError = useCallback((error: string | DOMException) => {
    setIsCameraReady(false);
    setError(typeof error === "string" ? error : error.message);
    console.error("Webcam error:", error);
  }, []);

  // Capture photo from webcam
  const capturePhoto = useCallback(async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      // Convert base64 to blob
      const base64Data = imageSrc.split(",")[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(
        (res) => res.blob()
      );

      // Create a File from Blob to use with imageCompression
      const tempFile = new File([blob], `temp-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Compress image before converting to file
      const options = {
        maxSizeMB: 1, // Max file size in MB
        maxWidthOrHeight: 1920, // Resize image if larger
        useWebWorker: true, // Use web worker for better performance
        fileType: "image/jpeg", // Output format
      };

      const compressedBlob = await imageCompression(tempFile, options);
      console.log("Original size:", blob.size / 1024 / 1024, "MB");
      console.log("Compressed size:", compressedBlob.size / 1024 / 1024, "MB");

      // Create file from compressed blob
      const file = new File([compressedBlob], `photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      onPhotoCapture(file);
    } catch (error) {
      console.error("Error processing captured image:", error);
    }
  }, [onPhotoCapture]);

  return (
    <Flex
      direction="column"
      bg="black"
      width="100%"
      height="100vh"
      position="relative"
      overflow="hidden"
    >
      {/* Header with back button */}
      <Flex
        justify="flex-start"
        align="center"
        p={3}
        bg="blackAlpha.800"
        color="white"
        w="100%"
        position="absolute"
        top={0}
        left={0}
        zIndex={10}
      >
        {onClose && (
          <IconButton
            aria-label="Go back"
            icon={<IoArrowBack size={24} color="white" />}
            variant="solid"
            bg="rgba(255, 255, 255, 0.2)"
            borderRadius="full"
            size="md"
            onClick={onClose}
            _hover={{ bg: "rgba(255, 255, 255, 0.3)" }}
          />
        )}
      </Flex>

      {error ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          p={6}
          bg="red.50"
          color="red.500"
          flex={1}
        >
          <Text mb={2} fontWeight="bold">
            Camera Error
          </Text>
          <Text textAlign="center">{error}</Text>
          <Text mt={4} fontSize="sm">
            Please ensure you have granted camera permissions and no other
            application is using your camera.
          </Text>
          {onClose && (
            <Button mt={4} colorScheme="red" onClick={onClose}>
              Close
            </Button>
          )}
        </Flex>
      ) : (
        <>
          {/* Camera View */}
          <Box
            pt="50px"
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: "environment", // Use back camera if available
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              }}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: isCameraReady ? "block" : "none",
              }}
            />
          </Box>

          {/* Footer with capture button */}
          <Flex
            justify="center"
            p={6}
            mb={4}
            bg="blackAlpha.800"
            pb="calc(env(safe-area-inset-bottom, 16px) + 24px)"
            position="relative"
          >
            <Button
              onClick={capturePhoto}
              colorScheme="primary"
              size="lg"
              borderRadius="full"
              isDisabled={!isCameraReady}
              width="70px"
              height="70px"
              p={0}
              _hover={{ transform: "scale(1.05)" }}
              _active={{ transform: "scale(0.95)" }}
              transition="all 0.2s"
            >
              <Box
                width="62px"
                height="62px"
                borderRadius="full"
                border="3px solid white"
              />
            </Button>
          </Flex>
        </>
      )}
    </Flex>
  );
}
