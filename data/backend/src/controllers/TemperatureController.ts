import { Request, Response } from "express";
import Temperature, { ITemperature } from "../models/Temperature";
import cron from "node-cron";
import axios from "axios";
import { randomMockData } from "../mock/mockutil";

export const getTemp = async (req: Request, res: Response) => {
    try {
        const temps = await Temperature.find().sort({ date: -1 });

        res.status(201).json({ success: true, data: temps })
    } catch (error) {
        res.status(500).json({ success: false, error: error })
    }
}

export const addTemp = async (req: Request, res: Response) => {
    try {
        const { c, humid } = req.body
        const newTemp: ITemperature = new Temperature({ c, humid });

        await newTemp.save()
        res.status(201).json({ success: true, data: newTemp })
    } catch (error) {
        res.status(500).json({ success: false, error: error })
    }
}

export const addTemp_s = async (data: { c: number; humid: number }) => {
    try {
        const { c, humid } = data;
        const newTemp: ITemperature = new Temperature({ c, humid });
        await newTemp.save();
        console.log("Temperature saved:", newTemp);
    } catch (error) {
        console.error("Error saving temperature:", error);
    }
};

const TEMP_URL = "https://sgp1.blynk.cloud/external/api/get?token=ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T&V0"
const HUMID_URL = "https://sgp1.blynk.cloud/external/api/get?token=ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T&V1"

// cron.schedule("*/10 * * * * *", async () => {
//     try {
//         // const tempResponse = await axios.get(TEMP_URL);
//         // const humidResponse = await axios.get(HUMID_URL);
        
//         // const c = parseFloat(tempResponse.data);
//         // const humid = parseFloat(humidResponse.data);
        
//         // # For Testing
//         const lastEntry = await Temperature.findOne().sort({ date: -1 }).lean();

//         const c =  randomMockData(lastEntry?.c || 30, -40, 80, 0.25);
//         const humid = randomMockData(lastEntry?.humid || 30, 0, 100, 0.34);

//         console.log("Fetched from Blynk:", { c, humid });

//         await addTemp({ c, humid });
//     } catch (error) {
//         console.error("Error fetching from Blynk or adding temperature:", error);
//     }
// });