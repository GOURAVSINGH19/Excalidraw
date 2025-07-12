import z from "zod";

export const signupBody = z.object({
  username: z.string().min(3).max(20),
  name: z.string(),
  password: z.string(),
});

export const signinBody = z.object({
  username: z.string().min(3).max(20),
  password: z.string(),
});

export const createroom = z.object({
  name: z.string().min(3).max(20),
});
