import { auth, db } from "../config/firebase.js";

export const seedPatient = async () => {
  try {
    const randomId = Math.floor(Math.random() * 100000);
    const email = `patient_${randomId}@example.com`;
    const password = "password123";
    const fullName = `Random Patient ${randomId}`;

    console.log(`Attempting to seed patient: ${email}...`);

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
      userType: "user",
      createdAt: new Date().toISOString(),
      status: "active",
    };

    // 3. Save to Firestore
    await db.collection("users").doc(userRecord.uid).set(userData);

    console.log(`Successfully seeded random patient: ${email}`);
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      console.log("Seed patient already exists, skipping.");
    } else {
      console.error("Error seeding patient:", error);
    }
  }
};
