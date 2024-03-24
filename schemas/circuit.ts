import mongoose, { Schema, Document, Model } from "mongoose";
import { ICategory } from "./category";

export interface ICircuit extends Document {
    name: string
    description: string
    category: ICategory['_id']
    workouts: IWorkOut[]
}

export interface IWorkOut extends Document {
    sub: string
    rest: number
}

const workoutSchema = new Schema<IWorkOut>({
    sub: { type: String, required: true },
    rest: { type: Number, required: true }
})

const circuitSchema = new Schema<ICircuit>({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    workouts: [workoutSchema]
}, { timestamps: true })

const Circuit: Model<ICircuit> = mongoose.models.Circuit || mongoose.model<ICircuit>('Circuit', circuitSchema)

export default Circuit;