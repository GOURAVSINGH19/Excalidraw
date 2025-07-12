import express from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/middleware";
import { JWT_SECRET } from "@repo/db/config";
import { signinBody, signupBody, createroom } from "@repo/schema/types";
import prisma from "@repo/db/client";
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Username already taken / Incorrect inputs",
    });
  }

  const existingUser = await prisma.user.findMany({
    where: {
      username: req.body.username,
    },
  });

  if (existingUser) {
    return res.status(411).json({
      message: "Username already taken/Incorrect inputs",
    });
  }

  const user = await prisma.user.create({
    data: {
      username: req.body.username,
      name: req.body.name,
      password: req.body.password,
    },
  });
  const userId = user.id;

  const token = jwt.sign(
    {
      username: prisma.user.fields.username,
      id: userId,
    },
    JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );

  res.json({
    message: "User created successfully",
  });
});

router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Username already taken / Incorrect inputs",
    });
  }

  const userId = 1;
  if (userId) {
    const token = jwt.sign(
      {
        userId,
      },
      JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.json({
      token: token,
    });
    return;
  }

  res.status(411).json({
    message: "Error while logging in",
  });
});

router.post("/create-room", authMiddleware, async (req, res) => {
  const { success } = createroom.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Username already taken / Incorrect inputs",
    });
  }
  const filter = req.query;
});

export default router;
