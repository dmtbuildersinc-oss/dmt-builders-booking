import { z } from "zod";

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[0-9()+\-.\s]+$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email address"),
  address: z.string().trim().min(5, "Please enter your project address").max(200),
  projectTitle: z.string().trim().min(2, "Please enter a project title").max(150),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
});

export type BookingInput = z.infer<typeof bookingSchema>;
