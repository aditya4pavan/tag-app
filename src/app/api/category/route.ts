import type { NextRequest } from "next/server";
import Category from "../../../../schemas/category";
import dbConnect from "../../../../lib/dbConnect";

export async function GET(req: Request) {
    try {
        await dbConnect();
        let documents = await Category.find();
        return Response.json({ success: true, data: documents }, { status: 200 })
    }
    catch (ex) {
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        let data = await req.json();
        data.tags = data.tags.map((e: any) => {
            return { tag: e }
        })
        await dbConnect()
        let doc = await Category.create(data);
        return Response.json({ success: true, data: doc }, { status: 200 })
    }
    catch (ex) {
        console.log(ex);
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        let id = req.nextUrl.searchParams.get('id') as string;
        await dbConnect();
        await Category.findByIdAndDelete(id);
        return Response.json({ success: true }, { status: 200 })
    }
    catch (ex) {
        console.log(ex);
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}