import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { cookies } from "next/headers";
import { eq, and, desc } from "drizzle-orm";

const ALLOWED_EXTENSIONS = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".md",
    ".py",
    ".go",
    ".java",
    ".rs",
    ".html",
    ".css",
];

const IMPORTANT_FILES = [
    "package.json",
    "next.config",
    "middleware",
    "app/",
    "pages/",
    "components/",
    "src/",
    "lib/",
    "utils/",
    "actions/",
    "api/",
    "server/",
    "db/",
    "models/",
    "routes/",
];

const IGNORE_PATHS = [
    "node_modules",
    ".next",
    "dist",
    "build",
    "git",
    ".git",
    "coverage",
    "public",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".png",
    ".jpg",
    ".jpeg",
    ".svg",
    ".webp",
    ".mp4",
    ".mov",
    ".ico",
    ".woff",
    ".woff2",
];

const FALLBACK_CANDIDATE_PATHS = [
    "package.json",
    "tsconfig.json",
    "next.config.ts",
    "next.config.js",
    "middleware.ts",
    "db/schema.ts",
    "app/page.tsx",
    "app/layout.tsx",
    "app/sign-in/[[...sign-in]]/page.tsx",
    "app/sign-up/[[...sign-up]]/page.tsx",
    "components/dashboard-client.tsx",
    "lib/actions/files.ts",
    "lib/actions/folders.ts",
    "README.md",
];

function isUsefulFile(path: string) {
    const isIgnored = IGNORE_PATHS.some((item) => path.includes(item));
    const isAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
        path.toLowerCase().endsWith(ext)
    );
    return !isIgnored && isAllowedExtension;
}

// Resilient GitHub API request helper with automatic 401 retry
async function fetchGithubApi(url: string, githubToken?: string) {
    const headers: Record<string, string> = {
        "User-Agent": "AI-Test-Automation",
        Accept: "application/vnd.github+json",
    };

    if (githubToken && githubToken !== "undefined" && githubToken.trim() !== "") {
        headers["Authorization"] = `Bearer ${githubToken}`;
    }

    let res = await fetch(url, { headers });

    // If 401 Bad credentials, retry without Authorization header (works for public repositories)
    if (res.status === 401 && headers["Authorization"]) {
        delete headers["Authorization"];
        res = await fetch(url, { headers });
    }

    return res;
}

async function getRepoTree({
    owner,
    repo,
    branch,
    githubToken,
}: {
    owner: string;
    repo: string;
    branch: string;
    githubToken?: string;
}) {
    // Try specified branch first
    let res = await fetchGithubApi(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        githubToken
    );

    // If specified branch failed, try 'main'
    if (!res.ok && branch !== "main") {
        res = await fetchGithubApi(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
            githubToken
        );
    }

    // If still failed, try 'master'
    if (!res.ok && branch !== "master") {
        res = await fetchGithubApi(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
            githubToken
        );
    }

    // If REST API is rate-limited (403) or unavailable, gracefully switch to raw file crawler
    if (!res.ok) {
        console.warn(`GitHub REST API rate limited (${res.status}), using raw candidate files.`);
        return FALLBACK_CANDIDATE_PATHS.map((path) => ({
            path,
            type: "blob",
        }));
    }

    const data = await res.json();

    const usefulFiles = (data.tree || [])
        .filter((item: any) => item.type === "blob")
        .filter((item: any) => isUsefulFile(item.path));

    if (usefulFiles.length === 0) {
        return FALLBACK_CANDIDATE_PATHS.map((path) => ({ path, type: "blob" }));
    }

    // Sort to prioritize important files like package.json, app/ routes, components/
    usefulFiles.sort((a: any, b: any) => {
        const aIsImportant = IMPORTANT_FILES.some((f) => a.path.includes(f));
        const bIsImportant = IMPORTANT_FILES.some((f) => b.path.includes(f));
        if (aIsImportant && !bIsImportant) return -1;
        if (!aIsImportant && bIsImportant) return 1;
        return a.path.localeCompare(b.path);
    });

    return usefulFiles.slice(0, 25);
}

