import z from "zod";

export const loginValidation = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpValidation = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["user", "doctor"]),
  speciality: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.userType === "doctor" && !data.speciality) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["speciality"],
      message: "Speciality is required for doctors",
    });
  }
});
