import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExercise extends Document {
    name: string
    description: string
    tags: string[]
}

const exerciseSchema = new Schema<IExercise>({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    tags: {
        type: [String]
    }
}, { timestamps: true })

const Exercise: Model<IExercise> = mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', exerciseSchema)

export default Exercise;