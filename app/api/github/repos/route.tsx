import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const ghToken = cookieStore.get("gh_token")?.value; // Github token 

        if (!ghToken) {
            return NextResponse.json({ error: "Unauthorized", user: null, repos: [] }, { status: 401 });
        }

        // Fetch user profile
        const userRes = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${ghToken}`,
                "User-Agent": "AI-Test-Automation",
            },
            next: { revalidate: 60 }
        });
        const user = userRes.ok ? await userRes.json() : null;

        // Fetch all repositories across pages
        let allRepos: any[] = [];
        let page = 1;

        while (true) {
            const reposRes = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=100&page=${page}`, {
                headers: {
                    Authorization: `Bearer ${ghToken}`,
                    "User-Agent": "AI-Test-Automation",
                },
                next: { revalidate: 60 }
            });

            if (!reposRes.ok) break;

            const data = await reposRes.json();
            if (!Array.isArray(data) || data.length === 0) break;

            allRepos.push(...data);

            if (data.length < 100) break;
            page++;
        }

        const mappedRepos = allRepos.map((r: any) => ({
            id: r.id,
            name: r.name,
            full_name: r.full_name,
            private: r.private,
            html_url: r.html_url,
            description: r.description,
            updated_at: r.updated_at,
            language: r.language,
            default_branch: r.default_branch,
        }));

        return NextResponse.json({
            ghToken,
            user,
            repos: mappedRepos,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch GitHub repositories", user: null, repos: [] },
            { status: 500 }
        );
    }
}
