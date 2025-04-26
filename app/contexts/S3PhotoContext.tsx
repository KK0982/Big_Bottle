"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import piexif from "piexifjs";

interface GeoLocation {
  latitude: number | null;
  longitude: number | null;
  timestamp: string | null;
}

interface S3PhotoContextType {
  photoUrl: string | null;
  photoKey: string | null;
  photoFile: File | null;
  serverUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  locationData: GeoLocation | null;

  // Capture photo without uploading
  capturePhoto: (
    file: File,
    userLocation?: { latitude: number; longitude: number }
  ) => void;

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
  const [locationData, setLocationData] = useState<GeoLocation | null>(null);
  const [lastFileId, setLastFileId] = useState<string | null>(null);
  const [photoWithExif, setPhotoWithExif] = useState<File | null>(null);

  // Write location data to image EXIF
  const writeLocationToExif = useCallback(
    async (file: File, location: { latitude: number; longitude: number }) => {
      return new Promise<File>(async (resolve, reject) => {
        try {
          // Convert File to base64 string
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              if (!e.target?.result) {
                reject(new Error("Failed to read file"));
                return;
              }

              // Get the file data as a base64 string
              const imageData = e.target.result as string;

              // Convert decimal coordinates to EXIF format
              // EXIF uses degrees, minutes, seconds format for GPS
              const latAbs = Math.abs(location.latitude);
              const latDeg = Math.floor(latAbs);
              const latMin = Math.floor((latAbs - latDeg) * 60);
              const latSec = ((latAbs - latDeg) * 60 - latMin) * 60;

              const lngAbs = Math.abs(location.longitude);
              const lngDeg = Math.floor(lngAbs);
              const lngMin = Math.floor((lngAbs - lngDeg) * 60);
              const lngSec = ((lngAbs - lngDeg) * 60 - lngMin) * 60;

              // Create EXIF data structure
              let exifObj: any = {};

              try {
                // Try to get existing EXIF data
                exifObj = piexif.load(imageData);
              } catch (err) {
                console.warn("No existing EXIF data, creating new", err);
                // Create empty EXIF structure if there's no existing data
                exifObj = {
                  "0th": {},
                  Exif: {},
                  GPS: {},
                  Interop: {},
                  "1st": {},
                  thumbnail: null,
                };
              }

              // Set GPS data
              exifObj["GPS"] = {
                // GPS version
                [piexif.GPSIFD.GPSVersionID]: [2, 2, 0, 0],

                // Latitude
                [piexif.GPSIFD.GPSLatitudeRef]:
                  location.latitude >= 0 ? "N" : "S",
                [piexif.GPSIFD.GPSLatitude]: [
                  [latDeg, 1],
                  [latMin, 1],
                  [Math.round(latSec * 100), 100],
                ],

                // Longitude
                [piexif.GPSIFD.GPSLongitudeRef]:
                  location.longitude >= 0 ? "E" : "W",
                [piexif.GPSIFD.GPSLongitude]: [
                  [lngDeg, 1],
                  [lngMin, 1],
                  [Math.round(lngSec * 100), 100],
                ],
              };

              // Current date/time
              const now = new Date();
              const dateTimeStr = now
                .toISOString()
                .replace(/[-:]/g, "")
                .split("T")[0];

              // Add date and time as well
              exifObj["GPS"][piexif.GPSIFD.GPSDateStamp] = dateTimeStr;

              // Convert to binary form
              const exifBinary = piexif.dump(exifObj);

              // Insert EXIF into the image
              const newImageData = piexif.insert(exifBinary, imageData);

              // Convert back to Blob/File
              const byteString = atob(newImageData.split(",")[1]);
              const mimeType = file.type;
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);

              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }

              const newFile = new File([ab], file.name, { type: mimeType });
              resolve(newFile);
            } catch (err) {
              console.error("Error processing image EXIF:", err);
              // If we fail to write EXIF, return the original file
              resolve(file);
            }
          };

          reader.onerror = () => {
            console.error("Error reading file for EXIF writing");
            resolve(file); // Return original file on error
          };

          reader.readAsDataURL(file);
        } catch (err) {
          console.error("Failed to write location to EXIF:", err);
          resolve(file); // Return original file on error
        }
      });
    },
    []
  );

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
    async (
      file: File,
      userLocation?: { latitude: number; longitude: number }
    ) => {
      const fileId = getFileId(file);
      const isNewFile = fileId !== lastFileId;

      // If we're just updating location for the same file, don't reset everything
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
        setPhotoWithExif(null);
      }

      // Update location data if provided
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        setLocationData({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          timestamp: new Date().toISOString(),
        });
        console.log("Using browser location data:", userLocation);

        // Write location to EXIF data of the image
        try {
          const fileWithExif = await writeLocationToExif(file, userLocation);
          setPhotoWithExif(fileWithExif);
          console.log("Location written to EXIF data");
        } catch (error) {
          console.error("Failed to write location to EXIF:", error);
          // Keep the original file if EXIF writing fails
          setPhotoWithExif(file);
        }
      } else {
        // No location information available
        setLocationData({ latitude: null, longitude: null, timestamp: null });
        setPhotoWithExif(file);
      }
    },
    [photoUrl, lastFileId, getFileId, writeLocationToExif]
  );

  // Upload photo to S3
  const uploadPhoto = useCallback(async () => {
    const fileToUpload = photoWithExif || photoFile;

    if (!fileToUpload) {
      setUploadError("No photo to upload");
      return null;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      // Create form data
      const formData = new FormData();
      formData.append("file", fileToUpload);

      // Location is now embedded in the image EXIF, no need to add it to form data

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
  }, [photoFile, photoWithExif]);

  const clearPhoto = useCallback(() => {
    // Revoke blob URL if it exists
    if (photoUrl && photoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(photoUrl);
    }

    setPhotoUrl(null);
    setServerUrl(null);
    setPhotoKey(null);
    setPhotoFile(null);
    setPhotoWithExif(null);
    setLocationData(null);
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
        locationData,
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
