interface ImageCaptureOptions {
  imageWidth?: number;
  imageHeight?: number;
}

interface PhotoCapabilities {
  redEyeReduction: string;
  fillLightMode: string[];
  imageHeight: MediaSettingsRange;
  imageWidth: MediaSettingsRange;
}

interface MediaSettingsRange {
  max: number;
  min: number;
  step: number;
}

interface PhotoSettings {
  fillLightMode?: string;
  imageHeight?: number;
  imageWidth?: number;
  redEyeReduction?: boolean;
}

declare class ImageCapture {
  constructor(track: MediaStreamTrack);
  takePhoto(photoSettings?: PhotoSettings): Promise<Blob>;
  getPhotoCapabilities(): Promise<PhotoCapabilities>;
  getPhotoSettings(): Promise<PhotoSettings>;
  grabFrame(): Promise<ImageBitmap>;
}
