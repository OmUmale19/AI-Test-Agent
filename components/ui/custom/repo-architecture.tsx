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
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    Move,
    Hand,
    Lock,
    Database,
    Layout,
    Server,
    Shield,
    CheckCircle2,
    ArrowRight,
    Zap,
    File
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

interface TreeNode {
    name: string;
    path: string;
    type: "folder" | "file";
    children?: Record<string, TreeNode>;
    fileData?: FileDescription;
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

// Helper to build recursive folder tree
function buildFileTree(files: FileDescription[]): TreeNode {
    const root: TreeNode = { name: "root", path: "", type: "folder", children: {} };

    files.forEach((file) => {
        const parts = file.path.split("/");
        let current = root;

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1;
            const currentPath = parts.slice(0, index + 1).join("/");

            if (!current.children) current.children = {};

            if (isFile) {
                current.children[part] = {
                    name: part,
                    path: currentPath,
                    type: "file",
                    fileData: file,
                };
            } else {
                if (!current.children[part]) {
                    current.children[part] = {
                        name: part,
                        path: currentPath,
                        type: "folder",
                        children: {},
                    };
                }
                current = current.children[part];
            }
        });
    });

    return root;
}

export default function RepoArchitecture({ repo, githubToken }: RepoArchitectureProps) {
    const [data, setData] = useState<ArchitectureData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<"tree_diagram" | "files" | "dataflow">("tree_diagram");
    
    // Zoom, Pan, and Canvas Coordinates (Excalidraw Style)
    const [zoom, setZoom] = useState<number>(0.85);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    // Tree Explorer state
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedFileInTree, setSelectedFileInTree] = useState<FileDescription | null>(null);
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
        app: true,
        api: true,
        components: true,
        custom: true,
    });

    const rootRef = useRef<HTMLDivElement>(null);
    const innerCanvasRef = useRef<HTMLDivElement>(null);
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
            if (result.architecture?.fileDescriptions?.length > 0) {
                setSelectedFileInTree(result.architecture.fileDescriptions[0]);
            }
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

    // Recalculate SVG connector lines relative to inner canvas container
    const updateConnectorLines = () => {
        if (!rootRef.current || !itemRefs.current.length || !innerCanvasRef.current) return;

        const innerRect = innerCanvasRef.current.getBoundingClientRect();
        const rootRect = rootRef.current.getBoundingClientRect();
        const startX = (rootRect.right - innerRect.left) / zoom;
        const startY = (rootRect.top + rootRect.height / 2 - innerRect.top) / zoom;

        const lines = itemRefs.current.map((el, index) => {
            if (!el) return null;
            const elRect = el.getBoundingClientRect();
            const endX = (elRect.left - innerRect.left) / zoom;
            const endY = (elRect.top + elRect.height / 2 - innerRect.top) / zoom;
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
    }, [data, activeView, zoom]);

    // Excalidraw Mouse Pan & Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        // Only start drag on left click and not clicking input or interactive button
        if (e.button !== 0) return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            panX: pan.x,
            panY: pan.y,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setPan({
            x: dragStartRef.current.panX + dx,
            y: dragStartRef.current.panY + dy,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomDelta = e.deltaY < 0 ? 0.05 : -0.05;
            setZoom((prev) => Math.min(1.5, Math.max(0.4, Number((prev + zoomDelta).toFixed(2)))));
        } else {
            setPan((prev) => ({
                x: prev.x - e.deltaX * 0.8,
                y: prev.y - e.deltaY * 0.8,
            }));
        }
    };

    const handleZoomIn = () => setZoom((prev) => Math.min(1.5, Number((prev + 0.1).toFixed(2))));
    const handleZoomOut = () => setZoom((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))));
    const handleResetView = () => {
        setZoom(0.85);
        setPan({ x: 0, y: 0 });
    };

    const toggleFolderNode = (path: string) => {
        setOpenFolders((prev) => ({
            ...prev,
            [path]: !prev[path],
        }));
    };

    const getFileIconComponent = (path: string, isFolder: boolean = false) => {
        if (isFolder || path.endsWith("/")) {
            return <Folder className="w-4 h-4 text-amber-400 fill-amber-400/20 flex-shrink-0" />;
        }
        if (path.endsWith(".py")) {
            return <span className="text-xs">🐍</span>;
        }
        if (path.endsWith(".tsx") || path.endsWith(".jsx")) {
            return <span className="text-sky-400 font-bold text-xs">⚛</span>;
        }
        if (path.endsWith(".ts") || path.endsWith(".js")) {
            return <Code2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
        }
        if (path.endsWith(".css")) {
            return <span className="text-pink-400 font-mono text-xs font-bold">{"{}"}</span>;
        }
        if (path.endsWith(".json") || path.includes("config")) {
            return <Settings className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
        }
        if (path.includes(".env") || path.endsWith(".txt") || path.endsWith(".md")) {
            return <FileText className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />;
        }
        return <File className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />;
    };

    const displayFiles = data?.fileDescriptions || [];
    const fileTree = React.useMemo(() => buildFileTree(displayFiles), [displayFiles]);

    // Recursive Tree Renderer for GitHub/VS Code style file hierarchy
    const renderTreeNodes = (nodes: Record<string, TreeNode>, currentDepth: number = 0) => {
        return Object.values(nodes).map((node) => {
            const isFolder = node.type === "folder";
            const isOpen = openFolders[node.path] ?? (currentDepth < 2);
            const isSelected = selectedFileInTree?.path === node.path;

            return (
                <div key={node.path} className="select-none text-xs font-mono">
                    <div
                        onClick={() => {
                            if (isFolder) {
                                toggleFolderNode(node.path);
                            } else if (node.fileData) {
                                setSelectedFileInTree(node.fileData);
                            }
                        }}
                        style={{ paddingLeft: `${currentDepth * 14 + 8}px` }}
                        className={`flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer transition-colors group ${
                            isSelected
                                ? "bg-sky-500/20 text-sky-300 font-bold"
                                : "hover:bg-zinc-850 text-zinc-300 hover:text-zinc-100"
                        }`}
                    >
                        {/* Chevron / Toggle arrow */}
                        {isFolder ? (
                            <span className="w-3.5 h-3.5 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300">
                                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </span>
                        ) : (
                            <span className="w-3.5" />
                        )}

                        {/* File / Folder icon */}
                        {getFileIconComponent(node.name, isFolder)}

                        {/* Node Label */}
                        <span className={`truncate ${isFolder ? "font-semibold text-zinc-200" : ""}`}>
                            {node.name}
                        </span>
                    </div>

                    {/* Sub-children */}
                    {isFolder && isOpen && node.children && (
                        <div className="border-l border-zinc-800/80 ml-3.5">
                            {renderTreeNodes(node.children, currentDepth + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    if (loading) {
        return (
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 shadow-xl">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto" />
                </div>
                <div className="text-center space-y-1">
                    <h5 className="font-bold text-base text-zinc-100">
                        Generating Repo Architecture
                    </h5>
                    <p className="text-xs text-zinc-400 max-w-md">
                        Inspecting repository hierarchy, building interactive tree diagram and module descriptions.
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
        <div className={`space-y-6 animate-in fade-in duration-200 ${isFullscreen ? "fixed inset-0 z-50 bg-zinc-950 p-6 overflow-y-auto" : ""}`}>
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

                <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0 flex-wrap">
                    <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center gap-1 text-xs">
                        <button
                            onClick={() => setActiveView("tree_diagram")}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
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
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeView === "files"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>All Files Tree ({displayFiles.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveView("dataflow")}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
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

                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-all border border-zinc-800 cursor-pointer"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* VIEW 1: Branching Architecture Diagram with Excalidraw-Style Pan, Drag & Zoom */}
            {activeView === "tree_diagram" && (
                <div className="space-y-3">
                    {/* Controls Toolbar */}
                    <div className="flex items-center justify-between bg-zinc-900/70 border border-zinc-800/80 p-2.5 px-4 rounded-xl text-xs">
                        <span className="text-zinc-400 flex items-center gap-2">
                            <Hand className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Click & drag to pan around canvas (Excalidraw mode) • Pinch / Scroll to zoom</span>
                        </span>

                        <div className="flex items-center gap-2">
                            <span className="text-zinc-500 font-mono text-[11px]">Zoom: {Math.round(zoom * 100)}%</span>
                            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                                <button
                                    onClick={handleZoomOut}
                                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded cursor-pointer transition-all"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={handleResetView}
                                    className="px-2 py-0.5 text-[11px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 rounded cursor-pointer transition-all flex items-center gap-1"
                                    title="Reset Position & Zoom"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reset</span>
                                </button>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded cursor-pointer transition-all"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Excalidraw-Style Interactive Canvas Viewport */}
                    <div
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                        className={`bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden relative min-h-[500px] select-none ${
                            isDragging ? "cursor-grabbing" : "cursor-grab"
                        } bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]`}
                    >
                        {/* Pan & Zoom Canvas Inner Layer */}
                        <div
                            ref={innerCanvasRef}
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                transformOrigin: "top left",
                                transition: isDragging ? "none" : "transform 0.08s ease-out",
                            }}
                            className="relative min-w-[840px] pb-6 inline-block"
                        >
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
                                            markerWidth="5"
                                            markerHeight="5"
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
                                            strokeWidth="2"
                                            fill="none"
                                            markerEnd={`url(#arrow-${idx % PALETTE.length})`}
                                            strokeLinecap="round"
                                        />
                                    );
                                })}
                            </svg>

                            {/* Main Diagram Horizontal Row Layout */}
                            <div className="flex flex-col md:flex-row items-center justify-start gap-8 md:gap-14 py-2">
                                
                                {/* 1. Left Root Repository Box */}
                                <div
                                    ref={rootRef}
                                    className="bg-zinc-900 text-white font-mono font-bold px-4 py-3 rounded-2xl border-2 border-zinc-800 shadow-2xl flex items-center gap-2.5 z-20 flex-shrink-0 self-center"
                                >
                                    <Folder className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    <span className="text-xs md:text-sm tracking-tight">{repoTitle}/</span>
                                </div>

                                {/* 2. Right Branch Rows (File Nodes + Dashed Line + Description Cards) */}
                                <div className="flex-1 space-y-2.5 w-full z-20">
                                    {displayFiles.slice(0, 12).map((file, index) => {
                                        const palette = PALETTE[index % PALETTE.length];
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2.5 w-full"
                                            >
                                                {/* File / Folder Node */}
                                                <div
                                                    ref={(el) => { itemRefs.current[index] = el; }}
                                                    className={`rounded-xl px-3.5 py-2 border-2 flex items-center gap-2.5 shadow-sm min-w-[190px] max-w-[220px] transition-all hover:scale-[1.01] cursor-default ${palette.nodeBg}`}
                                                >
                                                    {getFileIconComponent(file.path)}
                                                    <span className="font-mono font-bold text-xs truncate">
                                                        {file.name || file.path.split("/").pop()}
                                                    </span>
                                                </div>

                                                {/* Dashed Horizontal Connector Line */}
                                                <div
                                                    className="w-6 md:w-8 border-t-2 border-dashed flex-shrink-0"
                                                    style={{ borderColor: palette.color }}
                                                />

                                                {/* Right Description Card */}
                                                <div
                                                    className={`rounded-xl p-2.5 px-3.5 border-2 text-xs font-medium leading-snug flex-1 shadow-sm ${palette.descBg}`}
                                                >
                                                    <p className="line-clamp-2">{file.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW 2: GitHub / VS Code Nested Tree File Explorer (Exact GitHub Tree Layout) */}
            {activeView === "files" && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
                    
                    {/* Left Column: VS Code Style Nested Tree View */}
                    <div className="lg:col-span-5 border-r border-zinc-800/80 p-4 space-y-3 bg-zinc-900/40">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                            <div className="flex items-center gap-2">
                                <ChevronDown className="w-4 h-4 text-zinc-400" />
                                <span className="font-mono font-bold text-xs text-zinc-100">{repoTitle}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                                {displayFiles.length} files
                            </span>
                        </div>

                        {/* Search in files */}
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter tree..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-all"
                            />
                        </div>

                        {/* Interactive Tree View */}
                        <div className="space-y-0.5 overflow-y-auto max-h-[460px] pr-1">
                            {renderTreeNodes(fileTree.children || {})}
                        </div>
                    </div>

                    {/* Right Column: Selected File Deep-Dive Inspector */}
                    <div className="lg:col-span-7 p-6 bg-zinc-950 flex flex-col justify-between space-y-6">
                        {selectedFileInTree ? (
                            <div className="space-y-5">
                                {/* Header badge & File name */}
                                <div className="border-b border-zinc-800 pb-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                                            Codebase File Inspector
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                                            {selectedFileInTree.category}
                                        </span>
                                    </div>
                                    <h4 className="font-mono font-bold text-base text-zinc-100 flex items-center gap-2">
                                        {getFileIconComponent(selectedFileInTree.path)}
                                        <span>{selectedFileInTree.path}</span>
                                    </h4>
                                </div>

                                {/* Plain-English Role Description */}
                                <div className="space-y-1.5">
                                    <span className="text-xs font-bold text-zinc-400 uppercase font-mono">
                                        What this file does:
                                    </span>
                                    <div className="bg-zinc-900/90 border border-zinc-800/90 p-4 rounded-xl text-xs md:text-sm text-zinc-200 leading-relaxed font-sans shadow-inner">
                                        {selectedFileInTree.description}
                                    </div>
                                </div>

                                {/* Key Exports / Functions */}
                                {selectedFileInTree.exportsOrFunctions && (
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-bold text-zinc-400 uppercase font-mono">
                                            Key Functions & Exports:
                                        </span>
                                        <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl font-mono text-xs text-emerald-400">
                                            ⚡ {selectedFileInTree.exportsOrFunctions}
                                        </div>
                                    </div>
                                )}

                                {/* Folder Path Hierarchy */}
                                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                                    <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/70">
                                        <span className="text-[10px] text-zinc-500 uppercase block">Directory</span>
                                        <span className="text-zinc-300 font-semibold">{selectedFileInTree.folder || "Root"}</span>
                                    </div>
                                    <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/70">
                                        <span className="text-[10px] text-zinc-500 uppercase block">File Type</span>
                                        <span className="text-sky-400 font-semibold">.{selectedFileInTree.name.split(".").pop()}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-12 space-y-3 my-auto">
                                <FileCode className="w-10 h-10 text-zinc-600" />
                                <p className="text-sm font-semibold text-zinc-300">Select a file from the tree</p>
                                <p className="text-xs text-zinc-500 max-w-xs">
                                    Click on any file in the GitHub-style explorer to view its full role description and architectural tier.
                                </p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-mono">
                            <span>Repository: {repoTitle}</span>
                            <span>Default Branch: {repo?.default_branch || "main"}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW 3: Upgraded Visual Request Flow Section */}
            {activeView === "dataflow" && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
                    <div className="border-b border-zinc-800 pb-4">
                        <h4 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            <span>Application Request & Execution Pipeline</span>
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">
                            Visual lifecycle showing how client requests traverse authentication, middleware guards, API actions, and database queries.
                        </p>
                    </div>

                    {/* Step-by-step Visual Pipeline Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.dataFlow.map((step, index) => {
                            const icons = [
                                <Layout key={1} className="w-5 h-5 text-sky-400" />,
                                <Shield key={2} className="w-5 h-5 text-purple-400" />,
                                <Server key={3} className="w-5 h-5 text-blue-400" />,
                                <Database key={4} className="w-5 h-5 text-emerald-400" />,
                                <Zap key={5} className="w-5 h-5 text-amber-400" />,
                                <CheckCircle2 key={6} className="w-5 h-5 text-rose-400" />,
                            ];

                            return (
                                <div
                                    key={index}
                                    className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4.5 space-y-3 shadow-lg transition-all relative group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                                                {icons[index % icons.length]}
                                            </div>
                                            <span className="text-xs font-mono font-bold text-emerald-400">
                                                Phase 0{index + 1}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800">
                                            Step {index + 1}
                                        </span>
                                    </div>

                                    <p className="text-xs md:text-sm text-zinc-200 leading-relaxed font-medium">
                                        {step}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
