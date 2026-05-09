import {auth} from "../config/firebase.js";

export const authMiddleware = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return reply.code(401).send({
        message: "Unauthorized"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = await auth.verifyIdToken(token);

    request.user = decoded;

  } catch {
    return reply.code(401).send({
      message: "Invalid token"
    });
  }
};