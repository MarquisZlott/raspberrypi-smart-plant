import mongoose, { Schema, Document, Date } from "mongoose";

export interface ITemperature extends Document {
    c: number;
    humid: number;
    date: Date; 
}

const TemperatureSchema: Schema = new Schema({
    c: {
        type: Number,
        required: true
    },
    humid: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Temperature = mongoose.model<ITemperature>("Temperature", TemperatureSchema, "Temperature");
export default Temperature;