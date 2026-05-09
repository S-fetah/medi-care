import { handleLogin, handleSignUp, testUploadCertificate } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  loginValidation,
  signUpValidation,
} from "../validations/auth.validation.js";

async function userRoutes(fastify, options) {
  fastify.post(
    "/auth/login",
    { preHandler: validate(loginValidation, "body") },
    handleLogin
  );
  fastify.post(
    "/auth/signup",
    { preHandler: validate(signUpValidation, "file") },
    handleSignUp
  );

  // Test endpoint for file upload to Cloudinary
  fastify.post(
    "/test/uploadCertificate",
    testUploadCertificate
  );

  fastify.get(
    "/protected",
    { preHandler: authMiddleware },
    (request, reply) => {
      reply.send({
        message: "This is protected content",
        user: request.user,
      });
    }
  );

}

export default userRoutes;

