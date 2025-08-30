import express, { Router, Request, Response } from "express";
import { getSensor, addSensor_s, addSensor } from "../controllers/SensorController";

const sensor: Router = express.Router();

sensor.route("/").get(getSensor).post(addSensor)

export default sensor;