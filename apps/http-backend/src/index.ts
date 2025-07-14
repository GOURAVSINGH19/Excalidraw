import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import authMiddleware from "./middleware/middleware";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/schema/types";
import { prisma } from "@repo/db/client";
import cors from "cors";
import bcrypt from "bcrypt";
const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  const parsedata = CreateUserSchema.safeParse(req.body);
  if (!parsedata.success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const existingUser = await prisma.user.findMany({
    where: {
      email: parsedata.data.email,
    },
  });

  if (existingUser) {
    return res.status(411).json({
      message: "Email already taken/Incorrect inputs",
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(parsedata.data.password, salt);
    const user = await prisma.user.create({
      data: {
        email: parsedata.data.email,
        name: parsedata.data.name,
        password: hash,
        photo: parsedata.data?.photo,
      },
    });
    const userId = user.id;
    res.json({
      message: "User created successfully",
      userId,
    });
  } catch (err) {
    res.status(411).json({
      message: "User already exits with this email",
    });
  }
});

app.post("/signin", async (req, res) => {
  const parsedata = SigninSchema.safeParse(req.body);
  if (!parsedata.success) {
    return res.status(411).json({
      message: "Invalid input",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: parsedata.data.email,
      },
    });

    if (!user) {
      return res.status(403).json({
        message: "Unauthorized: User not found",
      });
    }

    const isValid = await bcrypt.compare(
      parsedata.data.password,
      user.password
    );

    if (!isValid) {
      return res.status(403).json({
        message: "Unauthorized: Invalid password",
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while logging in",
    });
  }
});

app.post("/room", authMiddleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect inputs",
    });
    return;
  }
  // @ts-ignore: TODO: Fix this
  const userId = req.userId;

  try {
    const room = await prisma.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });

    res.json({
      roomId: room.id,
    });
  } catch (e) {
    res.status(411).json({
      message: "Room already exists with this name",
    });
  }
});

app.get("/chat/:roomId", async (req, res) => {
  const roomId = req.params.roomId;

  const message = await prisma.room.findFirst({
    where: {
      id: Number(roomId)
    },
    orderBy: {
      id: "desc"
    },
    take: 50
  })
  res.json({
    message
  })
});

app.listen(3000);
