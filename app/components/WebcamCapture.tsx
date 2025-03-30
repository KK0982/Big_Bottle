import React, { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  Box,
  Button,
  Flex,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
} from "@chakra-ui/react";
import { ChevronLeftIcon, RepeatIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
  returnToHome?: boolean;
}

export function WebcamCapture({
  onCapture,
  onClose,
  isOpen = true,
  returnToHome = false,
}: WebcamCaptureProps) {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const toast = useToast();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    } else {
      toast({
        title: "Capture failed",
        description: "Unable to take photo, please try again",
        status: "error",
        duration: 3000,
      });
    }
  }, [toast]);

  const retake = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const confirmImage = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      if (onClose) onClose();
    }
  }, [capturedImage, onCapture, onClose]);

  const handleClose = useCallback(() => {
    if (returnToHome) {
      router.push("/");
    } else if (onClose) {
      onClose();
    }
  }, [onClose, returnToHome, router]);

  if (!isOpen) return null;

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode,
  };

  return (
    <Box position="relative" height="100%" width="100%" bg="black">
      {!capturedImage ? (
        // Camera interface
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            width="100%"
            height="100%"
            style={{
              objectFit: "cover",
              position: "absolute",
              left: 0,
              top: 0,
            }}
          />
          {/* Top action area */}
          <Box
            position="absolute"
            top="0"
            left="0"
            p={4}
            width="100%"
            zIndex={2}
            bg="linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)"
          >
            <IconButton
              aria-label="Close"
              icon={<ChevronLeftIcon boxSize="24px" />}
              onClick={handleClose}
              color="white"
              bg="transparent"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
              borderRadius="full"
              size="lg"
            />
          </Box>

          {/* Bottom action area with safe-area-bottom */}
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            py={8}
            pb={12}
            paddingBottom="calc(var(--safe-area-bottom, 0px) + 3rem)"
            bg="linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)"
            zIndex={2}
          >
            <Flex
              justify="space-between"
              align="center"
              width="100%"
              px={8}
              maxWidth="500px"
              mx="auto"
            >
              <Box width="50px" />

              {/* Capture button */}
              <Box
                as="button"
                onClick={capture}
                width="80px"
                height="80px"
                borderRadius="full"
                bg="white"
                position="relative"
                transition="all 0.2s"
                _hover={{ transform: "scale(1.05)" }}
                _active={{ transform: "scale(0.95)" }}
              >
                <Box
                  position="absolute"
                  top="6px"
                  left="6px"
                  right="6px"
                  bottom="6px"
                  borderRadius="full"
                  border="2px solid rgba(0,0,0,0.1)"
                />
              </Box>

              {/* Switch camera button */}
              <IconButton
                aria-label="Switch camera"
                icon={<RepeatIcon boxSize="24px" />}
                onClick={toggleCamera}
                color="white"
                bg="rgba(255,255,255,0.2)"
                _hover={{ bg: "rgba(255,255,255,0.3)" }}
                size="lg"
                borderRadius="full"
              />
            </Flex>
          </Box>
        </>
      ) : (
        // Preview interface
        <>
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="black"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImage}
              alt="Captured photo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
          </Box>

          {/* Preview top area */}
          <Box
            position="absolute"
            top="0"
            left="0"
            p={4}
            width="100%"
            zIndex={2}
            bg="linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)"
          >
            <IconButton
              aria-label="Back"
              icon={<ChevronLeftIcon boxSize="24px" />}
              onClick={returnToHome ? handleClose : retake}
              color="white"
              bg="transparent"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
              borderRadius="full"
              size="lg"
            />
          </Box>

          {/* Preview bottom action area with safe-area-bottom */}
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            py={8}
            paddingBottom="calc(var(--safe-area-bottom, 0px) + 3rem)"
            bg="linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)"
            zIndex={2}
          >
            <Flex
              justify="space-between"
              align="center"
              width="100%"
              px={8}
              maxWidth="500px"
              mx="auto"
            >
              <Button
                onClick={returnToHome ? handleClose : retake}
                color="white"
                bg="rgba(255,255,255,0.2)"
                _hover={{ bg: "rgba(255,255,255,0.3)" }}
                borderRadius="full"
                height="56px"
                minWidth="120px"
                fontSize="18px"
              >
                {returnToHome ? "Cancel" : "Retake"}
              </Button>

              <Button
                onClick={confirmImage}
                color="white"
                bg="primary.500"
                _hover={{ bg: "primary.600" }}
                borderRadius="full"
                height="56px"
                minWidth="120px"
                fontSize="18px"
              >
                Use Photo
              </Button>
            </Flex>
          </Box>
        </>
      )}
    </Box>
  );
}

// Modal version
export function WebcamCaptureModal({
  onCapture,
  isOpen = false,
  onClose,
  returnToHome = false,
}: WebcamCaptureProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose || (() => {})}
      size="full"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="black" />
      <ModalContent
        height="100vh"
        margin={0}
        borderRadius={0}
        bg="black"
        sx={{
          // Support for iOS safe areas
          "--safe-area-top": "env(safe-area-inset-top, 0px)",
          "--safe-area-bottom": "env(safe-area-inset-bottom, 0px)",
          paddingTop: "var(--safe-area-top)",
        }}
      >
        <WebcamCapture
          onCapture={onCapture}
          onClose={onClose}
          returnToHome={returnToHome}
        />
      </ModalContent>
    </Modal>
  );
}
