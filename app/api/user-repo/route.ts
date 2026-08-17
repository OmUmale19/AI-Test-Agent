import { db } from "@/db";
import { repos } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
        }

        const userRepos = await db
            .select()
            .from(repos)
            .where(eq(repos.user_email, userEmail));

        return NextResponse.json({ repos: userRepos });
    } catch (error: any) {
        console.error("Error fetching database repos:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch repositories from database" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
        }

        const body = await req.json();
        const {
            repo_name,
            full_name,
            private: isPrivate = false,
            html_url,
            description = "",
            language = "TypeScript",
            default_branch = "main",
            owner,
            github_repo_id,
        } = body;

        if (!repo_name || !full_name || !owner || !html_url) {
            return NextResponse.json(
                { error: "Missing required repository fields (repo_name, full_name, owner, html_url)" },
                { status: 400 }
            );
        }

        // Check if repository is already saved in Database for this user
        const existingRepos = await db
            .select()
            .from(repos)
            .where(
                and(
                    eq(repos.user_email, userEmail),
                    eq(repos.full_name, full_name)
                )
            );

        if (existingRepos.length > 0) {
            const existingId = existingRepos[0].id;
            const updated = await db
                .update(repos)
                .set({
                    repo_name,
                    private: isPrivate,
                    html_url,
                    description,
                    language,
                    default_branch,
                    owner,
                    github_repo_id: github_repo_id ? Number(github_repo_id) : existingRepos[0].github_repo_id,
                    updated_at: new Date(),
                })
                .where(eq(repos.id, existingId))
                .returning();

            return NextResponse.json({
                success: true,
                message: "Repository details updated in database",
                repo: updated[0],
                isNew: false,
            });
        }

        const newRepo = await db
            .insert(repos)
            .values({
                user_email: userEmail,
                github_repo_id: github_repo_id ? Number(github_repo_id) : null,
                repo_name,
                full_name,
                private: isPrivate,
                html_url,
                description: description || null,
                language: language || null,
                default_branch: default_branch || "main",
                owner,
                status: "active",
            })
            .returning();

        return NextResponse.json({
            success: true,
            message: "Repository successfully saved in database",
            repo: newRepo[0],
            isNew: true,
        });
    } catch (error: any) {
        console.error("Error saving repository to database:", error);
        return NextResponse.json(
            { error: error.message || "Failed to save repository to database" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const repoId = req.nextUrl.searchParams.get("id");

        if (!repoId) {
            return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
        }

        await db
            .delete(repos)
            .where(
                and(
                    eq(repos.id, Number(repoId)),
                    eq(repos.user_email, userEmail)
                )
            );

        return NextResponse.json({
            success: true,
            message: "Repository removed from database",
        });
    } catch (error: any) {
        console.error("Error deleting repository from database:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete repository" },
            { status: 500 }
        );
    }
}
