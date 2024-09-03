import { type NextRequest, NextResponse } from "next/server";
import {
    handlers
} from "@/auth";
import { instagramFetchInterceptor } from '@/interceptors'
const { POST: AuthPOST, GET: AuthGET } = handlers;
const originalFetch = fetch;

export async function POST(req: NextRequest) {
    return await AuthPOST(req);
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    if (url.pathname === "/api/auth/callback/instagram") {
        global.fetch = instagramFetchInterceptor(originalFetch);
        const response = await AuthGET(req);
        global.fetch = originalFetch;
        return response;
    }
    const response = await AuthGET(req);
    return response;
}