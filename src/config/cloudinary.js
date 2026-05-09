import { v2 as cloudinary } from "cloudinary";
import { CONFIG } from "./constants.js";
cloudinary.config({
  cloud_name: CONFIG.CLOUDINARY_CLOUD_NAME,
  api_key: CONFIG.CLOUDINARY_API_KEY,
  api_secret: CONFIG.CLOUDINARY_SECRET_KEY,
});

export default cloudinary;