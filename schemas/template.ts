import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITemplate extends Document {
    name: string
    description: string
    weeks: IWeek[]
}

interface IWeek extends Document {
    order: number
    category: string
}

const weekSchema = new Schema<IWeek>({
    category: { type: String, required: true },
    order: { type: Number, required: true }
})


const templateSchema = new Schema<ITemplate>({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    weeks: [weekSchema]
}, { timestamps: true })

const Template: Model<ITemplate> = mongoose.models.Template || mongoose.model<ITemplate>('Template', templateSchema)

export default Template;