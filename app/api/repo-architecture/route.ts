import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { cookies } from "next/headers";

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
    ".prisma",
    ".sql",
];

const IGNORE_PATHS = [
    "node_modules",
    ".next",
    "dist",
    "build",
    "git",
    ".git",
    "coverage",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".png",
    ".jpg",
    ".jpeg",
    ".svg",
    ".webp",
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
    "prisma/schema.prisma",
    "app/page.tsx",
    "app/layout.tsx",
    "app/globals.css",
    "app/api/route.ts",
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

async function fetchGithubApi(url: string, githubToken?: string) {
    const headers: Record<string, string> = {
        "User-Agent": "AI-Test-Automation",
        Accept: "application/vnd.github+json",
    };

    if (githubToken && githubToken !== "undefined" && githubToken.trim() !== "") {
        headers["Authorization"] = `Bearer ${githubToken}`;
    }

    let res = await fetch(url, { headers });

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
    let res = await fetchGithubApi(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        githubToken
    );

    if (!res.ok && branch !== "main") {
        res = await fetchGithubApi(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
            githubToken
        );
    }

    if (!res.ok && branch !== "master") {
        res = await fetchGithubApi(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
            githubToken
        );
    }

    if (!res.ok) {
        return FALLBACK_CANDIDATE_PATHS.map((path) => ({ path, type: "blob" }));
    }

    const data = await res.json();
    const usefulFiles = (data.tree || [])
        .filter((item: any) => item.type === "blob")
        .filter((item: any) => isUsefulFile(item.path));

    if (usefulFiles.length === 0) {
        return FALLBACK_CANDIDATE_PATHS.map((path) => ({ path, type: "blob" }));
    }

    return usefulFiles.slice(0, 35);
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
                    content: rawContent.slice(0, 4000),
                };
            }
        }
    } catch (_) {}

    try {
        const res = await fetchGithubApi(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
            githubToken
        );

        if (res.ok) {
            const data = await res.json();
            if (data.content) {
                const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");
                return {
                    path,
                    content: decodedContent.slice(0, 4000),
                };
            }
        }
    } catch (_) {}

    return null;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const cookieStore = await cookies();
        const rawToken = body.githubToken || cookieStore.get("gh_token")?.value || process.env.GITHUB_TOKEN;
        const githubToken = rawToken && rawToken !== "undefined" && rawToken.trim() !== "" ? rawToken : undefined;

        const {
            owner,
            repo,
            branch = "main",
        } = body;

        if (!owner || !repo) {
            return NextResponse.json(
                { error: "Repository owner and repo name are required" },
                { status: 400 }
            );
        }

        const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
        if (!geminiApiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured in .env" },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        // 1. Fetch file list
        const repoFiles = await getRepoTree({ owner, repo, branch, githubToken });

        // 2. Read priority files
        const keyFilesToRead = repoFiles.slice(0, 15);
        const fileContents = await Promise.all(
            keyFilesToRead.map((file: any) =>
                readGithubFile({ owner, repo, branch, path: file.path, githubToken })
            )
        );

        const validFiles = fileContents.filter(Boolean);
        const repoContext = validFiles.length > 0
            ? validFiles.map((f: any) => `File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join("\n\n")
            : `Repository: ${owner}/${repo}\nBranch: ${branch}\nFiles:\n${repoFiles.map((f: any) => f.path).join("\n")}`;

        const allPathsList = repoFiles.map((f: any) => f.path);

        // 3. Prompt Gemini for comprehensive architectural breakdown and file descriptions
        const prompt = `You are a Principal Software Architect.
Analyze the codebase files and directory structure of the repository: "${owner}/${repo}".

Repository Files Available:
${allPathsList.join("\n")}

Code Samples Context:
${repoContext}

Generate a comprehensive Architectural Blueprint and File Directory Explanation:
1. summary: A high-level 2-3 sentence explanation of the system architecture, framework, and flow.
2. layers: Key architectural tiers (e.g. "Presentation / UI", "Authentication & Middleware", "API & Server Actions", "Database & ORM", "Configuration & Tooling").
   For each layer, include:
   - name: Layer name
   - description: What this layer handles
   - iconType: one of 'ui', 'auth', 'api', 'db', 'config', 'util'
   - files: Array of file paths belonging to this layer
3. fileDescriptions: For EVERY file in the repository file list, provide:
   - path: The relative file path (e.g. "app/page.tsx", "package.json")
   - name: File basename
   - folder: Parent directory (e.g. "app", "db", "lib", "root")
   - category: One of 'ui', 'api', 'auth', 'database', 'config', 'util'
   - description: Clear 1-2 sentence explanation of WHAT THIS FILE DOES, its key responsibilities, and how it connects with other files.
   - exportsOrFunctions: Short string or array of key features/exports in this file.
4. dataFlow: 3 to 6 key steps explaining the end-to-end data/request flow (e.g. "1. User navigates to /dashboard -> 2. Middleware validates Clerk session -> 3. Server action queries Neon DB").
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
                                summary: { type: Type.STRING },
                                techStack: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                },
                                layers: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            iconType: { type: Type.STRING },
                                            files: {
                                                type: Type.ARRAY,
                                                items: { type: Type.STRING },
                                            },
                                        },
                                        required: ["name", "description", "iconType", "files"],
                                    },
                                },
                                fileDescriptions: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            path: { type: Type.STRING },
                                            name: { type: Type.STRING },
                                            folder: { type: Type.STRING },
                                            category: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            exportsOrFunctions: { type: Type.STRING },
                                        },
                                        required: ["path", "name", "folder", "category", "description"],
                                    },
                                },
                                dataFlow: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                },
                            },
                            required: ["summary", "layers", "fileDescriptions", "dataFlow"],
                        },
                    },
                });

                if (response?.text) {
                    break;
                }
            } catch (err: any) {
                console.warn(`Architecture generation fallback from ${modelName}:`, err.message);
                lastError = err;
            }
        }

        if (!response || !response.text) {
            throw new Error(lastError?.message || "Failed to generate architecture diagram");
        }

        const architectureData = JSON.parse(response.text);

        return NextResponse.json({
            success: true,
            architecture: architectureData,
        });
    } catch (error: any) {
        console.error("Architecture API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze repository architecture" },
            { status: 500 }
        );
    }
}
