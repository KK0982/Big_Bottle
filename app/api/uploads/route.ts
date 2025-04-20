import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3 } from "../../../lib/s3-services";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3 with date-based folders
    const result = await uploadFileToS3(buffer, file.name, file.type);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in upload API:", error);
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
