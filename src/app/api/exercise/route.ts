import type { NextRequest } from "next/server";
import Exercise, { IExercise } from "../../../../schemas/exercise";
import dbConnect from "../../../../lib/dbConnect";

export async function GET(req: Request) {
    try {
        await dbConnect();
        let documents = await Exercise.find();
        return Response.json({ success: true, data: documents }, { status: 200 })
    }
    catch (ex) {
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        let data = await req.json();
        if (data?.name?.split(";").length > 1) {
            let docs = data?.name?.split(";").map((x: string) => {
                return { name: x, description: 'NA' }
            })
            await dbConnect()
            await Exercise.insertMany(docs);
            return Response.json({ success: true, data: docs }, { status: 200 });
        }
        else {
            let doc = await Exercise.create(data);
            return Response.json({ success: true, data: doc }, { status: 200 })
        }
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
        let updatedDoc = await Exercise.findByIdAndUpdate({ _id }, other);
        return Response.json(updatedDoc, { status: 200 })
    }
    catch (ex) {
        console.log(ex);
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        let data = await req.json();
        await dbConnect();
        let updatedDocs = await Exercise.updateMany({ _id: { $in: data.map((e: IExercise) => e._id) } }, { $set: { tags: [] } });
        return Response.json(updatedDocs, { status: 200 })
    }
    catch (ex) {
        console.log(ex);
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        let id = req.nextUrl.searchParams.get('id') as string;
        await Exercise.findByIdAndDelete(id);
        return Response.json({ success: true }, { status: 200 })
    }
    catch (ex) {
        console.log(ex);
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}