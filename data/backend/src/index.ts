import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from 'cors';
import temperature from "./routes/TemperatureRoutes";
import gas from "./routes/GasRoutes";
import chad from "./routes/ChadRoutes";

dotenv.config();

const PORT = process.env.PORT || 3001;
const app: Express = express();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";

const corsOptions = {
  origin: 'https://esp32-air.vercel.app', // Allow only this origin
  // origin: 'http://localhost:3000', // Allow only this origin
  methods: 'GET',
};


app.use(cors(corsOptions));
app.use(bodyParser.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));


app.use("/api/temps", temperature)
app.use("/api/gases", gas)
app.use("/api/chad", chad)
  
app.get("/", (req: Request, res: Response) => {
  res.send("Web Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
