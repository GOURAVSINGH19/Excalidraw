import express from "express";
const app = express();
import rootrouter from "./auth/index"
import dotenv from "dotenv"
dotenv.config();
app.use(express.json());


app.use("/",rootrouter);
app.listen(3001);
