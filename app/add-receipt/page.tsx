"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Button,
  VStack,
  useToast,
  Text,
  Flex,
  Badge,
} from "@chakra-ui/react";
import MobileLayout from "../components/MobileLayout";
import { useUploadReceipt } from "../hooks/use-upload-receipt";
import { PhotoCapture } from "../components/PhotoCapture";
import { S3PhotoProvider, useS3Photo } from "../contexts/S3PhotoContext";
import { PhotoInput } from "../components/PhotoInput";

function AddReceiptContent() {
  const toast = useToast();
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
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Request location permission on page load
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          toast({
            title: "Geolocation not supported",
            description: "Your browser doesn't support geolocation.",
            status: "warning",
            duration: 5000,
            position: "top",
          });
          setLocationPermission("denied");
          return;
        }

        // Request permission through the Permissions API if available
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({
            name: "geolocation",
          });
          setLocationPermission(
            permissionStatus.state as "granted" | "denied" | "prompt"
          );

          // Listen for permission changes
          permissionStatus.addEventListener("change", () => {
            setLocationPermission(
              permissionStatus.state as "granted" | "denied" | "prompt"
            );
          });
        }

        // Try to get current position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLocationPermission("granted");
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationPermission("denied");

            // Don't show toast on initial load to avoid overwhelming the user
            // Will show when they try to take a photo
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } catch (error) {
        console.error("Location permission error:", error);
        setLocationPermission("denied");
      }
    };

    requestLocationPermission();
  }, [toast]);

  // Photo capture handler
  const handleCapture = (file: File) => {
    // Check location permission before capturing
    if (locationPermission === "granted" && userLocation) {
      capturePhoto(file, userLocation);
    } else {
      // If permission denied, show toast and request again
      toast({
        title: "Location access required",
        description:
          "Please enable location access to take photos for receipt verification.",
        status: "error",
        duration: 5000,
        position: "top",
        isClosable: true,
      });

      // Try to get permission again
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setLocationPermission("granted");

          // Now that we have permission, capture the photo with location
          capturePhoto(file, newLocation);
        },
        (error) => {
          console.error("Still can't get location:", error);
          setLocationPermission("denied");
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Handle photo click when location permission is denied
  const handlePhotoClick = () => {
    if (locationPermission !== "granted") {
      toast({
        title: "Location access required",
        description:
          "Please enable location access in your browser settings to continue.",
        status: "warning",
        duration: 5000,
        position: "top",
        isClosable: true,
      });
      return false; // Prevent camera from opening
    }
    return true; // Allow camera to open
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

  // Format coordinates to a readable format
  const formatCoordinate = (coord: number | null) => {
    if (coord === null) return "Not available";
    return coord.toFixed(6);
  };

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Heading fontSize="24px" lineHeight="36px" fontWeight="600" mb={3}>
        Upload Bottle Receipt
      </Heading>
      <VStack spacing={6} align="stretch" flex={1}>
        <PhotoCapture />
      </VStack>
      <Box py={6} display="flex" justifyContent="space-between" gap={3}>
        <PhotoInput
          flex={1}
          minH="54px"
          borderRadius="20px"
          colorScheme="primary"
          variant="outline"
          borderWidth="2px"
          size="lg"
          onPhotoTake={handleCapture}
          onBeforeCapture={handlePhotoClick}
        >
          Take Photo
        </PhotoInput>
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
