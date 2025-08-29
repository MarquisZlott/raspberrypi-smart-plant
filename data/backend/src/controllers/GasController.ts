import { Request, Response } from "express";
import Gas, { IGas } from "../models/Gas";
import cron from "node-cron";
import axios from "axios";
import { randomMockData } from "../mock/mockutil";

export const getGas = async (req: Request, res: Response) => {
    try {
        const gases = await Gas.find().sort({ date: -1 })

        res.status(201).json({ success: true, data: gases })
    } catch (error) {
        res.status(500).json({ success: false, error: error })
    }
}

export const addGas = async (req: Request, res: Response) => {
    try {
        const { lpg, co, co2, smoke } = req.body
        const newGas: IGas = new Gas({ lpg, co, co2, smoke });

        await newGas.save()
        res.status(201).json({ success: true, data: newGas })
    } catch (error) {
        res.status(500).json({ success: false, error: error })
    }
}

export const addGas_s = async (data: { lpg: number, co: number, co2:number, smoke: number }) => {
    try {
        const { lpg, co, co2, smoke } = data
        const newGas: IGas = new Gas({ lpg, co, co2, smoke });

        await newGas.save()
        console.log("Gas saved:", newGas);
    } catch (error) {
        console.error("Error saving gas:", error);
    }
}

const LPG_URL = "https://sgp1.blynk.cloud/external/api/get?token=ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T&V2"
const CO_URL = "https://sgp1.blynk.cloud/external/api/get?token=ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T&V3"
const SMOKE_URL = "https://sgp1.blynk.cloud/external/api/get?token=ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T&V4"

// cron.schedule("*/10 * * * * *", async () => {
//     try {
//         // const lpgResponse = await axios.get(LPG_URL);
//         // const coResponse = await axios.get(CO_URL);
//         // const smokeResponse = await axios.get(SMOKE_URL);
        
//         // const lpg = parseInt(lpgResponse.data);
//         // const co = parseInt(coResponse.data);
//         // const smoke = parseInt(smokeResponse.data);

//         // # For Testing
//         const lastEntry = await Gas.findOne().sort({ date: -1 }).lean();

//         const lpg = randomMockData(lastEntry?.lpg || 0, 0, 10000, 0.05);
//         const co = randomMockData(lastEntry?.co || 0, 0, 10000, 0.22);
//         const smoke = randomMockData(lastEntry?.smoke || 0, 0, 10000, 0.12);

//         console.log("Fetched from Blynk:", { lpg, co, smoke });

//         await addGas({ lpg, co, smoke });
//     } catch (error) {
//         console.error("Error fetching from Blynk or adding temperature:", error);
//     }
// });

