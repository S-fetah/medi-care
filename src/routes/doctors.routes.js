import { completeBio, getDoctors, testUploadCertificate } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { doctorBioSchema } from "../validations/auth.validation.js";
import { appointmentDeleteValidation, appointmentUpdateValidation, appointmentValidation } from "../validations/appointment.validation.js"
import { createAppointments, deleteAppointment, updateAppointment } from "../controllers/appointment.controller.js";




async function doctorRoutes(fastify,options){

  // get doctors for homepage
 fastify.get("/doctors", { preHandler: authMiddleware }, getDoctors)

   // complete bio for doctor
 fastify.put("/doctors/completeBio",{ preHandler: [authMiddleware, validate(doctorBioSchema, "body")] }, completeBio)
 

 // Test endpoint for file upload to Cloudinary
 fastify.post(
   "/auth/doctor/certificate",
   testUploadCertificate
 );

// appointment routes
  fastify.post("/doctors/appointments/create", {preHandler : [authMiddleware, validate(appointmentValidation, "body")] }, createAppointments)

  fastify.put("/doctors/appointments/update", {preHandler : [authMiddleware, validate(appointmentUpdateValidation, "body")] }, updateAppointment)
  
  fastify.delete("/doctors/appointments/delete", {preHandler : [authMiddleware, validate(appointmentDeleteValidation, "body")] }, deleteAppointment)
  

    
}

export default doctorRoutes
