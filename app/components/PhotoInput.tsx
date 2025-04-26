"use client";

import React, { useCallback } from "react";
import { Button, ButtonProps } from "@chakra-ui/react";
import FA from "react-fontawesome";

interface PhotoInputProps extends ButtonProps {
  onPhotoTake: (file: File) => void;
  onBeforeCapture?: () => boolean; // Returns true to allow capture, false to prevent
  children?: React.ReactNode;
}

export function PhotoInput({
  onPhotoTake,
  onBeforeCapture,
  children,
  ...props
}: PhotoInputProps) {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onPhotoTake(file);
      }
    },
    [onPhotoTake]
  );

  const handleInputClick = useCallback(
    (event: React.MouseEvent<HTMLInputElement>) => {
      if (onBeforeCapture && !onBeforeCapture()) {
        event.preventDefault();
      }
    },
    [onBeforeCapture]
  );

  return (
    <Button leftIcon={<FA name="camera" />} {...props}>
      {children || "Take Photo"}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        onClick={handleInputClick}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
          zIndex: 1000,
        }}
      />
    </Button>
  );
}
