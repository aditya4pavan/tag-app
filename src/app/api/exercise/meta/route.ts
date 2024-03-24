import type { NextRequest } from "next/server";
import { ExerciseMeta } from "../../../../../schemas/exercise";
import dbConnect from "../../../../../lib/dbConnect";

export async function GET(req: Request) {
    try {
        await dbConnect();
        let documents = await ExerciseMeta.find();
        return Response.json({ success: true, data: documents }, { status: 200 })
    }
    catch (ex) {
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        let data = await req.json();
        await dbConnect()
        let doc = await ExerciseMeta.create(data);
        return Response.json({ success: true, data: doc }, { status: 200 })
    }
    catch (ex) {
        console.log(ex);
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        let data = await req.json();
        const { _id, ...other } = data;
        await dbConnect();
        let updatedDoc = await ExerciseMeta.findOneAndUpdate({ _id: data._id }, { $set: { meta: other.meta } }, { new: true });
        // let updatedDoc = await ExerciseMeta.findById(data._id)
        return Response.json(updatedDoc, { status: 200 })
    }
    catch (ex) {
        console.log(ex);
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        let id = req.nextUrl.searchParams.get('id') as string;
        await ExerciseMeta.findByIdAndDelete(id);
        return Response.json({ success: true }, { status: 200 })
    }
    catch (ex) {
        console.log(ex);
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}