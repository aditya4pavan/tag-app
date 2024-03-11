import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
    name: string
    description: string
    tags: ITag[]
}

interface ITag extends Document {
    tag: string
}

const tagSchema = new Schema<ITag>({
    tag: { type: String, required: true }
})

const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    tags: [tagSchema]
}, { timestamps: true })

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema)

export default Category;