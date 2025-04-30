"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

interface S3PhotoContextType {
  photoUrl: string | null;
  photoKey: string | null;
  photoFile: File | null;
  serverUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;

  // Capture photo without uploading
  capturePhoto: (file: File) => void;

  // Upload photo to S3
  uploadPhoto: () => Promise<{ fileUrl: string; fileKey: string } | null>;

  // Clear photo
  clearPhoto: () => void;
}

const S3PhotoContext = createContext<S3PhotoContextType | undefined>(undefined);

export function S3PhotoProvider({ children }: { children: React.ReactNode }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastFileId, setLastFileId] = useState<string | null>(null);

  // Manage blob URL lifecycle
  useEffect(() => {
    return () => {
      // Cleanup blob URL when component unmounts
      if (photoUrl && photoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  // Generate a unique ID for a file based on its name, size and last modified date
  const getFileId = useCallback((file: File) => {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }, []);

  // Capture photo without uploading
  const capturePhoto = useCallback(
    async (file: File) => {
      const fileId = getFileId(file);
      const isNewFile = fileId !== lastFileId;

      // If we're just updating for the same file, don't reset everything
      if (isNewFile) {
        // This is a new photo, clear previous state
        setUploadProgress(0);
        setUploadError(null);
        setPhotoKey(null);
        setServerUrl(null);

        // Revoke old blob URL if exists
        if (photoUrl && photoUrl.startsWith("blob:")) {
          URL.revokeObjectURL(photoUrl);
        }

        // Store file and create preview URL
        setPhotoFile(file);
        const newPreviewUrl = URL.createObjectURL(file);
        setPhotoUrl(newPreviewUrl);
        setLastFileId(fileId);
      }
    },
    [photoUrl, lastFileId, getFileId]
  );

  // Upload photo to S3
  const uploadPhoto = useCallback(async () => {
    if (!photoFile) {
      setUploadError("No photo to upload");
      return null;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      // Create form data
      const formData = new FormData();
      formData.append("file", photoFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      // Upload to server
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Server upload failed");
      }

      const result = await response.json();

      // Keep blob URL for display, just store server URL and key separately
      setPhotoKey(result.fileKey);
      setServerUrl(result.fileUrl);
      setUploadProgress(100);

      return result;
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Unknown error");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [photoFile]);

  const clearPhoto = useCallback(() => {
    // Revoke blob URL if it exists
    if (photoUrl && photoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(photoUrl);
    }

    setPhotoUrl(null);
    setServerUrl(null);
    setPhotoKey(null);
    setPhotoFile(null);
    setLastFileId(null);
    setUploadProgress(0);
    setUploadError(null);
  }, [photoUrl]);

  return (
    <S3PhotoContext.Provider
      value={{
        photoUrl,
        photoKey,
        photoFile,
        serverUrl,
        isUploading,
        uploadProgress,
        uploadError,
        capturePhoto,
        uploadPhoto,
        clearPhoto,
      }}
    >
      {children}
    </S3PhotoContext.Provider>
  );
}

export function useS3Photo() {
  const context = useContext(S3PhotoContext);
  if (context === undefined) {
    throw new Error("useS3Photo must be used within a S3PhotoProvider");
  }
  return context;
}
