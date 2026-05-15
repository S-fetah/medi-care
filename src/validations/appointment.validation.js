import z from "zod"


export const appointmentValidation = z.object({
  appointmentDate: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Invalid ISO date"
  ),
  appointmentTime: z.string(),
  consultationFee: z.number(),
})

export const appointmentUpdateValidation = z.object({
  appointmentId: z.string(),
  appointmentDate: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Invalid ISO date"
  ),
  appointmentTime: z.string(),
  status: z.enum(["booked", "completed", "cancelled", "rescheduled", "available"]),
  consultationFee: z.number(),
})

export const appointmentDeleteValidation = z.object({
  appointmentId: z.string(),
})