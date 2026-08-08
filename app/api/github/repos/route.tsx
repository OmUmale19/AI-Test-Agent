import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const ghToken = cookieStore.get("gh_token")?.value;

        if (!ghToken) {
            return NextResponse.json({ error: "Unauthorized", user: null, repos: [] }, { status: 401 });
        }

        const [userRes, reposRes] = await Promise.all([
            fetch("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${ghToken}`,
                    "User-Agent": "AI-Test-Automation",
                },
                next: { revalidate: 60 }
            }),
            fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
                headers: {
                    Authorization: `Bearer ${ghToken}`,
                    "User-Agent": "AI-Test-Automation",
                },
                next: { revalidate: 60 }
            })
        ]);

        const user = userRes.ok ? await userRes.json() : null;
        const repos = reposRes.ok ? await reposRes.json() : [];

        return NextResponse.json({
            ghToken,
            user,
            repos: Array.isArray(repos) ? repos : [],
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch GitHub repositories", user: null, repos: [] },
            { status: 500 }
        );
    }
}
