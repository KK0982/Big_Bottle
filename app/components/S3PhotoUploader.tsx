"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Text,
  useDisclosure,
  VStack,
  Image,
  Flex,
  Icon,
  useToast,
  Progress,
} from "@chakra-ui/react";
import { FaCamera, FaUpload, FaTrash } from "react-icons/fa";
import CameraModal from "./CameraModal";

interface PhotoUploaderProps {
  onImageSelected: (fileUrl: string, fileKey: string) => void;
  title?: string;
  description?: string;
}

const S3PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onImageSelected,
  title = "Upload Photo",
  description = "Please take or upload a bottle photo",
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Handle camera capture result
  const handleCapturedImage = (imageData: string) => {
    setPreviewImage(imageData);

    // Convert base64 to File object
    fetch(imageData)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "camera_capture.jpg", {
          type: "image/jpeg",
        });
        uploadViaServer(file);
      });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };

      reader.readAsDataURL(file);
      uploadViaServer(file);
    }
  };

  // Trigger file selection dialog
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clear selected image
  const handleClear = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadViaServer = async (file: File) => {
    try {
      setIsUploading(true);

      // 创建 FormData 对象
      const formData = new FormData();
      formData.append("file", file);

      // 更新进度的函数
      const updateProgress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      };

      // 使用服务器端端点上传
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        // 不能直接设置 onUploadProgress，使用 XHR 代替
      });

      if (!response.ok) {
        throw new Error("Server upload failed");
      }

      const { fileUrl, fileKey } = await response.json();
      setPreviewImage(fileUrl);
      onImageSelected(fileUrl, fileKey);

      toast({
        title: "Upload successful",
        status: "success",
        duration: 2000,
      });

      return fileUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="md" p={4} bg="white">
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">
          {title}
        </Text>

        {!previewImage ? (
          <>
            <Text fontSize="sm" color="gray.500">
              {description}
            </Text>

            <Flex gap={2}>
              <Button
                flex={1}
                leftIcon={<Icon as={FaCamera} />}
                colorScheme="primary"
                onClick={onOpen}
                isDisabled={isUploading}
              >
                Take Photo
              </Button>

              <Button
                flex={1}
                leftIcon={<Icon as={FaUpload} />}
                variant="outline"
                colorScheme="primary"
                onClick={handleUploadClick}
                isDisabled={isUploading}
              >
                Upload
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </Flex>
          </>
        ) : (
          <Box position="relative">
            <Image
              src={previewImage}
              alt="Preview"
              borderRadius="md"
              maxH="200px"
              mx="auto"
            />

            <Button
              position="absolute"
              bottom="8px"
              right="8px"
              colorScheme="red"
              size="sm"
              onClick={handleClear}
              isDisabled={isUploading}
            >
              <Icon as={FaTrash} />
            </Button>
          </Box>
        )}

        {isUploading && (
          <Box mt={2}>
            <Text fontSize="sm" mb={1}>
              Uploading... {uploadProgress}%
            </Text>
            <Progress value={uploadProgress} size="sm" colorScheme="primary" />
          </Box>
        )}
      </VStack>

      <CameraModal
        isOpen={isOpen}
        onClose={onClose}
        onCapture={handleCapturedImage}
      />
    </Box>
  );
};

export default S3PhotoUploader;
