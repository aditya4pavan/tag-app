import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExercise extends Document {
    name: string
    description: string
    difficulty: string
    meta: IExerciseMeta['_id']
    tags: string[]
}

export interface IExerciseMetaData extends Document {
    metaKey: String
    metaValue: String
}

export interface IExerciseMeta extends Document {
    name: string
    description: string
    data: IExerciseMetaData[]
}

const exerciseSchema = new Schema<IExercise>({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    difficulty: { type: String, trim: true, enum: ['Beginner', 'Easy', 'Medium', 'Hard'], default: 'Medium' },
    meta: { type: Schema.Types.ObjectId, ref: 'ExerciseMeta' },
    tags: {
        type: [String]
    }
}, { timestamps: true })

const exerciseMetaDataSchema = new Schema<IExerciseMetaData>({
    metaKey: { type: String, required: true },
    metaValue: { type: String, required: true }
})

const exerciseMetaSchema = new Schema<IExerciseMeta>({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    data: [exerciseMetaDataSchema]
}, { timestamps: true })

export const ExerciseMeta: Model<IExerciseMeta> = mongoose.models.ExerciseMeta || mongoose.model<IExerciseMeta>('ExerciseMeta', exerciseMetaSchema)

const Exercise: Model<IExercise> = mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', exerciseSchema)

export default Exercise;