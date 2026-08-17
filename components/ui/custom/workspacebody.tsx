"use client"
import { UserDetailsContext } from '@/context/UserDetailsContext';
import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Plus,
    Search,
    Lock,
    Globe,
    Star,
    GitBranch,
    ExternalLink,
    CheckCircle2,
    RefreshCw,
    Settings,
    FolderGit2,
    Zap,
    Database,
    Trash2,
    Play,
    Code2,
    Check,
    ArrowLeft,
    Sparkles,
    FileCode,
    ShieldCheck,
    Layers
} from 'lucide-react';
import EmptyWorkspace from './emptyworkspace';
import AddRepoModal from './addrepomodal';

interface GitHubUser {
    login: string;
    avatar_url: string;
    html_url: string;
    name: string | null;
}

interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    default_branch: string;
    updated_at: string;
    language?: string | null;
    owner?: any;
}

interface DbRepo {
    id: number;
    user_email: string;
    github_repo_id: number | null;
    repo_name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string | null;
    updated_at: string;
    language: string | null;
    default_branch: string;
    owner: string;
    status: string;
    created_at: string;
}

function WorkspaceBody() {
    const { userDetails } = useContext(UserDetailsContext);
    const [token, setToken] = useState<string | null>(null);
    const [ghUser, setGhUser] = useState<GitHubUser | null>(null);
    const [ghRepos, setGhRepos] = useState<GitHubRepo[]>([]);
    const [dbRepos, setDbRepos] = useState<DbRepo[]>([]);

    const [loadingGh, setLoadingGh] = useState<boolean>(true);
    const [loadingDb, setLoadingDb] = useState<boolean>(true);

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'db' | 'github'>('db');
    const [selectedDbRepo, setSelectedDbRepo] = useState<DbRepo | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [savingRepoName, setSavingRepoName] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [activeTabSubView, setActiveTabSubView] = useState<'overview' | 'tests' | 'settings'>('overview');

    const handleSetupGitHub = () => {
        window.location.href = '/api/github';
    };

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Fetch repositories saved in Database
    const fetchDbRepos = async () => {
        setLoadingDb(true);
        try {
            const res = await fetch("/api/user-repo");
            if (res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    const fetchedDbRepos: DbRepo[] = data.repos || [];
                    setDbRepos(fetchedDbRepos);

                    // If current selectedDbRepo exists in list, update it
                    if (selectedDbRepo) {
                        const match = fetchedDbRepos.find(r => r.id === selectedDbRepo.id);
                        if (match) setSelectedDbRepo(match);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load database repositories:", error);
        } finally {
            setLoadingDb(false);
        }
    };

    // Fetch GitHub OAuth & API data
    const fetchGitHubData = async () => {
        setLoadingGh(true);
        try {
            const res = await fetch("/api/github/repos");
            if (res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    setToken(data.ghToken || null);
                    setGhUser(data.user || null);
                    setGhRepos(Array.isArray(data.repos) ? data.repos : []);
                }
            }
        } catch (error) {
            console.error("Failed to load GitHub data:", error);
        } finally {
            setLoadingGh(false);
        }
    };

    useEffect(() => {
        fetchDbRepos();
        fetchGitHubData();
    }, []);

    // Save a repository to Database
    const handleSaveRepoToDb = async (repoPayload: any) => {
        const repoFullName = repoPayload.full_name;
        setSavingRepoName(repoFullName);

        try {
            const res = await fetch("/api/user-repo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(repoPayload),
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const textMsg = await res.text();
                throw new Error(`Server returned error (${res.status}): ${textMsg.substring(0, 100)}`);
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to save repository");
            }

            showToast(data.message || `Saved "${repoPayload.repo_name}" to Database!`);
            await fetchDbRepos();
            setActiveTab('db');

            if (data.repo) {
                setSelectedDbRepo(data.repo);
            }
        } catch (error: any) {
            showToast(error.message || "Failed to save repository to database", "error");
        } finally {
            setSavingRepoName(null);
        }
    };

    // Delete a repo from Database
    const handleDeleteDbRepo = async (id: number, repoName: string) => {
        if (!confirm(`Are you sure you want to remove "${repoName}" from Database?`)) return;

        try {
            const res = await fetch(`/api/user-repo?id=${id}`, { method: "DELETE" });
            const contentType = res.headers.get("content-type");
            
            if (res.ok && contentType && contentType.includes("application/json")) {
                showToast(`Removed "${repoName}" from Database.`);
                if (selectedDbRepo?.id === id) {
                    setSelectedDbRepo(null);
                }
                await fetchDbRepos();
            } else {
                const data = contentType && contentType.includes("application/json") ? await res.json() : null;
                showToast(data?.error || "Failed to delete repository", "error");
            }
        } catch (err: any) {
            showToast("Failed to delete repository", "error");
        }
    };

    const isRepoSavedInDb = (fullName: string) => {
        return dbRepos.some(r => r.full_name.toLowerCase() === fullName.toLowerCase());
    };

    const filteredDbRepos = dbRepos.filter(repo =>
        repo.repo_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredGhRepos = ghRepos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto mt-6 px-6 md:px-10 pb-16">

            {/* Notification Toast */}
            {toastMessage && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs md:text-sm font-semibold border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${toastMessage.type === 'success'
                        ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
                    }`}>
                    {toastMessage.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <Settings className="w-5 h-5 text-rose-400" />
                    )}
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* Modal for adding repos */}
            <AddRepoModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                availableRepos={ghRepos}
                onRepoAdded={fetchDbRepos}
                onSetupGitHub={handleSetupGitHub}
                hasToken={!!token}
            />

            {/* Header row with Title & Credits */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2.5">
                        <FolderGit2 className="w-6 h-6 text-sky-400" />
                        <span>Workspace & Database Repos</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                        Connect repositories, store details in PostgreSQL, and execute AI test suites
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-xl backdrop-blur-md self-start md:self-auto">
                    <span className="text-xs md:text-sm font-medium text-gray-400">
                        Remaining Credits: <span className="text-amber-400 font-semibold">{userDetails?.credits ?? 100}</span>
                    </span>
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black transition-all shadow-sm active:scale-95"
                    >
                        <Zap className="w-3 h-3 fill-black" />
                        <span>Upgrade</span>
                    </Link>
                </div>
            </div>

            {/* Connect / Authorized GitHub Banner */}
            <div className="border border-zinc-800 bg-zinc-900/60 rounded-2xl p-4 px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg backdrop-blur-sm hover:border-zinc-700 transition-all mb-6">
                <div className="flex items-center gap-4">
                    {ghUser?.avatar_url ? (
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-500/80 shadow-md">
                            <Image
                                src={ghUser.avatar_url}
                                alt={ghUser.login}
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden flex-shrink-0">
                            <Image src="/github.png" alt="GitHub" width={26} height={26} className="invert" />
                        </div>
                    )}

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-zinc-200">
                                {ghUser ? (ghUser.name || `@${ghUser.login}`) : "Connect GitHub & Add Repo"}
                            </span>
                            {token && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    Authorized
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-zinc-400">
                            {ghUser ? `Logged in as @${ghUser.login} • Neon PostgreSQL Connected` : "Authorize GitHub to sync repositories & store in Neon DB"}
                        </span>
                    </div>
                </div>

                {/* Right Action Options */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                    {!token ? (
                        <button
                            onClick={handleSetupGitHub}
                            className="flex items-center gap-2 border border-sky-500/40 hover:border-sky-400 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-semibold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer active:scale-95 text-xs md:text-sm"
                        >
                            <Settings className="w-4 h-4 text-sky-400" />
                            <span>Setup GitHub</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSetupGitHub}
                            title="Re-authorize GitHub"
                            className="flex items-center gap-1.5 border border-zinc-700 hover:border-zinc-500 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer text-xs"
                        >
                            <Settings className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Re-sync GitHub</span>
                        </button>
                    )}

                    {/* Add Repo Button */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-1.5 border border-emerald-500/60 hover:border-emerald-400 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer active:scale-95 text-xs md:text-sm"
                    >
                        <Plus className="w-4 h-4 text-emerald-300" />
                        <span>Add Repo to DB</span>
                    </button>
                </div>
            </div>

            {/* Active Stored Repo Workbench View (When user selects a saved repo to work on) */}
            {selectedDbRepo ? (
                <div className="border border-sky-500/40 bg-zinc-900/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md mb-8 animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => setSelectedDbRepo(null)}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all mt-0.5"
                                title="Back to Repositories list"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                                        <Database className="w-3 h-3 text-sky-400" />
                                        Stored in Database
                                    </span>
                                    {selectedDbRepo.private ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                            Private
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                            Public
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-zinc-100 mt-1 flex items-center gap-2">
                                    <span>{selectedDbRepo.full_name}</span>
                                </h3>
                                <p className="text-xs text-zinc-400 mt-1">
                                    {selectedDbRepo.description || "No description provided for this repository."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href={selectedDbRepo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>GitHub Link</span>
                            </a>
                            <button
                                onClick={() => handleDeleteDbRepo(selectedDbRepo.id, selectedDbRepo.repo_name)}
                                className="p-2 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent rounded-xl transition-all"
                                title="Delete from Database"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Workbench Tabs */}
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-6">
                        <button
                            onClick={() => setActiveTabSubView('overview')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTabSubView === 'overview'
                                    ? 'bg-sky-500 text-black'
                                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                }`}
                        >
                            Overview & Specs
                        </button>
                        <button
                            onClick={() => setActiveTabSubView('tests')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTabSubView === 'tests'
                                    ? 'bg-sky-500 text-black'
                                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                }`}
                        >
                            AI Test Automation
                        </button>
                    </div>

                    {/* Tab 1: Overview */}
                    {activeTabSubView === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-zinc-950/70 border border-zinc-800 p-4 rounded-xl">
                                <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">Default Branch</span>
                                <p className="text-sm font-semibold text-zinc-200 mt-1 flex items-center gap-2 font-mono">
                                    <GitBranch className="w-4 h-4 text-sky-400" />
                                    {selectedDbRepo.default_branch}
                                </p>
                            </div>
                            <div className="bg-zinc-950/70 border border-zinc-800 p-4 rounded-xl">
                                <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">Primary Language</span>
                                <p className="text-sm font-semibold text-zinc-200 mt-1 flex items-center gap-2 font-mono">
                                    <Code2 className="w-4 h-4 text-amber-400" />
                                    {selectedDbRepo.language || 'TypeScript'}
                                </p>
                            </div>
                            <div className="bg-zinc-950/70 border border-zinc-800 p-4 rounded-xl">
                                <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">Database ID</span>
                                <p className="text-sm font-semibold text-zinc-200 mt-1 flex items-center gap-2 font-mono">
                                    <Database className="w-4 h-4 text-emerald-400" />
                                    #{selectedDbRepo.id}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Test Automation */}
                    {activeTabSubView === 'tests' && (
                        <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                                <div>
                                    <h4 className="font-semibold text-sm text-zinc-200 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                        Generate AI Unit & E2E Test Suite
                                    </h4>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        Parse code structure in branch <span className="font-mono text-zinc-300">{selectedDbRepo.default_branch}</span> and generate test cases.
                                    </p>
                                </div>
                                <button
                                    onClick={() => showToast(`Triggered AI Test Suite Generation for ${selectedDbRepo.repo_name}`)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-black transition-all shadow-md cursor-pointer active:scale-95"
                                >
                                    <Play className="w-3.5 h-3.5 fill-black" />
                                    <span>Run AI Suite</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
                                    <span className="text-zinc-400 flex items-center gap-2">
                                        <FileCode className="w-4 h-4 text-sky-400" />
                                        Target Language
                                    </span>
                                    <span className="font-mono text-zinc-200 font-semibold">{selectedDbRepo.language || 'TypeScript'}</span>
                                </div>
                                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
                                    <span className="text-zinc-400 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        CI/CD Gatekeeper
                                    </span>
                                    <span className="font-mono text-emerald-400 font-semibold">Enabled</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}

            {/* Navigation Tabs: Database Repos vs All GitHub Repos */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 p-3 px-5 rounded-2xl mb-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('db')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${activeTab === 'db'
                                ? 'bg-sky-500 text-black shadow-md'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }`}
                    >
                        <Database className="w-4 h-4" />
                        <span>Database Repos</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'db' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300'
                            }`}>
                            {dbRepos.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('github')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${activeTab === 'github'
                                ? 'bg-sky-500 text-black shadow-md'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }`}
                    >
                        <Layers className="w-4 h-4" />
                        <span>All GitHub Repos</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'github' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300'
                            }`}>
                            {ghRepos.length}
                        </span>
                    </button>
                </div>

                {/* Search Bar & Refresh */}
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search repositories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500/60 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => { fetchDbRepos(); fetchGitHubData(); }}
                        className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-all"
                        title="Refresh Repositories"
                    >
                        <RefreshCw className={`w-4 h-4 ${loadingDb || loadingGh ? 'animate-spin text-sky-400' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Repositories Main List */}
            {activeTab === 'db' ? (
                /* TAB 1: DATABASE REPOSITORIES */
                loadingDb ? (
                    <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-10 flex flex-col items-center justify-center space-y-4">
                        <RefreshCw className="w-7 h-7 text-sky-400 animate-spin" />
                        <p className="text-sm text-zinc-400 font-medium">Fetching Repositories from Database...</p>
                    </div>
                ) : filteredDbRepos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDbRepos.map((repo) => {
                            const isSelected = selectedDbRepo?.id === repo.id;
                            return (
                                <div
                                    key={repo.id}
                                    className={`group border ${isSelected
                                            ? 'border-sky-500 bg-sky-500/10'
                                            : 'border-zinc-800/90 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                                        } rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2 truncate">
                                                {repo.private ? (
                                                    <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                                ) : (
                                                    <Globe className="w-4 h-4 text-sky-400 flex-shrink-0" />
                                                )}
                                                <h3 className="font-bold text-sm md:text-base text-zinc-100 group-hover:text-sky-300 transition-colors truncate">
                                                    {repo.repo_name}
                                                </h3>
                                            </div>

                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                                                <Database className="w-3 h-3 text-emerald-400" />
                                                In Database
                                            </span>
                                        </div>

                                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                                            {repo.description || `Connected repository ${repo.full_name}`}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 font-mono text-[11px]">
                                                <GitBranch className="w-3 h-3 text-zinc-400" />
                                                {repo.default_branch}
                                            </span>
                                            {repo.language && (
                                                <span className="text-[11px] font-mono text-zinc-400">
                                                    {repo.language}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDeleteDbRepo(repo.id, repo.repo_name)}
                                                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-all"
                                                title="Delete from DB"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <a
                                                href={repo.html_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
                                                title="Open in GitHub"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                            <button
                                                onClick={() => setSelectedDbRepo(repo)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isSelected
                                                        ? 'bg-sky-500 text-black'
                                                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                                                    }`}
                                            >
                                                {isSelected ? 'Active' : 'Work on Repo'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-4">
                        <EmptyWorkspace onAddRepo={() => setIsAddModalOpen(true)} />
                    </div>
                )
            ) : (
                /* TAB 2: GITHUB REPOSITORIES */
                loadingGh ? (
                    <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-10 flex flex-col items-center justify-center space-y-4">
                        <RefreshCw className="w-7 h-7 text-sky-400 animate-spin" />
                        <p className="text-sm text-zinc-400 font-medium">Fetching GitHub Repositories...</p>
                    </div>
                ) : token && filteredGhRepos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredGhRepos.map((repo) => {
                            const isSaved = isRepoSavedInDb(repo.full_name);
                            const isSaving = savingRepoName === repo.full_name;
                            const ownerName = typeof repo.owner === 'object' ? repo.owner?.login : repo.owner || repo.full_name.split('/')[0];

                            return (
                                <div
                                    key={repo.id}
                                    className="group border border-zinc-800/90 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80 rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2 truncate">
                                                {repo.private ? (
                                                    <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                                ) : (
                                                    <Globe className="w-4 h-4 text-sky-400 flex-shrink-0" />
                                                )}
                                                <h3 className="font-semibold text-sm md:text-base text-zinc-100 group-hover:text-sky-300 transition-colors truncate">
                                                    {repo.name}
                                                </h3>
                                            </div>

                                            {isSaved ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                    Saved in DB
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-zinc-800 text-zinc-400 border-zinc-700 flex-shrink-0">
                                                    {repo.private ? 'Private' : 'Public'}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                                            {repo.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 font-mono text-[11px]">
                                                <GitBranch className="w-3 h-3 text-zinc-400" />
                                                {repo.default_branch}
                                            </span>
                                            {repo.stargazers_count > 0 && (
                                                <span className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                                                    <Star className="w-3 h-3 fill-amber-400" />
                                                    {repo.stargazers_count}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <a
                                                href={repo.html_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
                                                title="Open in GitHub"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                            <button
                                                disabled={isSaving}
                                                onClick={() => handleSaveRepoToDb({
                                                    github_repo_id: repo.id,
                                                    repo_name: repo.name,
                                                    full_name: repo.full_name,
                                                    private: repo.private,
                                                    html_url: repo.html_url,
                                                    description: repo.description || '',
                                                    language: repo.language || 'TypeScript',
                                                    default_branch: repo.default_branch,
                                                    owner: ownerName,
                                                })}
                                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isSaved
                                                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                                        : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                                                    }`}
                                            >
                                                {isSaving ? (
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                                                ) : isSaved ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                ) : (
                                                    <Plus className="w-3.5 h-3.5" />
                                                )}
                                                <span>{isSaved ? 'Sync DB' : 'Setup & Save to DB'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-4">
                        <EmptyWorkspace onAddRepo={handleSetupGitHub} />
                    </div>
                )
            )}
        </div>
    );
}

export default WorkspaceBody;
