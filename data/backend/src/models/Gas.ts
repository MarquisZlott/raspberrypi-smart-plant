import mongoose, { Schema, Document, Date } from "mongoose";

export interface IGas extends Document {
    lpg: number;
    co: number;
    co2: number;
    smoke: number;
    date: Date; 
}

const GasSchema: Schema = new Schema({
    lpg: {
        type: Number,
        required: true
    },
    co: {
        type: Number,
        required: true
    },
    co2: {
        type: Number,
        require: true
    },
    smoke: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Gas = mongoose.model<IGas>("Gas", GasSchema, "Gas");
export default Gas;