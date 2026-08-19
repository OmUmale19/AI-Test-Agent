"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Boxes,
    Folder,
    FileCode,
    Search,
    Sparkles,
    RefreshCw,
    Code2,
    Settings,
    FileText,
    Activity,
    Workflow,
    Info,
    ExternalLink
} from "lucide-react";

interface FileDescription {
    path: string;
    name: string;
    folder: string;
    category: "ui" | "api" | "auth" | "database" | "config" | "util" | string;
    description: string;
    exportsOrFunctions?: string;
}

interface ArchitectureLayer {
    name: string;
    description: string;
    iconType: string;
    files: string[];
}

interface ArchitectureData {
    summary: string;
    techStack?: string[];
    layers: ArchitectureLayer[];
    fileDescriptions: FileDescription[];
    dataFlow: string[];
}

interface RepoArchitectureProps {
    repo: any;
    githubToken?: string | null;
}

const PALETTE = [
    {
        name: "blue",
        color: "#3b82f6",
        nodeBg: "bg-blue-50 border-blue-300 text-blue-950 dark:bg-blue-950/40 dark:border-blue-500/40 dark:text-blue-100",
        descBg: "bg-blue-50/70 border-blue-200 text-blue-950 dark:bg-blue-950/20 dark:border-blue-500/30 dark:text-blue-200",
    },
    {
        name: "purple",
        color: "#a855f7",
        nodeBg: "bg-purple-50 border-purple-300 text-purple-950 dark:bg-purple-950/40 dark:border-purple-500/40 dark:text-purple-100",
        descBg: "bg-purple-50/70 border-purple-200 text-purple-950 dark:bg-purple-950/20 dark:border-purple-500/30 dark:text-purple-200",
    },
    {
        name: "green",
        color: "#10b981",
        nodeBg: "bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:text-emerald-100",
        descBg: "bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-emerald-200",
    },
    {
        name: "amber",
        color: "#f59e0b",
        nodeBg: "bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-100",
        descBg: "bg-amber-50/70 border-amber-200 text-amber-950 dark:bg-amber-950/20 dark:border-amber-500/30 dark:text-amber-200",
    },
    {
        name: "rose",
        color: "#f43f5e",
        nodeBg: "bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/40 dark:border-rose-500/40 dark:text-rose-100",
        descBg: "bg-rose-50/70 border-rose-200 text-rose-950 dark:bg-rose-950/20 dark:border-rose-500/30 dark:text-rose-200",
    },
    {
        name: "gray",
        color: "#64748b",
        nodeBg: "bg-zinc-100 border-zinc-300 text-zinc-900 dark:bg-zinc-900/60 dark:border-zinc-700 dark:text-zinc-100",
        descBg: "bg-zinc-50 border-zinc-200 text-zinc-800 dark:bg-zinc-900/20 dark:border-zinc-800 dark:text-zinc-300",
    },
    {
        name: "cyan",
        color: "#06b6d4",
        nodeBg: "bg-cyan-50 border-cyan-300 text-cyan-950 dark:bg-cyan-950/40 dark:border-cyan-500/40 dark:text-cyan-100",
        descBg: "bg-cyan-50/70 border-cyan-200 text-cyan-950 dark:bg-cyan-950/20 dark:border-cyan-500/30 dark:text-cyan-200",
    },
    {
        name: "indigo",
        color: "#6366f1",
        nodeBg: "bg-indigo-50 border-indigo-300 text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-500/40 dark:text-indigo-100",
        descBg: "bg-indigo-50/70 border-indigo-200 text-indigo-950 dark:bg-indigo-950/20 dark:border-indigo-500/30 dark:text-indigo-200",
    },
];

