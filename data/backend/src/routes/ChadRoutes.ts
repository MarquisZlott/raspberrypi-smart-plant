import express, { Router } from "express";
import { analysis } from "../controllers/ChadController";

const chad: Router = express.Router()

chad.route("/").get(analysis)

export default chad;