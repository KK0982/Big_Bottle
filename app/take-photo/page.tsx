"use client";

import { useRouter } from "next/navigation";
import { WebcamCapture } from "../components/WebcamCapture";
import { useState } from "react";

export default function TakePhotoPage() {
  const router = useRouter();
  const [isCapturing, setIsCapturing] = useState(true);

  const handleCapture = (imageData: string) => {
    // Save photo data to localStorage or state management solution
    localStorage.setItem("capturedImage", imageData);
    // Navigate to upload page or wherever you want to process the image
    router.push("/upload-receipt");
  };

  const handleClose = () => {
    router.push("/"); // Return to home page
  };

  return (
    <WebcamCapture
      isOpen={isCapturing}
      onCapture={handleCapture}
      onClose={handleClose}
      returnToHome={true}
    />
  );
}
