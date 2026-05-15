import { CONFIG } from "../config/constants.js";
import { auth, db } from "../config/firebase.js";
import { uploadToCloudinary } from "../utils/helpers.js";
import crypto from "crypto";

export const handleLogin = async (request, reply) => {
  try {
    const { email, password } = request.body;

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${CONFIG.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return reply.code(401).send({
        message: "Invalid credentials",
      });
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");

    // ✅ correct Firestore usage
    const sessionRef = await db.collection("sessions").add({
      userId: data.localId,
      accessToken: sessionToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // optional: verify creation
    if (!sessionRef.id) {
      return reply.code(500).send({
        success: false,
        message: "Session creation failed",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Login successful",
      accessToken: sessionToken,
      userId: data.localId,
    });

  } catch (error) {
    return reply.code(500).send({
      success: false,
      error: error.message,
    });
  }
};

export const handleSignUp = async (request, reply) => {
  try {
    const { fullName, email, password, userType, speciality, certificateUrl } = request.body;

    if (userType === "doctor" && (!certificateUrl || certificateUrl === "" || !String(certificateUrl).includes("https://res.cloudinary.com"))) {
      return reply.status(400).send({
        success: false,
        message: "Certificate is required for doctors",
      });
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
      password,
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

// get user details
export const getUser = async (request, reply) => {
  try {
    const { uid } = request.user;
    const userRecord = await db.collection("users").doc(uid).get();


    if (!userRecord.exists) {
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    const {password , ...rest} = userRecord.data(); 
    return reply.status(200).send({
      success: true,
      message: "User fetched successfully",
      data: {...rest},
    });
  } catch (error) {
    console.error("Get User Error:", error);
    return reply.status(500).send({
      success: false,
      error: error.message || "An error occurred while fetching user",
    });
  }
};


export const getUserBookings = async (request, reply) => {
try{
  const { uid } = request.user;
  
  const bookings = await db.collection("bookings").where("userId", "==", uid).get();

  if (bookings.empty) {
    bookings = [];
  }

  const FileterdBookings = bookings.docs.map((doc) =>{
    return doc.data();
  });

  return reply.status(200).send({
    success: true,
    message: "Bookings fetched successfully",
    data: FileterdBookings,
  });

} catch(error) {

  reply.status(500).send({
    success: false,
    error: error.message || "An error occurred while fetching user bookings",
  });
}

}


export const bookAppointment = async (request, reply) => {

try {
  const { appointmentId } = request.body;
  const { uid } = request.user;

  const appointment = await db.collection("appointments").doc(appointmentId).get();

  if (!appointment.exists) {
    return reply.status(404).send({
      success: false,
      message: "Appointment not found",
    });
  }

  const bookingExits = await db.collection("bookings").where("appointmentId", "==", appointmentId).where("userId", "==", uid).get();
  if(!bookingExits.empty){
    return reply.status(400).send({
      success: false,
      message: "Booking already exists",
    });
  }
  const booking = await db.collection("bookings").add({
    appointmentId,
    userId: uid,
    createdAt: new Date().toISOString(),
    status: "pending acceptence",
    updatedAt: new Date().toISOString(),
  });

  return reply.status(200).send({
    success: true,
    message: "Appointment booked successfully",
    data: booking,
  });

} catch(error) {
  return reply.status(500).send({
    success: false,
    error: error.message || "An error occurred while booking appointment",
  });
}

}

// doctor operations
export const getDoctors = async (request, reply) => {
  try {
    const doctors = await db.collection("users").where("userType", "==", "doctor").get();
    if (doctors.empty) {
      return reply.status(404).send({
        success: false,
        message: "No doctors found",
      });
    }

    const FileterdDoctors = doctors.docs.map((doc) =>{

      const {password , ...rest} = doc.data();
      return rest
    });
     
    return reply.status(200).send({
      success: true,
      message: "Doctors fetched successfully",
      data: {FileterdDoctors},
    });
  } catch (error) {
    console.error("Get Doctors Error:", error);
    return reply.status(500).send({
      success: false,
      error: error.message || "An error occurred while fetching doctors",
    });
  }
};

export const completeBio = async (request, reply) => {
  try {
    const { uid } = request.user;
    const { title, bio, specialities, certification, reviews } = request.body;

    const details = {
      title,
      bio,
      specialities,
      certification,
      reviews,
    }
    const userRecord = await db.collection("users").doc(uid).get();
    if (!userRecord.exists) {
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if(userRecord.data().userType !== "doctor"){
      return reply.status(403).send({
        success: false,
        message: "Only doctors can complete their bio",
      });
    }
    await db.collection("users").doc(uid).update({ details, status: "active" });
    return reply.status(200).send({
      success: true,
      message: "Details updated successfully",
    });

  } catch (error) {
    console.error("Complete Bio Error:", error);
    return reply.status(500).send({
      success: false,
      error: error.message || "An error occurred while completing details",
    });
  }
};


