import exp from 'constants';
import Sensor, { ISensor } from './../models/Sensor';
import { Request, Response } from "express";

export const getSensor = async (req: Request, res: Response) => {
    try {
        const sensors = await Sensor.find().sort({ date: -1 })
        res.status(201).json({ success: true, data: sensors })
    } catch (error) {
        res.status(500).json({ success: false, error: error })
    }
}

export const addSensor = async (req: Request, res: Response) => {
    try {
        const { temperature, humidity, soilMoisture, lightIntensity, acceleration, rotation } = req.body
        const newSensor: ISensor = new Sensor({ temperature, humidity, soilMoisture, lightIntensity, acceleration, rotation });
        await newSensor.save()
        res.status(201).json({ success: true, data: newSensor })
    } catch (error) {
        res.status(500).json({ success: false, error: error })
    }
}

export const addSensor_s = async (data: { temperature: number, humidity: number, soilMoisture: number, lightIntensity: number, acceleration: number, rotation: number }) => {
    try {
        const { temperature, humidity, soilMoisture, lightIntensity, acceleration, rotation } = data
        const newSensor: ISensor = new Sensor({ temperature, humidity, soilMoisture, lightIntensity, acceleration, rotation });
        await newSensor.save()
        console.log("Sensor saved:", newSensor);
    } catch (error) {
        console.error("Error saving sensor:", error);
    }
}