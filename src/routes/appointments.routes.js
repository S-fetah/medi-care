import { authMiddleware } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middleware.js"
import { appointmentValidation } from "../validations/appointment.validation.js"




async function appointmentRoutes(fastify,options){

  fastify.post("/appointments/book", {preHandler : [authMiddleware, validate(appointmentValidation, "body")] }, bookAppointment)
    

}

export default appointmentRoutes