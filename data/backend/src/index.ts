import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from 'cors';

import sensor from "./routes/SensorRoutes";
dotenv.config();

const PORT = process.env.PORT || 3001;
const app: Express = express();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";

app.use(cors({
  origin: ["http://localhost:3000", "https://smart-plant.vercel.app"],
  methods: ["GET", "POST", "OPTIONS"]
}));
app.use(bodyParser.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));


app.use("/api/sensor", sensor)
  
app.get("/", (req: Request, res: Response) => {
  res.send("Web Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
