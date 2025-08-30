import mongoose, { Schema, Document, Date } from "mongoose";

export interface ISensor extends Document {
    temperature: number;
    humidity: number;
    soilMoisture: number;
    lightIntensity: number;
    acceleration: number;
    rotation: number;
    date: Date;
}

const SensorSchema: Schema = new Schema({
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    },
    soilMoisture: {
        type: Number,
        required: true
    },
    lightIntensity: {
        type: Number,
        required: true
    },
    acceleration: {
        type: Number,
        required: true
    },
    rotation: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Sensor = mongoose.model<ISensor>("Sensor", SensorSchema, "Sensor");
export default Sensor;