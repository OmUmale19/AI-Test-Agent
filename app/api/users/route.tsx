import { db } from "@/db";
import { users } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const user = await currentUser();

    try {
        const email = user?.primaryEmailAddress?.emailAddress;

        if (!email) {
            return NextResponse.json({ message: "User email not found" }, { status: 400 });
        }

        const userRes = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (userRes.length === 0) {
            const newUser = await db.insert(users).values({
                email: email,
                name: user?.fullName ?? "",
            }).returning();
            return NextResponse.json({ user: newUser[0] });
        }
        else {
            return NextResponse.json({ user: userRes[0] });
        }

    }

    catch (error) {
        console.log("Error fetching users:", error);
        return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
    }
}
