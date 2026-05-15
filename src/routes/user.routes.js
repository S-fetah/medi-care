import {  bookAppointment, getUser, getUserBookings, handleLogin, handleSignUp } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  loginValidation,
  signUpValidation,
} from "../validations/auth.validation.js";

async function userRoutes(fastify, options) {

  // user routes
  fastify.get("/user", { preHandler: authMiddleware }, getUser)

  fastify.get("/user/bookings", { preHandler: authMiddleware }, getUserBookings)

  fastify.post("/user/bookings/book", { preHandler: authMiddleware }, bookAppointment)

  // auth routes
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

