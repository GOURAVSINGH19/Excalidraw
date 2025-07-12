import WebSocket, { WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/db/config";
import jwt, { JwtPayload } from "jsonwebtoken";
const wss = new WebSocketServer({ port: 8080 });

let userConnected = 0;
wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryparams = new URLSearchParams(url.split("?")[1]);
  const token = queryparams.get("token") || "";

  const decode = jwt.verify(token, JWT_SECRET);

  if (!decode || !(decode as JwtPayload).userId) {
    ws.close();
    return;
  }

  ws.on("error", console.error);
  userConnected++;
  ws.on("message", function message(data) {
    ws.send("pong");
  });
});
