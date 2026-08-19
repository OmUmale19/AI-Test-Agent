import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const repoId = req.nextUrl.searchParams.get("repoId");
        const repoName = req.nextUrl.searchParams.get("repoName");
        const repoOwner = req.nextUrl.searchParams.get("repoOwner");

        const conditions = [];
        if (repoId) conditions.push(eq(TestCasesTable.repoId, Number(repoId)));
        if (repoName) conditions.push(eq(TestCasesTable.repoName, repoName));
        if (repoOwner) conditions.push(eq(TestCasesTable.repoOwner, repoOwner));

        const testCases = conditions.length > 0
            ? await db.select().from(TestCasesTable).where(and(...conditions)).orderBy(desc(TestCasesTable.createdAt))
            : await db.select().from(TestCasesTable).orderBy(desc(TestCasesTable.createdAt));

        return NextResponse.json({ success: true, testCases });
    } catch (error: any) {
        console.error("Error in testcases route:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch test cases" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Test case ID required" }, { status: 400 });
        }

        await db.delete(TestCasesTable).where(eq(TestCasesTable.id, Number(id)));
        return NextResponse.json({ success: true, message: "Test case deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete test case" }, { status: 500 });
    }
}