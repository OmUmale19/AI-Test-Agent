import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code")
    if (!code) {
        return NextResponse.redirect(new URL("/workspace?error=No code provided", req.url));
    }
}