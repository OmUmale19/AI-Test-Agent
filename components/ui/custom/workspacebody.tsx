"use client"
import { UserDetailsContext } from '@/context/UserDetailsContext';
import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
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
    FolderGit2
} from 'lucide-react';
import EmptyWorkspace from './emptyworkspace';

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
}

function WorkspaceBody() {
    const { userDetails } = useContext(UserDetailsContext);
    const [token, setToken] = useState<string | null>(null);
    const [ghUser, setGhUser] = useState<GitHubUser | null>(null);
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);

    const handleSetup = () => {
        window.location.href = '/api/github';
    };

    const fetchGitHubData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/github/repos");
            const data = await res.json();
            setToken(data.ghToken || null);
            setGhUser(data.user || null);
            setRepos(Array.isArray(data.repos) ? data.repos : []);
        } catch (error) {
            console.error("Failed to load GitHub data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGitHubData();
    }, []);

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto mt-6 px-6 md:px-10 pb-12">
            {/* Header row with Title & Credits */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2.5">
                        <FolderGit2 className="w-6 h-6 text-sky-400" />
                        <span>Workspace</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">Manage your connected GitHub repositories and AI test suites</p>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-xl backdrop-blur-md">
                    <span className="text-xs md:text-sm font-medium text-gray-400">
                        Remaining Credits: <span className="text-amber-400 font-semibold">{userDetails?.credits ?? 100}</span>
                    </span>
                </div>
            </div>

            {/* Connect / Authorized GitHub Card */}
            <div className="border border-gray-700/80 bg-zinc-900/60 rounded-2xl p-4 px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg backdrop-blur-sm hover:border-gray-600 transition-all mb-6">
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
                            {ghUser ? `Logged in as @${ghUser.login} • Accessing GitHub API` : "Authorize GitHub to sync repositories & trigger automated testing"}
                        </span>
                    </div>
                </div>

                {/* Right Action Options */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                    {!token ? (
                        <button
                            onClick={handleSetup}
                            className="flex items-center gap-2 border border-sky-500/40 hover:border-sky-400 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer active:scale-95 text-xs md:text-sm"
                        >
                            <Settings className="w-4 h-4 text-sky-400" />
                            <span>Setup GitHub</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            {/* Setup option always available when authorized */}
                            <button
                                onClick={handleSetup}
                                title="Re-authorize or change GitHub settings"
                                className="flex items-center gap-1.5 border border-zinc-700 hover:border-zinc-500 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 text-xs"
                            >
                                <Settings className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Setup</span>
                            </button>

                            {/* Add Repository option */}
                            <button
                                onClick={handleSetup}
                                className="flex items-center gap-1.5 border border-emerald-600/50 hover:border-emerald-400 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-medium px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 text-xs"
                            >
                                <Plus className="w-4 h-4 text-emerald-300" />
                                <span>Add Repo</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Repositories Info / Main Workspace View */}
            {loading ? (
                <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="w-7 h-7 text-sky-400 animate-spin" />
                    <p className="text-sm text-zinc-400 font-medium">Fetching GitHub Repositories...</p>
                </div>
            ) : token && repos.length > 0 ? (
                <div className="space-y-4">
                    {/* Repository Search & Filter Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-zinc-900/40 border border-zinc-800/80 p-3.5 px-5 rounded-2xl">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500/60 transition-all"
                            />
                        </div>

                        <div className="flex items-center justify-between w-full md:w-auto gap-3">
                            <span className="text-xs text-zinc-400 font-medium">
                                Showing <span className="text-zinc-200 font-bold">{filteredRepos.length}</span> of {repos.length} repos
                            </span>
                            <button
                                onClick={fetchGitHubData}
                                className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
                                title="Refresh Repositories"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Repository Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredRepos.map((repo) => {
                            const isSelected = selectedRepoId === repo.id;
                            return (
                                <div
                                    key={repo.id}
                                    className={`group border ${isSelected ? 'border-sky-500 bg-sky-500/10' : 'border-zinc-800/90 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'} rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between`}
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
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${repo.private ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-sky-500/10 text-sky-300 border-sky-500/20'}`}>
                                                {repo.private ? 'Private' : 'Public'}
                                            </span>
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
                                                onClick={() => setSelectedRepoId(repo.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isSelected ? 'bg-sky-500 text-black' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'}`}
                                            >
                                                {isSelected ? 'Active' : 'Setup Tests'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="mt-6">
                    <EmptyWorkspace onAddRepo={handleSetup} />
                </div>
            )}
        </div>
    );
}

export default WorkspaceBody;
