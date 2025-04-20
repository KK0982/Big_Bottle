import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Generate unique filename
const generateUniqueFileName = (originalFileName: string) => {
  const now = dayjs();
  const datePath1 = now.format("YYYY-MM");
  const datePath2 = now.format("YYYY-MM-DD");
  const fileExtension = originalFileName.split(".").pop();
  const uniqueId = uuidv4();
  return `uploads/${datePath1}/${datePath2}/${uniqueId}.${fileExtension}`;
};

// Generate presigned URL for direct upload
export async function generatePresignedUrl(fileName: string, fileType: string) {
  const uniqueFileName = generateUniqueFileName(fileName);

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: uniqueFileName,
    ContentType: fileType,
  });

  try {
    // Generate presigned URL valid for 5 minutes
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    return {
      uploadUrl: signedUrl,
      fileKey: uniqueFileName,
      fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}

// Server-side upload to S3
export async function uploadFileToS3(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string
) {
  const uniqueFileName = generateUniqueFileName(fileName);

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: uniqueFileName,
    Body: fileBuffer,
    ContentType: fileType,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));

    console.log(
      `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`
    );

    return {
      fileKey: uniqueFileName,
      fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`,
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}