export default function RepoArchitecture({ repo, githubToken }: RepoArchitectureProps) {
    const [data, setData] = useState<ArchitectureData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<"tree_diagram" | "files" | "dataflow">("tree_diagram");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const rootRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [svgLines, setSvgLines] = useState<{ x1: number; y1: number; x2: number; y2: number; color: string }[]>([]);

    const fetchArchitecture = async () => {
        if (!repo) return;
        setLoading(true);
        setError(null);

        try {
            const ownerName = typeof repo.owner === "object"
                ? repo.owner?.login
                : repo.owner || repo.full_name?.split("/")[0];

            const res = await fetch("/api/repo-architecture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    owner: ownerName,
                    repo: repo.repo_name || repo.name,
                    branch: repo.default_branch || "main",
                    githubToken,
                }),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || "Failed to analyze architecture");
            }

            setData(result.architecture);
        } catch (err: any) {
            console.error("Fetch architecture error:", err);
            setError(err.message || "Failed to generate architecture diagram");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArchitecture();
    }, [repo?.id, repo?.repo_name]);

    // Recalculate SVG connector lines on window resize or data change
    const updateConnectorLines = () => {
        if (!rootRef.current || !itemRefs.current.length) return;
        const container = rootRef.current.parentElement;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const rootRect = rootRef.current.getBoundingClientRect();
        const startX = rootRect.right - containerRect.left;
        const startY = rootRect.top + rootRect.height / 2 - containerRect.top;

        const lines = itemRefs.current.map((el, index) => {
            if (!el) return null;
            const elRect = el.getBoundingClientRect();
            const endX = elRect.left - containerRect.left;
            const endY = elRect.top + elRect.height / 2 - containerRect.top;
            const palette = PALETTE[index % PALETTE.length];
            return {
                x1: startX,
                y1: startY,
                x2: endX,
                y2: endY,
                color: palette.color,
            };
        }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number; color: string }[];

        setSvgLines(lines);
    };

    useEffect(() => {
        if (data && activeView === "tree_diagram") {
            const timeout = setTimeout(updateConnectorLines, 150);
            window.addEventListener("resize", updateConnectorLines);
            return () => {
                clearTimeout(timeout);
                window.removeEventListener("resize", updateConnectorLines);
            };
        }
    }, [data, activeView]);

    const getFileIconComponent = (path: string) => {
        if (path.endsWith("/")) {
            return <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20 flex-shrink-0" />;
        }
        if (path.endsWith(".py")) {
            return (
                <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-500">
                    🐍
                </div>
            );
        }
        if (path.endsWith(".tsx") || path.endsWith(".jsx")) {
            return (
                <div className="w-5 h-5 rounded-md bg-sky-500/10 flex items-center justify-center text-xs font-bold text-sky-400">
                    ⚛️
                </div>
            );
        }
        if (path.endsWith(".ts") || path.endsWith(".js")) {
            return <Code2 className="w-5 h-5 text-amber-500 flex-shrink-0" />;
        }
        if (path.endsWith(".json") || path.endsWith(".config.ts") || path.endsWith(".config.js")) {
            return <Settings className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
        }
        if (path.includes(".env") || path.endsWith(".txt") || path.endsWith(".md")) {
            return <FileText className="w-5 h-5 text-rose-400 flex-shrink-0" />;
        }
        return <FileCode className="w-5 h-5 text-zinc-400 flex-shrink-0" />;
    };

    const displayFiles = data?.fileDescriptions || [];

    if (loading) {
        return (
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 shadow-xl">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto" />
                </div>
                <div className="text-center space-y-1">
                    <h5 className="font-bold text-base text-zinc-100">
                        Generating Repository Architecture Diagram with Gemini AI...
                    </h5>
                    <p className="text-xs text-zinc-400 max-w-md">
                        Inspecting files, mapping module hierarchy, and generating architecture connections.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-zinc-950/70 border border-rose-900/40 rounded-2xl p-8 text-center space-y-3">
                <p className="text-sm font-semibold text-rose-400">{error}</p>
                <button
                    onClick={fetchArchitecture}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                </button>
            </div>
        );
    }

    if (!data) return null;

    const repoTitle = repo?.repo_name || repo?.name || "repository";

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Sub-navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 p-4 px-5 rounded-2xl shadow-lg">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950 border border-emerald-600/60 text-emerald-300 font-mono font-bold text-xs uppercase tracking-wide">
                        2. REPOSITORY / MODULE ARCHITECTURE
                    </div>
                    <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed pt-1">
                        {data.summary}
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
                    <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center gap-1 text-xs">
                        <button
                            onClick={() => setActiveView("tree_diagram")}
                            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeView === "tree_diagram"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            <Workflow className="w-3.5 h-3.5" />
                            <span>Module Architecture</span>
                        </button>
                        <button
                            onClick={() => setActiveView("files")}
                            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeView === "files"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>All Files ({displayFiles.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveView("dataflow")}
                            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeView === "dataflow"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Request Flow</span>
                        </button>
                    </div>

                    <button
                        onClick={fetchArchitecture}
                        className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-all border border-zinc-800 cursor-pointer"
                        title="Re-analyze Architecture"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* VIEW 1: Branching Architecture Diagram (Exact Format from Screenshot) */}
            {activeView === "tree_diagram" && (
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl overflow-x-auto relative">
                    
                    {/* SVG Connector Overlay */}
                    <svg className="absolute inset-0 pointer-events-none w-full h-full z-10 hidden md:block">
                        <defs>
                            {PALETTE.map((p, idx) => (
                                <marker
                                    key={idx}
                                    id={`arrow-${idx}`}
                                    viewBox="0 0 10 10"
                                    refX="6"
                                    refY="5"
                                    markerWidth="6"
                                    markerHeight="6"
                                    orient="auto-start-reverse"
                                >
                                    <path d="M 0 1 L 8 5 L 0 9 z" fill={p.color} />
                                </marker>
                            ))}
                        </defs>
                        {svgLines.map((line, idx) => {
                            const midX = (line.x1 + line.x2) / 2;
                            const path = `M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2 - 4} ${line.y2}`;
                            return (
                                <path
                                    key={idx}
                                    d={path}
                                    stroke={line.color}
                                    strokeWidth="2.5"
                                    fill="none"
                                    markerEnd={`url(#arrow-${idx % PALETTE.length})`}
                                    strokeLinecap="round"
                                />
                            );
                        })}
                    </svg>

                    {/* Main Diagram Container */}
                    <div className="flex flex-col md:flex-row items-center md:items-center justify-start gap-8 md:gap-16 min-w-[760px] py-4">
                        
                        {/* 1. Left Root Repository Box */}
                        <div
                            ref={rootRef}
                            className="bg-zinc-900 text-white font-mono font-bold px-5 py-4 rounded-2xl border-2 border-zinc-800 shadow-2xl flex items-center gap-3 z-20 flex-shrink-0"
                        >
                            <Folder className="w-6 h-6 text-amber-400 fill-amber-400" />
                            <span className="text-sm md:text-base tracking-tight">{repoTitle}/</span>
                        </div>

                        {/* 2. Right Branch Rows (File Nodes + Dashed Line + Description Cards) */}
                        <div className="flex-1 space-y-4 w-full z-20">
                            {displayFiles.slice(0, 10).map((file, index) => {
                                const palette = PALETTE[index % PALETTE.length];
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 w-full"
                                    >
                                        {/* File / Folder Node */}
                                        <div
                                            ref={(el) => { itemRefs.current[index] = el; }}
                                            className={`rounded-2xl px-4 py-3 border-2 flex items-center gap-3 shadow-md min-w-[210px] max-w-[240px] transition-all hover:scale-[1.02] cursor-default ${palette.nodeBg}`}
                                        >
                                            {getFileIconComponent(file.path)}
                                            <span className="font-mono font-bold text-xs md:text-sm truncate">
                                                {file.name || file.path.split("/").pop()}
                                            </span>
                                        </div>

                                        {/* Dashed Horizontal Connector Line */}
                                        <div
                                            className="w-8 md:w-12 border-t-2 border-dashed flex-shrink-0"
                                            style={{ borderColor: palette.color }}
                                        />

                                        {/* Right Description Card */}
                                        <div
                                            className={`rounded-2xl p-3 px-4 border-2 text-xs md:text-sm font-medium leading-snug flex-1 shadow-md ${palette.descBg}`}
                                        >
                                            <p>{file.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW 2: All File Explanations Table / Cards */}
            {activeView === "files" && (
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 p-3 px-4 rounded-2xl">
                        <Search className="w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search files or descriptions..."
                            className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {displayFiles
                            .filter((f) =>
                                f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                f.description.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((file, fIdx) => {
                                const palette = PALETTE[fIdx % PALETTE.length];
                                return (
                                    <div
                                        key={fIdx}
                                        className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2 hover:border-zinc-700 transition-colors shadow-md"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                {getFileIconComponent(file.path)}
                                                <span className="font-mono font-bold text-xs text-zinc-100">
                                                    {file.path}
                                                </span>
                                            </div>
                                            <span
                                                className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold"
                                                style={{ color: palette.color, backgroundColor: `${palette.color}15` }}
                                            >
                                                {file.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-300 leading-relaxed">
                                            {file.description}
                                        </p>
                                        {file.exportsOrFunctions && (
                                            <span className="text-[10px] font-mono text-zinc-500 block pt-1">
                                                ⚡ Exports: {file.exportsOrFunctions}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* VIEW 3: Request & Data Lifecycle */}
            {activeView === "dataflow" && (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
                    <div>
                        <h5 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span>End-to-End Application Request & Data Lifecycle</span>
                        </h5>
                        <p className="text-xs text-zinc-400 mt-1">
                            Trace how user actions travel through client components, auth middleware, API routes, and database models.
                        </p>
                    </div>

                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-sky-500 before:to-purple-500">
                        {data.dataFlow.map((step, index) => (
                            <div key={index} className="relative group">
                                <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-zinc-900 border-2 border-emerald-400 flex items-center justify-center" />
                                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1 shadow-sm">
                                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                                        Phase {index + 1}
                                    </span>
                                    <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                                        {step}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
