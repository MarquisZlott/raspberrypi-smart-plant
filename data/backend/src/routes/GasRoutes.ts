import express, { Router, Request, Response } from "express";
import { getGas, addGas_s, addGas } from "../controllers/GasController";

const gas: Router = express.Router();

gas.route("/").get(getGas).post(addGas)

export default gas;