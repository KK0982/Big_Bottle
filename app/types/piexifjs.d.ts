declare module "piexifjs" {
  const piexif: {
    load: (imageData: string) => any;
    dump: (exifObj: any) => any;
    insert: (exifData: any, imageData: string) => string;
    remove: (imageData: string) => string;

    // EXIF tags
    GPSIFD: {
      GPSVersionID: number;
      GPSLatitudeRef: number;
      GPSLatitude: number;
      GPSLongitudeRef: number;
      GPSLongitude: number;
      GPSAltitudeRef: number;
      GPSAltitude: number;
      GPSTimeStamp: number;
      GPSSatellites: number;
      GPSStatus: number;
      GPSMeasureMode: number;
      GPSDOP: number;
      GPSSpeedRef: number;
      GPSSpeed: number;
      GPSTrackRef: number;
      GPSTrack: number;
      GPSImgDirectionRef: number;
      GPSImgDirection: number;
      GPSMapDatum: number;
      GPSDestLatitudeRef: number;
      GPSDestLatitude: number;
      GPSDestLongitudeRef: number;
      GPSDestLongitude: number;
      GPSDestBearingRef: number;
      GPSDestBearing: number;
      GPSDestDistanceRef: number;
      GPSDestDistance: number;
      GPSProcessingMethod: number;
      GPSAreaInformation: number;
      GPSDateStamp: number;
      GPSDifferential: number;
      GPSHPositioningError: number;
    };

    "0th": any;
    Exif: any;
    GPS: any;
    Interop: any;
    "1st": any;
  };

  export default piexif;
}
