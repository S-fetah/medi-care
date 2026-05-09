import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (fileData, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    console.log("Starting Cloudinary upload...");

    const upload = cloudinary.uploader.upload_stream(
      {
        folder: "doctor-certificates",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return resolve({ success: false, error: error.message });
        }
        console.log("Cloudinary upload successful:", result.secure_url);
        resolve({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    if (Buffer.isBuffer(fileData)) {
      // If it's a buffer, write it directly to the stream and end it
      upload.end(fileData);
    } else {
      // If it's a stream, pipe it
      fileData.on("error", (err) => {
        console.error("File stream error during upload:", err);
        resolve({ success: false, error: "File stream error: " + err.message });
      });

      fileData.pipe(upload);
    }
  });
};


