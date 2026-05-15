import {auth, db} from "../config/firebase.js";

export const authMiddleware = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return reply.code(401).send({
        message: "Unauthorized"
      });
    }

    const token = authHeader.split(" ")[1];

    // const decoded = await auth.verifyIdToken(token);
    const decoded = await db.collection("sessions").where("accessToken", "==", token).get();
    if(decoded.empty){
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    const user = await db.collection("users").where("uid", "==", decoded.userId).get();
    if(user.empty){
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    request.user = decoded;

  } catch {
    return reply.code(401).send({
      message: "Invalid token"
    });
  }
};