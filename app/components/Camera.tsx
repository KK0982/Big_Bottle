"use client";

import React, { useRef, useState, useCallback } from "react";
import { Box, Button, Flex, VStack, Text, Icon } from "@chakra-ui/react";
import FA from "react-fontawesome";
interface CameraProps {
  onCapture: (imageData: string) => void;
  onClose?: () => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Open camera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
        setError(null);
      }
    } catch (err) {
      setError(
        "Camera access error, please ensure you have granted camera access."
      );
      console.error("Camera access error:", err);
    }
  };

  // Capture image
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame on canvas
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to image data
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);

        // Close camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      }
    }
  }, []);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    openCamera();
  }, []);

  // Confirm using captured photo
  const confirmImage = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      if (onClose) onClose();
    }
  }, [capturedImage, onCapture, onClose]);

  // Clean up resources when component unmounts
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <Box
      width="100%"
      height="100%"
      bg="white"
      borderRadius="md"
      overflow="hidden"
    >
      {error && (
        <Box p={4} bg="red.50" color="red.500" borderRadius="md" mb={4}>
          <Text>{error}</Text>
        </Box>
      )}

      {!isCameraOpen && !capturedImage && (
        <VStack spacing={4} p={6}>
          <Text>点击下方按钮打开摄像头</Text>
          <Button
            colorScheme="primary"
            leftIcon={<FA name="camera" />}
            onClick={openCamera}
          >
            打开摄像头
          </Button>
        </VStack>
      )}

      {isCameraOpen && !capturedImage && (
        <Box position="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", borderRadius: "8px" }}
          />

          <Flex
            position="absolute"
            bottom="16px"
            left="0"
            right="0"
            justifyContent="center"
          >
            <Button
              size="lg"
              borderRadius="full"
              colorScheme="primary"
              w="64px"
              h="64px"
              onClick={captureImage}
            >
              <Icon as={() => <FA name="camera" />} boxSize="24px" />
            </Button>
          </Flex>
        </Box>
      )}

      {capturedImage && (
        <Box position="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capturedImage}
            alt="Captured"
            style={{ width: "100%", borderRadius: "8px" }}
          />

          <Flex
            position="absolute"
            bottom="16px"
            left="0"
            right="0"
            justifyContent="space-around"
            px={4}
          >
            <Button
              colorScheme="gray"
              leftIcon={<Icon as={() => <FA name="redo" />} />}
              onClick={retakePhoto}
            >
              重拍
            </Button>

            <Button colorScheme="primary" onClick={confirmImage}>
              使用此照片
            </Button>
          </Flex>
        </Box>
      )}

      {/* 隐藏的画布元素，用于捕获图像 */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Box>
  );
};

export default Camera;
