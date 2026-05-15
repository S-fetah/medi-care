


export const createAppointments = async (request, reply) => {
    try {
      const { appointmentDate, appointmentTime, consultationFee } = request.body;
      const { uid, userType } = request.user;
      if (userType !== "doctor") {
        return reply.status(401).send({
          success: false,
          message: "Unauthorized... only doctor can create appointment",
          userType,
          
        });
      }

      const appointment = await db.collection("appointments").add({
        doctorId:uid,
        appointmentDate,
        appointmentTime,
        consultationFee,
        status:"available",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return reply.status(201).send({
        success: true,
        message: "Appointment booked successfully",
        data: appointment,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Error booking appointment",
        error: error.message,
      });
    }
  }

  export const updateAppointment = async (request, reply) => {
    try {
      const { appointmentId, appointmentDate, appointmentTime,  status } = request.body;
      const { uid } = request.user;
      const appointment = await db.collection("appointments").doc(appointmentId).update({
        appointmentDate,
        appointmentTime,
        status,
        
        updatedAt: new Date().toISOString(),
      });
      return reply.status(200).send({
        success: true,
        message: "Appointment updated successfully",
        data: appointment,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Error updating appointment",
        error: error.message,
      });
    }
  }

  export const deleteAppointment = async (request, reply) => {
    try {
      const { appointmentId } = request.body;
      const { uid } = request.user;
      const appointment = await db.collection("appointments").doc(appointmentId).delete();
      return reply.status(200).send({
        success: true,
        message: "Appointment deleted successfully",
        data: appointment,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Error deleting appointment",
        error: error.message,
      });
    }
  }