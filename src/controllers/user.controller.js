import { auth, db } from "../config/firebase.js";
import { uploadToCloudinary } from "../utils/helpers.js";

export const handleLogin = async (request, reply) => {
  try {
    const { email, password } = request.body;

    // NOTE: firebase-admin does not have signInWithEmailAndPassword.
    // This typically happens on the client side.
    // Returning dummy success for now.
    return reply.status(200).send({
      success: true,
      message: "Login successful (mock)",
      user: {
        email,
      },
    });
  } catch (error) {
    return reply.status(500).send({ success: false, error: error.message });
  }
};

export const handleSignUp = async (request, reply) => {
  try {
    const { fullName, email, password, userType, speciality } = request.body;

    let certificateUrl = null;

    if (userType === "doctor") {
      const filePart = request.fileData;
 // Populated by validate middleware
      if (!filePart) {
        return reply.status(400).send({
          success: false,
          message: "Certificate is required for doctors",
        });
      }
      // Handle file upload
      const uploadResult = await uploadToCloudinary(
        filePart.buffer,
        filePart.mimetype === "application/pdf" ? "raw" : "auto"
      );

      if (!uploadResult.success) {
        return reply.status(500).send({
          success: false,
          message: "Error uploading certificate",
          error: uploadResult.error,
        });
      }
      certificateUrl = uploadResult.url;
    }

    // 1. Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
    });

    // 2. Prepare user data for Firestore
    const userData = {
      uid: userRecord.uid,
      fullName,
      email,
      userType,
      createdAt: new Date().toISOString(),
      status: userType === "doctor" ? "pending" : "active",
      speciality: speciality || null,
      certificateUrl: certificateUrl,
    };

    // 3. Save to Firestore
    await db.collection("users").doc(userRecord.uid).set(userData);

    return reply.status(201).send({
      success: true,
      message: "User registered successfully",
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        userType,
      },
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    return reply.status(500).send({
      success: false,
      error: error.message || "An error occurred during sign up",
    });
  }
};

export const testUploadCertificate = async (request, reply) => {
  try {
    const filePart = await request.file();
    
    if (!filePart) {
      return reply.status(400).send({
        success: false,
        message: "No file provided for upload test",
      });
    }

    console.log("Received file for test upload:", filePart.filename);
    
    const uploadResult = await uploadToCloudinary(filePart.file, filePart.mimetype === "application/pdf" ? "raw" : "auto");

    if (!uploadResult.success) {
      return reply.status(500).send({
        success: false,
        message: "Test upload failed",
        error: uploadResult.error,
      });
    }

    return reply.status(200).send({
      success: true,
      message: "Test upload successful",
      data: {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error("Test Upload Error:", error);
    return reply.status(500).send({
      success: false,
      error: error.message || "An error occurred during the test upload",
    });
  }
};




