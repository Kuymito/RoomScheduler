import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials from .env.local
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  const data = await request.formData();
  const file = data.get('file');

  if (!file) {
    return NextResponse.json({ message: "No file provided." }, { status: 400 });
  }

  // Convert the file to a buffer to be uploaded
  const fileBuffer = await file.arrayBuffer();
  let mime = file.type;
  let encoding = 'base64';
  let base64Data = Buffer.from(fileBuffer).toString('base64');
  let fileUri = 'data:' + mime + ';' + encoding + ',' + base64Data;

  try {
    // Upload the file to Cloudinary with specified options
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: 'user-profiles',
      resource_type: "auto", // Automatically detect if it's an image, video, or raw file
      use_filename: true,    // Use the original filename
      unique_filename: true, // Ensure the filename is unique to prevent overwrites
      overwrite: false,      // Do not overwrite existing files with the same name
    });

    return NextResponse.json({ url: result.secure_url }, { status: 200 });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ message: "Failed to upload image.", error: error.message }, { status: 500 });
  }
}