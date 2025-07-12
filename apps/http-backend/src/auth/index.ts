import express from "express"
import userRouter from "./User"
const router = express.Router();

router.use("/user", userRouter);

export default router;