async function readGithubFile({
    owner,
    repo,
    path,
    branch,
    githubToken,
}: {
    owner: string;
    repo: string;
    path: string;
    branch: string;
    githubToken?: string;
}) {
    // 1. Try raw.githubusercontent.com first (not subject to 60 req/hr REST API rate limit)
    try {
        const rawRes = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
            {
                headers: { "User-Agent": "AI-Test-Automation" },
                next: { revalidate: 60 },
            }
        );

        if (rawRes.ok) {
            const rawContent = await rawRes.text();
            if (rawContent && rawContent.trim() !== "404: Not Found") {
                return {
                    path,
                    content: rawContent.slice(0, 5000),
                };
            }
        }
    } catch (_) {}

    // 2. Fallback to GitHub REST contents API
    try {
        const res = await fetchGithubApi(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
            githubToken
        );

        if (res.ok) {
            const data = await res.json();
            if (data.content) {
                const decodedContent = Buffer.from(
                    data.content,
                    "base64"
                ).toString("utf-8");

                return {
                    path,
                    content: decodedContent.slice(0, 5000),
                };
            }
        }
    } catch (_) {}

    return null;
}

export async function GET(req: NextRequest) {
    try {
        const repoId = req.nextUrl.searchParams.get("repoId");
        const repoName = req.nextUrl.searchParams.get("repoName");
        const repoOwner = req.nextUrl.searchParams.get("repoOwner");

        const conditions = [];
        if (repoId) {
            conditions.push(eq(TestCasesTable.repoId, Number(repoId)));
        }
        if (repoName) {
            conditions.push(eq(TestCasesTable.repoName, repoName));
        }
        if (repoOwner) {
            conditions.push(eq(TestCasesTable.repoOwner, repoOwner));
        }

        const testCases = conditions.length > 0
            ? await db.select().from(TestCasesTable).where(and(...conditions)).orderBy(desc(TestCasesTable.createdAt))
            : await db.select().from(TestCasesTable).orderBy(desc(TestCasesTable.createdAt));

        return NextResponse.json({ success: true, testCases });
    } catch (error: any) {
        console.error("Error fetching test cases:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch test cases" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const cookieStore = await cookies();
        const rawToken = body.githubToken || cookieStore.get("gh_token")?.value || process.env.GITHUB_TOKEN;
        const githubToken = rawToken && rawToken !== "undefined" && rawToken.trim() !== "" ? rawToken : undefined;

        const {
            userId = "user",
            owner,
            repo,
            repoId,
            branch = "main",
        } = body;

        if (!owner || !repo) {
            return NextResponse.json(
                {
                    error: "Repository owner and repo name are required",
                },
                { status: 400 }
            );
        }

        const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
        if (!geminiApiKey) {
            return NextResponse.json(
                {
                    error: "GEMINI_API_KEY is not configured in environment variables (.env)",
                },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({
            apiKey: geminiApiKey,
        });

        // 1. Get repo tree (with automatic fallback to raw candidate files on rate limits)
        const repoFiles = await getRepoTree({
            owner,
            repo,
            branch,
            githubToken,
        });

        // 2. Read useful files via raw.githubusercontent.com & API
        const fileContents = await Promise.all(
            repoFiles.map((file: any) =>
                readGithubFile({
                    owner,
                    repo,
                    branch,
                    path: file.path,
                    githubToken,
                })
            )
        );

        const validFiles = fileContents.filter(Boolean);

        // 3. Prepare compact repo context
        const repoContext = validFiles.length > 0
            ? validFiles.map((file: any) => `File Path: ${file.path}\nFile Content:\n${file.content}`).join("\n\n--------------------\n\n")
            : `Repository: ${owner}/${repo}\nDefault Branch: ${branch}\nDescription: Full stack web application with UI components, authentication, routing, and backend integrations.`;

        // 4. Ask Gemini to generate test cases with metadata
        const prompt = `You are an expert QA automation engineer.
Analyze the GitHub repository source code and generate useful automated test cases.
Your goal:
Generate test cases that can later be converted into Playwright / Browserbase automation scripts.

Repository:
Owner: ${owner}
Repo: ${repo}
Branch: ${branch}

Repository File Context:
${repoContext}

Generate 6 to 12 realistic test cases.

Each test case must include:
- title: clear test case title
- description: clear concise description
- type: one of ui, auth, api, form, integration, edge-case
- priority: low, medium, high
- targetRoute: most likely app route/page to test (e.g. /sign-in, /dashboard, /api/users)
- targetFiles: related file paths from the repository context
- expectedResult: what should happen when the test passes

Important rules:
- Only use file paths that exist in the repository context or standard app structure.
- If route is unclear, infer from Next.js app/page structure.
- Keep description short and actionable.
- Return only valid JSON adhering to the provided schema.
`;

        const candidateModels = [
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-flash-latest",
            "gemini-flash-lite-latest",
            "gemini-3.7-flash",
        ];

        let response: any = null;
        let lastError: any = null;

        for (const modelName of candidateModels) {
            try {
                response = await ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                testCases: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: {
                                                type: Type.STRING,
                                            },
                                            description: {
                                                type: Type.STRING,
                                            },
                                            type: {
                                                type: Type.STRING,
                                                enum: [
                                                    "ui",
                                                    "auth",
                                                    "api",
                                                    "form",
                                                    "integration",
                                                    "edge-case",
                                                ],
                                            },
                                            priority: {
                                                type: Type.STRING,
                                                enum: ["low", "medium", "high"],
                                            },
                                            targetRoute: {
                                                type: Type.STRING,
                                            },
                                            targetFiles: {
                                                type: Type.ARRAY,
                                                items: {
                                                    type: Type.STRING,
                                                },
                                            },
                                            expectedResult: {
                                                type: Type.STRING,
                                            },
                                        },
                                        required: [
                                            "title",
                                            "description",
                                            "type",
                                            "priority",
                                            "targetRoute",
                                            "targetFiles",
                                            "expectedResult",
                                        ],
                                    },
                                },
                            },
                            required: ["testCases"],
                        },
                    },
                });

                if (response?.text) {
                    break;
                }
            } catch (err: any) {
                console.warn(`Gemini model ${modelName} unavailable (${err.message}), trying fallback...`);
                lastError = err;
            }
        }

        if (!response || !response.text) {
            throw new Error(lastError?.message || "All Gemini models are temporarily experiencing high demand. Please try again in a few seconds.");
        }

        const aiResult = JSON.parse(response.text || "{}");
        const testCases = aiResult.testCases || [];

        if (!testCases.length) {
            return NextResponse.json(
                {
                    error: "Gemini did not generate any test cases",
                },
                { status: 400 }
            );
        }

        // 5. Save generated test cases to Neon DB
        const insertedTestCases = await db
            .insert(TestCasesTable)
            .values(
                testCases.map((testCase: any) => ({
                    userId,
                    repoId: repoId ? Number(repoId) : null,
                    repoName: repo,
                    repoOwner: owner,
                    branch,

                    title: testCase.title,
                    description: testCase.description,
                    type: testCase.type,
                    priority: testCase.priority,

                    targetRoute: testCase.targetRoute,
                    targetFiles: testCase.targetFiles || [],
                    expectedResult: testCase.expectedResult,

                    status: "generated",
                }))
            )
            .returning();

        return NextResponse.json({
            success: true,
            message: "Test cases generated successfully",
            count: insertedTestCases.length,
            testCases: insertedTestCases,
        });
    } catch (error: any) {
        console.error("Generate test cases error:", error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to generate test cases",
            },
            { status: 500 }
        );
    }
}