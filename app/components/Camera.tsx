"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Box, Button, Flex, VStack, Text, Icon } from "@chakra-ui/react";
import FA from "react-fontawesome";

// 添加全局变量检查
const isImageCaptureSupported =
  typeof window !== "undefined" && "ImageCapture" in window;

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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  // 使用图像捕获API（添加类型安全性）
  const imageCapture = useRef<any>(null);

  // Open camera
  const openCamera = useCallback(async () => {
    setCameraError(null);
    setIsInitializing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();

          // 初始化 ImageCapture (仅在支持的浏览器)
          if (
            isImageCaptureSupported &&
            videoRef.current &&
            videoRef.current.srcObject
          ) {
            const track = (
              videoRef.current.srcObject as MediaStream
            ).getVideoTracks()[0];
            if (track) {
              // 使用类型断言
              const ImageCaptureApi = (window as any).ImageCapture;
              imageCapture.current = new ImageCaptureApi(track);
            }
          }

          setIsInitializing(false);
        };
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error("摄像头访问失败:", error);
      setCameraError(error instanceof Error ? error.message : "无法访问摄像头");
      setIsInitializing(false);
      setIsCameraOpen(false);
    }
  }, [facingMode]);

  // 修改拍照函数添加兼容性检查
  const takePhoto = async () => {
    if (isImageCaptureSupported && imageCapture.current) {
      try {
        const blob = await imageCapture.current.takePhoto();
        const url = URL.createObjectURL(blob);
        setCapturedImage(url);
      } catch (error) {
        console.error("ImageCapture API 拍照失败:", error);
        // 回退到 canvas 方法
        captureFromVideo();
      }
    } else {
      // 不支持 ImageCapture，使用 canvas 回退
      captureFromVideo();
    }
  };

  // 原来的 canvas 捕获方法作为回退
  const captureFromVideo = () => {
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
  };

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

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      // Close current camera
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());

      // Toggle camera mode
      setFacingMode((prev) => (prev === "user" ? "environment" : "user"));

      // Reopen camera
      openCamera();
    }
  }, [openCamera]);

  // Clean up resources when component unmounts
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 在组件加载时检查权限
  useEffect(() => {
    async function checkPermissions() {
      try {
        // 检查权限状态
        const permissions = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });

        if (permissions.state === "denied") {
          setCameraError("摄像头访问被拒绝。请在浏览器设置中允许访问摄像头。");
        }
      } catch (error) {
        console.log("权限检查不支持，将尝试直接打开摄像头");
      }
    }

    checkPermissions();
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
        <Box
          position="relative"
          width="100%"
          height="100%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          {isInitializing && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="rgba(0, 0, 0, 0.7)"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={10}
            >
              <Text>正在初始化摄像头...</Text>
            </Box>
          )}
          {cameraError && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="rgba(255, 0, 0, 0.1)"
              color="white"
              padding="20px"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              zIndex={10}
            >
              <Text mb={4}>摄像头错误: {cameraError}</Text>
              <Button onClick={openCamera}>重试</Button>
            </Box>
          )}
          <Box
            as="video"
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width="100%"
            height="auto"
            maxHeight="80vh"
            sx={{ objectFit: "cover" }}
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
              onClick={takePhoto}
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
