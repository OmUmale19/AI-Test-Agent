"use client"
import React, { useState } from 'react';
import {
    X,
    Plus,
    FolderGit2,
    Search,
    Globe,
    Lock,
    CheckCircle2,
    Loader2,
    Link as LinkIcon
} from 'lucide-react';

interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string | null;
    default_branch: string;
    language?: string | null;
    owner?: { login: string } | string;
}

interface AddRepoModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableRepos: GitHubRepo[];
    onRepoAdded: () => void;
    onSetupGitHub: () => void;
    hasToken: boolean;
}

export default function AddRepoModal({
    isOpen,
    onClose,
    availableRepos,
    onRepoAdded,
    onSetupGitHub,
    hasToken
}: AddRepoModalProps) {
    const [activeTab, setActiveTab] = useState<'select' | 'manual'>('select');
    const [searchQuery, setSearchQuery] = useState('');
    const [savingRepoId, setSavingRepoId] = useState<number | string | null>(null);
    const [manualUrl, setManualUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const filteredGitHubRepos = availableRepos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const saveRepoToDb = async (repoPayload: any, repoIdKey: number | string) => {
        setSavingRepoId(repoIdKey);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const res = await fetch("/api/user-repo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(repoPayload),
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const textErr = await res.text();
                throw new Error(`Server returned error (${res.status}): ${textErr.substring(0, 100)}`);
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to save repository to database");
            }

            setSuccessMsg(data.message || "Repository successfully saved in database!");
            onRepoAdded();
            setTimeout(() => {
                onClose();
                setSuccessMsg(null);
            }, 1200);
        } catch (err: any) {
            console.error("Save repo error:", err);
            setErrorMsg(err.message || "Something went wrong while saving repository");
        } finally {
            setSavingRepoId(null);
        }
    };

    const handleSaveFromGitHub = (repo: GitHubRepo) => {
        const ownerName = typeof repo.owner === 'object' ? repo.owner.login : repo.owner || repo.full_name.split('/')[0];
        const payload = {
            github_repo_id: repo.id,
            repo_name: repo.name,
            full_name: repo.full_name,
            private: repo.private,
            html_url: repo.html_url,
            description: repo.description || '',
            language: repo.language || 'TypeScript',
            default_branch: repo.default_branch || 'main',
            owner: ownerName,
        };
        saveRepoToDb(payload, repo.id);
    };

    const handleSaveManual = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualUrl.trim()) return;

        // Parse owner/repo from URL or string
        let cleanInput = manualUrl.trim();
        cleanInput = cleanInput.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
        const parts = cleanInput.split('/').filter(Boolean);

        if (parts.length < 2) {
            setErrorMsg("Please enter a valid repo in format 'owner/repo-name' or full GitHub URL");
            return;
        }

        const owner = parts[0];
        const repoName = parts[1];
        const fullName = `${owner}/${repoName}`;

        const payload = {
            repo_name: repoName,
            full_name: fullName,
            private: false,
            html_url: `https://github.com/${fullName}`,
            description: "Custom connected repository",
            language: "JavaScript",
            default_branch: "main",
            owner: owner,
        };

        saveRepoToDb(payload, fullName);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                            <FolderGit2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-zinc-100">Add & Store Repository</h3>
                            <p className="text-xs text-zinc-400">Save GitHub repo to Database for automated testing workflows</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-800 bg-zinc-950/50 px-6">
                    <button
                        onClick={() => setActiveTab('select')}
                        className={`py-3 px-4 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'select'
                                ? 'border-sky-400 text-sky-400'
                                : 'border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                    >
                        Select from GitHub
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`py-3 px-4 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'manual'
                                ? 'border-sky-400 text-sky-400'
                                : 'border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                    >
                        Manual Repository URL
                    </button>
                </div>

                {/* Status messages */}
                {errorMsg && (
                    <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {activeTab === 'select' ? (
                        <>
                            {!hasToken ? (
                                <div className="text-center py-8 px-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/30">
                                    <Globe className="w-10 h-10 mx-auto text-zinc-500 mb-3" />
                                    <h4 className="text-sm font-semibold text-zinc-200 mb-1">GitHub Not Authorized</h4>
                                    <p className="text-xs text-zinc-400 mb-4 max-w-sm mx-auto">
                                        Authorize GitHub to fetch your repositories directly or enter details manually.
                                    </p>
                                    <button
                                        onClick={onSetupGitHub}
                                        className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold rounded-xl transition-all cursor-pointer"
                                    >
                                        Authorize GitHub
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            type="text"
                                            placeholder="Search GitHub repositories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                                        {filteredGitHubRepos.length === 0 ? (
                                            <p className="text-xs text-center text-zinc-500 py-6">
                                                No GitHub repositories match your search.
                                            </p>
                                        ) : (
                                            filteredGitHubRepos.map((repo) => {
                                                const isSaving = savingRepoId === repo.id;
                                                return (
                                                    <div
                                                        key={repo.id}
                                                        className="flex items-center justify-between p-3.5 px-4 bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden mr-3">
                                                            {repo.private ? (
                                                                <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                                            ) : (
                                                                <Globe className="w-4 h-4 text-sky-400 flex-shrink-0" />
                                                            )}
                                                            <div className="truncate">
                                                                <h4 className="text-xs md:text-sm font-semibold text-zinc-100 truncate">
                                                                    {repo.full_name}
                                                                </h4>
                                                                <p className="text-[11px] text-zinc-400 truncate">
                                                                    Branch: <span className="font-mono text-zinc-300">{repo.default_branch}</span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <button
                                                            disabled={isSaving}
                                                            onClick={() => handleSaveFromGitHub(repo)}
                                                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
                                                        >
                                                            {isSaving ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                                                            ) : (
                                                                <Plus className="w-3.5 h-3.5" />
                                                            )}
                                                            <span>{isSaving ? 'Saving...' : 'Add to DB'}</span>
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <form onSubmit={handleSaveManual} className="space-y-4 pt-2">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                    GitHub Repository URL or Name
                                </label>
                                <div className="relative">
                                    <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="e.g. facebook/react or https://github.com/owner/repo"
                                        value={manualUrl}
                                        onChange={(e) => setManualUrl(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>
                                <p className="text-[11px] text-zinc-400 mt-1.5">
                                    Enter full repository URL or <span className="font-mono text-zinc-300">owner/repo-name</span> format.
                                </p>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingRepoId !== null}
                                    className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-black bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {savingRepoId ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    <span>Store in Database</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}
