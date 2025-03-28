"use client";

import React, { useRef, useState, useCallback } from "react";
import { Box, Button, Flex, VStack, Text, Icon } from "@chakra-ui/react";
import { FaCamera, FaRedo } from "react-icons/fa";

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

  // 打开相机
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // 优先使用后置摄像头
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
      setError("无法访问摄像头，请确保您已授予摄像头访问权限。");
      console.error("摄像头访问错误:", err);
    }
  };

  // 拍照
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // 设置画布尺寸与视频相同
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 在画布上绘制当前视频帧
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 转换为图片数据
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);

        // 关闭摄像头流
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      }
    }
  }, []);

  // 重新拍照
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    openCamera();
  }, []);

  // 确认使用拍摄的照片
  const confirmImage = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      if (onClose) onClose();
    }
  }, [capturedImage, onCapture, onClose]);

  // 组件卸载时清理资源
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
            leftIcon={<Icon as={FaCamera} />}
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
              <Icon as={FaCamera} boxSize="24px" />
            </Button>
          </Flex>
        </Box>
      )}

      {capturedImage && (
        <Box position="relative">
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
              leftIcon={<Icon as={FaRedo} />}
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
