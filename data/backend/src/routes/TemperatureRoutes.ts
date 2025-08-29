import express, { Router, Request, Response } from "express";
import { getTemp, addTemp_s, addTemp } from "../controllers/TemperatureController";

const temperature: Router = express.Router();

temperature.route("/").get(getTemp).post(addTemp)

export default temperature;