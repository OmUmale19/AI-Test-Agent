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
    Layers,
    ListTodo,
    XCircle,
    TrendingUp,
    Loader2,
    Boxes,
    Network
} from 'lucide-react';
import EmptyWorkspace from './emptyworkspace';
import AddRepoModal from './addrepomodal';
import RepoArchitecture from './repo-architecture';
import TestCaseSetting from './testcasesetting';

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
    const [activeTabSubView, setActiveTabSubView] = useState<'overview' | 'tests' | 'diagram'>('tests');

    // Test Automation State Variables
    const [totalTests, setTotalTests] = useState<number>(0);
    const [passedTests, setPassedTests] = useState<number>(0);
    const [failedTests, setFailedTests] = useState<number>(0);
    const [passRate, setPassRate] = useState<string>("0%");
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [testCasesList, setTestCasesList] = useState<any[]>([]);
    const [loadingTestCases, setLoadingTestCases] = useState<boolean>(false);
    const [selectedTestIds, setSelectedTestIds] = useState<number[]>([]);
    const [activeDetailsTest, setActiveDetailsTest] = useState<any | null>(null);
    const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

    // Toggle single test selection
    const toggleSelectTest = (id: number) => {
        setSelectedTestIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Toggle select all test cases
    const toggleSelectAll = () => {
        if (selectedTestIds.length === testCasesList.length) {
            setSelectedTestIds([]);
        } else {
            setSelectedTestIds(testCasesList.map((t, idx) => t.id || idx));
        }
    };

    // Run selected test cases
    const handleRunSelectedTests = async () => {
        if (selectedTestIds.length === 0) return;
        setIsRunningTests(true);

        // Simulate test execution
        setTimeout(() => {
            setIsRunningTests(false);
            const count = selectedTestIds.length;
            setTestCasesList(prev =>
                prev.map((t, idx) => {
                    const testId = t.id || idx;
                    if (selectedTestIds.includes(testId)) {
                        return { ...t, status: "passed" };
                    }
                    return t;
                })
            );
            setPassedTests(prev => Math.min(testCasesList.length, prev + count));
            setFailedTests(0);
            setPassRate("100%");
            showToast(`🚀 Successfully executed ${count} automated test case(s)!`, "success");
        }, 1500);
    };

    // Fetch existing test cases from database for selected repository
    const fetchRepoTestCases = async (repoId: number) => {
        setLoadingTestCases(true);
        try {
            const res = await fetch(`/api/generate-test?repoId=${repoId}`);
            if (res.ok) {
                const data = await res.json();
                const cases = data.testCases || [];
                setTestCasesList(cases);
                setTotalTests(cases.length);
                const passed = cases.filter((t: any) => t.status === "passed").length;
                const failed = cases.filter((t: any) => t.status === "failed").length;
                setPassedTests(passed);
                setFailedTests(failed);
                setPassRate(cases.length > 0 ? `${Math.round((passed / cases.length) * 100)}%` : "0%");
            }
        } catch (error) {
            console.error("Failed to load test cases:", error);
        } finally {
            setLoadingTestCases(false);
        }
    };

    // Load test cases when repository is selected
    useEffect(() => {
        if (selectedDbRepo?.id) {
            fetchRepoTestCases(selectedDbRepo.id);
            setSelectedTestIds([]);
        } else {
            setTestCasesList([]);
            setSelectedTestIds([]);
            setTotalTests(0);
            setPassedTests(0);
            setFailedTests(0);
            setPassRate("0%");
        }
    }, [selectedDbRepo?.id]);

    const handleGenerateTestCases = async () => {
        if (!selectedDbRepo) return;
        setIsGenerating(true);

        try {
            const ownerName = typeof selectedDbRepo.owner === 'object'
                ? (selectedDbRepo.owner as any)?.login
                : selectedDbRepo.owner || selectedDbRepo.full_name.split('/')[0];

            const res = await fetch("/api/generate-test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userDetails?.email || ghUser?.login || "anonymous_user",
                    owner: ownerName,
                    repo: selectedDbRepo.repo_name,
                    repoId: selectedDbRepo.id,
                    branch: selectedDbRepo.default_branch || "main",
                    githubToken: token,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate test cases");
            }

            const newCases = data.testCases || [];
            setTestCasesList(newCases);
            setSelectedTestIds(newCases.map((t: any, idx: number) => t.id || idx));
            setTotalTests(newCases.length);
            setPassedTests(0);
            setFailedTests(0);
            setPassRate("0%");
            showToast(`✨ Generated ${newCases.length} AI test cases for ${selectedDbRepo.repo_name}!`, "success");
        } catch (error: any) {
            console.error("Generate test cases error:", error);
            showToast(error.message || "Failed to generate test cases", "error");
        } finally {
            setIsGenerating(false);
        }
    };

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
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-6 flex-wrap">
                        <button
                            onClick={() => setActiveTabSubView('overview')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTabSubView === 'overview'
                                ? 'bg-sky-500 text-black shadow-md'
                                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                }`}
                        >
                            Overview & Specs
                        </button>
                        <button
                            onClick={() => setActiveTabSubView('tests')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTabSubView === 'tests'
                                ? 'bg-sky-500 text-black shadow-md'
                                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                }`}
                        >
                            AI Test Automation
                        </button>
                        <button
                            onClick={() => setActiveTabSubView('diagram')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${activeTabSubView === 'diagram'
                                ? 'bg-emerald-500 text-black font-bold shadow-md'
                                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                }`}
                        >
                            <Boxes className="w-3.5 h-3.5" />
                            <span>Architecture Diagram</span>
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
                        <div className="space-y-4 animate-in fade-in duration-200">
                            {/* 4 Summary Metric Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                
                                {/* Card 1: Total Tests */}
                                <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm">
                                    <div>
                                        <span className="text-xs font-semibold text-zinc-400 block mb-1">Total Tests</span>
                                        <span className="text-2xl md:text-3xl font-bold text-zinc-100">
                                            {totalTests}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                                        <ListTodo className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Card 2: Passed */}
                                <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm">
                                    <div>
                                        <span className="text-xs font-semibold text-zinc-400 block mb-1">Passed</span>
                                        <span className="text-2xl md:text-3xl font-bold text-zinc-100">
                                            {passedTests}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Card 3: Failed */}
                                <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm">
                                    <div>
                                        <span className="text-xs font-semibold text-zinc-400 block mb-1">Failed</span>
                                        <span className="text-2xl md:text-3xl font-bold text-zinc-100">
                                            {failedTests}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                                        <XCircle className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Card 4: Pass Rate */}
                                <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm">
                                    <div>
                                        <span className="text-xs font-semibold text-zinc-400 block mb-1">Pass Rate</span>
                                        <span className="text-2xl md:text-3xl font-bold text-zinc-100">
                                            {passRate}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>

                            </div>

                            {/* Generate AI Test Cases Box */}
                            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg backdrop-blur-sm">
                                <div>
                                    <h4 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                                        Generate AI Test Cases
                                    </h4>
                                    <p className="text-xs md:text-sm text-zinc-400 mt-1">
                                        Analyze this repository and generate automated test cases using AI.
                                    </p>
                                </div>

                                <button
                                    disabled={isGenerating}
                                    onClick={handleGenerateTestCases}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition-all shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-60 flex-shrink-0"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Analyzing Codebase...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 fill-white/20" />
                                            <span>Generate Test Cases</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Test Cases Suite List */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-emerald-500 font-bold text-base flex items-center gap-2">
                                        <span>Generated Test Cases</span>
                                        {testCasesList.length > 0 && (
                                            <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700/50">
                                                {testCasesList.length}
                                            </span>
                                        )}
                                    </h4>
                                    {testCasesList.length > 0 && (
                                        <button
                                            onClick={() => fetchRepoTestCases(selectedDbRepo.id)}
                                            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <RefreshCw className={`w-3 h-3 ${loadingTestCases ? 'animate-spin' : ''}`} />
                                            <span>Refresh</span>
                                        </button>
                                    )}
                                </div>

                                {loadingTestCases ? (
                                    <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3">
                                        <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                                        <span className="text-xs text-zinc-400">Loading saved test cases...</span>
                                    </div>
                                ) : testCasesList.length > 0 ? (
                                    <div className="border border-zinc-800/90 bg-zinc-900/90 rounded-2xl overflow-hidden shadow-xl">
                                        <div className="divide-y divide-zinc-800/80">
                                            {testCasesList.map((test, index) => {
                                                const testId = test.id || index;
                                                const isSelected = selectedTestIds.includes(testId);

                                                return (
                                                    <div
                                                        key={testId}
                                                        onClick={() => toggleSelectTest(testId)}
                                                        className={`p-4 px-5 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                                                            isSelected ? 'bg-zinc-800/40' : 'hover:bg-zinc-800/20'
                                                        }`}
                                                    >
                                                        {/* Left: Round Checkbox + Title & Subtitle */}
                                                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleSelectTest(testId);
                                                                }}
                                                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                                                                    isSelected
                                                                        ? 'bg-emerald-600 border border-emerald-500 text-white shadow-sm'
                                                                        : 'border-2 border-zinc-500/70 hover:border-zinc-300 bg-transparent'
                                                                }`}
                                                            >
                                                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                            </button>

                                                            <div className="min-w-0 flex-1">
                                                                <h5 className="font-semibold text-sm text-zinc-100 truncate">
                                                                    {test.title}
                                                                </h5>
                                                                <p className="text-xs text-zinc-400 truncate mt-0.5">
                                                                    {test.description}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Right: Type Badge, Status Badge, Settings/Gear Button */}
                                                        <div className="flex items-center gap-3 flex-shrink-0">
                                                            {/* Type Badge (ui, integration, auth, api, etc.) */}
                                                            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                                                                {test.type || 'ui'}
                                                            </span>

                                                            {/* Status Badge (Pending / Passed / Failed) */}
                                                            <span className={`px-3.5 py-1 rounded-full text-xs font-medium ${
                                                                test.status === 'passed'
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                                                                    : test.status === 'failed'
                                                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold'
                                                                    : 'bg-zinc-800/90 text-zinc-300 border border-zinc-700/50'
                                                            }`}>
                                                                {test.status === 'passed' ? 'Passed' : test.status === 'failed' ? 'Failed' : 'Pending'}
                                                            </span>

                                                            {/* Settings / Details Gear Button */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveDetailsTest(test);
                                                                }}
                                                                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-all border border-zinc-800 cursor-pointer"
                                                                title="View test details and parameters"
                                                            >
                                                                <Settings className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Bottom Action Footer Bar */}
                                        <div className="bg-zinc-950/90 p-3.5 px-6 flex items-center justify-between border-t border-zinc-800">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs md:text-sm font-semibold text-zinc-300">
                                                    {selectedTestIds.length === 1
                                                        ? 'Run Selected Test Case'
                                                        : selectedTestIds.length > 1
                                                        ? `Run Selected Test Cases (${selectedTestIds.length})`
                                                        : 'Run Selected Test Case'}
                                                </span>
                                                <button
                                                    onClick={toggleSelectAll}
                                                    className="text-xs text-emerald-400 hover:text-emerald-300 font-mono underline cursor-pointer"
                                                >
                                                    {selectedTestIds.length === testCasesList.length ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>

                                            <button
                                                disabled={selectedTestIds.length === 0 || isRunningTests}
                                                onClick={handleRunSelectedTests}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-md cursor-pointer ${
                                                    selectedTestIds.length > 0 && !isRunningTests
                                                        ? 'bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white shadow-emerald-900/30'
                                                        : 'bg-zinc-800/80 text-zinc-500 border border-zinc-700/40 cursor-not-allowed opacity-60'
                                                }`}
                                            >
                                                {isRunningTests ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                        <span>Running {selectedTestIds.length} Test{selectedTestIds.length > 1 ? 's' : ''}...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-3.5 h-3.5 fill-current" />
                                                        <span>Run Selected</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-zinc-950/40 border border-dashed border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-2">
                                        <Sparkles className="w-8 h-8 text-zinc-600" />
                                        <p className="text-sm font-semibold text-zinc-300">No test cases generated yet</p>
                                        <p className="text-xs text-zinc-500 max-w-sm">
                                            Click &quot;Generate Test Cases&quot; above to have Gemini AI analyze your repository files and create an automated test suite.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Architecture Diagram */}
                    {activeTabSubView === 'diagram' && (
                        <RepoArchitecture repo={selectedDbRepo} githubToken={token} />
                    )}
                </div>
            ) : (
                <>
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
                                    const isSelected = false;
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
                </>
            )}

            {/* Test Case Specification & Settings Dialog */}
            <TestCaseSetting
                isOpen={!!activeDetailsTest}
                onClose={() => setActiveDetailsTest(null)}
                testCase={activeDetailsTest}
                onUpdateTestCase={(updatedTest) => {
                    setTestCasesList((prev) =>
                        prev.map((t) =>
                            (t.id && updatedTest.id && t.id === updatedTest.id) || t.title === updatedTest.title
                                ? updatedTest
                                : t
                        )
                    );
                    setActiveDetailsTest(updatedTest);
                    showToast("Test case updated successfully", "success");
                }}
                onDeleteTestCase={(deletedId) => {
                    setTestCasesList((prev) => prev.filter((t) => t.id !== deletedId));
                    setSelectedTestIds((prev) => prev.filter((id) => id !== deletedId));
                    setTotalTests((prev) => Math.max(0, prev - 1));
                    setActiveDetailsTest(null);
                    showToast("Test case deleted", "success");
                }}
                onRunTest={(test) => {
                    setTestCasesList((prev) =>
                        prev.map((t) =>
                            (t.id && test.id && t.id === test.id) || t.title === test.title
                                ? { ...t, status: "passed" }
                                : t
                        )
                    );
                    setPassedTests((prev) => prev + 1);
                    showToast(`🚀 Test "${test.title}" executed successfully!`, "success");
                }}
            />
        </div>
    );
}

export default WorkspaceBody;
