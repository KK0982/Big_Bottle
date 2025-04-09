import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3 } from "../../../lib/s3-services";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Please provide a file" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const result = await uploadFileToS3(buffer, file.name, file.type);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// Configure request handling options for large file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
