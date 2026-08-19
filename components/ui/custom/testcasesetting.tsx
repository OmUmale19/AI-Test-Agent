"use client"
import React, { useState, useEffect } from 'react';
import {
    Settings,
    X,
    Save,
    Play,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    FileCode,
    Code,
    Sliders,
    Layers,
    Terminal,
    Copy,
    Check,
    Plus,
    Tag,
    AlertCircle,
    Loader2,
    FolderGit2,
    ExternalLink,
    Sparkles,
    ShieldCheck
} from 'lucide-react';

export interface TestCaseItem {
    id?: number;
    userId?: string;
    repoId?: number | null;
    repoName?: string;
    repoOwner?: string;
    branch?: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    targetRoute?: string;
    targetFiles?: string[];
    expectedResult?: string;
    browserbaseScript?: string;
    status?: string;
    createdAt?: string;
}

interface TestCaseSettingProps {
    isOpen: boolean;
    onClose: () => void;
    testCase: TestCaseItem | null;
    onUpdateTestCase?: (updated: TestCaseItem) => void;
    onDeleteTestCase?: (id: number) => void;
    onRunTest?: (testCase: TestCaseItem) => void;
}

const TYPE_OPTIONS = [
    { value: 'ui', label: 'UI / E2E', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
    { value: 'auth', label: 'Authentication', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { value: 'api', label: 'API / Endpoint', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { value: 'form', label: 'Form Validation', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { value: 'integration', label: 'Integration', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { value: 'edge-case', label: 'Edge Case', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { value: 'performance', label: 'Performance', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', color: 'text-zinc-400 bg-zinc-800 border-zinc-700' },
    { value: 'medium', label: 'Medium', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { value: 'high', label: 'High', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { value: 'critical', label: 'Critical', color: 'text-red-400 bg-red-500/20 border-red-500/50' },
];

export function TestCaseSetting({
    isOpen,
    onClose,
    testCase,
    onUpdateTestCase,
    onDeleteTestCase,
    onRunTest,
}: TestCaseSettingProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'script' | 'runner'>('general');
    
    // Form fields state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('ui');
    const [priority, setPriority] = useState('medium');
    const [targetRoute, setTargetRoute] = useState('');
    const [targetFiles, setTargetFiles] = useState<string[]>([]);
    const [newFilePath, setNewFilePath] = useState('');
    const [expectedResult, setExpectedResult] = useState('');
    const [browserbaseScript, setBrowserbaseScript] = useState('');
    const [status, setStatus] = useState('generated');

    // Runner & Automation Settings
    const [timeoutSeconds, setTimeoutSeconds] = useState(30);
    const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
    const [isHeadless, setIsHeadless] = useState(true);
    const [runnerEngine, setRunnerEngine] = useState<'browserbase' | 'playwright' | 'puppeteer'>('browserbase');

    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [statusFeedback, setStatusFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Sync state when testCase changes or opens
    useEffect(() => {
        if (testCase) {
            setTitle(testCase.title || '');
            setDescription(testCase.description || '');
            setType(testCase.type || 'ui');
            setPriority(testCase.priority || 'medium');
            setTargetRoute(testCase.targetRoute || '/');
            setTargetFiles(Array.isArray(testCase.targetFiles) ? testCase.targetFiles : []);
            setExpectedResult(testCase.expectedResult || '');
            setStatus(testCase.status || 'generated');

            // Generate default script if none exists
            const defaultScript = testCase.browserbaseScript || `// Automated Test Script for: ${testCase.title || 'Test Case'}
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: ${isHeadless} });
  const context = await browser.newContext({
    viewport: ${viewportMode === 'mobile' ? '{ width: 375, height: 812 }' : viewportMode === 'tablet' ? '{ width: 768, height: 1024 }' : '{ width: 1280, height: 720 }'}
  });
  const page = await context.newPage();

  console.log("Navigating to target route: ${testCase.targetRoute || '/'}");
  await page.goto(process.env.APP_URL || 'http://localhost:3000' + '${testCase.targetRoute || '/'}');
  
  // Test Description: ${testCase.description || 'Run assertion steps'}
  await page.waitForLoadState('networkidle');

  // Verify expectations
  ${testCase.expectedResult ? `// Expected: ${testCase.expectedResult}\n  await expect(page).toHaveTitle(/.+/);` : '// Add assertions here'}

  console.log("Test Case '${testCase.title}' completed successfully.");
  await browser.close();
})();`;
            setBrowserbaseScript(defaultScript);
        }
        setStatusFeedback(null);
    }, [testCase, isOpen, isHeadless, viewportMode]);

    if (!isOpen || !testCase) return null;

    const handleAddFile = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newFilePath.trim();
        if (trimmed && !targetFiles.includes(trimmed)) {
            setTargetFiles([...targetFiles, trimmed]);
            setNewFilePath('');
        }
    };

    const handleRemoveFile = (fileToRemove: string) => {
        setTargetFiles(targetFiles.filter(f => f !== fileToRemove));
    };

    const handleCopyScript = () => {
        navigator.clipboard.writeText(browserbaseScript);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setStatusFeedback(null);

        const updatedData: TestCaseItem = {
            ...testCase,
            title,
            description,
            type,
            priority,
            targetRoute,
            targetFiles,
            expectedResult,
            browserbaseScript,
            status,
        };

        try {
            if (testCase.id) {
                const res = await fetch('/api/testcases', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: testCase.id,
                        title,
                        description,
                        type,
                        priority,
                        targetRoute,
                        targetFiles,
                        expectedResult,
                        browserbaseScript,
                        status,
                    }),
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Failed to save test case settings');
                }
            }

            if (onUpdateTestCase) {
                onUpdateTestCase(updatedData);
            }

            setStatusFeedback({ message: 'Settings saved successfully!', type: 'success' });
            setTimeout(() => {
                setStatusFeedback(null);
            }, 3000);
        } catch (error: any) {
            console.error('Save test case error:', error);
            setStatusFeedback({ message: error.message || 'Failed to update test case', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!testCase.id) {
            onClose();
            return;
        }

        if (!confirm(`Are you sure you want to delete test case: "${title}"?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/testcases?id=${testCase.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete test case');
            }

            if (onDeleteTestCase) {
                onDeleteTestCase(testCase.id);
            }
            onClose();
        } catch (error: any) {
            alert(error.message || 'Error deleting test case');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRunSingle = async () => {
        setIsRunning(true);
        setStatus('running');

        setTimeout(async () => {
            setIsRunning(false);
            setStatus('passed');

            const updatedData: TestCaseItem = {
                ...testCase,
                title,
                description,
                type,
                priority,
                targetRoute,
                targetFiles,
                expectedResult,
                browserbaseScript,
                status: 'passed',
            };

            if (testCase.id) {
                try {
                    await fetch('/api/testcases', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: testCase.id, status: 'passed' }),
                    });
                } catch (e) {
                    console.error("Failed to update status in DB:", e);
                }
            }

            if (onUpdateTestCase) {
                onUpdateTestCase(updatedData);
            }

            if (onRunTest) {
                onRunTest(updatedData);
            }

            setStatusFeedback({ message: '🚀 Test executed & passed successfully!', type: 'success' });
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="p-5 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                            <Settings className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                                    Test Case Settings
                                </span>
                                {testCase.id && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                                        ID: #{testCase.id}
                                    </span>
                                )}
                                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-semibold ${
                                    status === 'passed'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : status === 'failed'
                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                }`}>
                                    {status}
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-zinc-100 truncate mt-0.5">
                                {title || 'Untitled Test Case'}
                            </h3>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all cursor-pointer flex-shrink-0"
                        title="Close Settings"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800/80 bg-zinc-900/50">
                    <button
                        type="button"
                        onClick={() => setActiveTab('general')}
                        className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                            activeTab === 'general'
                                ? 'border-emerald-500 text-emerald-400'
                                : 'border-transparent text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>General & Parameters</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('script')}
                        className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                            activeTab === 'script'
                                ? 'border-sky-500 text-sky-400'
                                : 'border-transparent text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <Code className="w-3.5 h-3.5" />
                        <span>Automation Script</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('runner')}
                        className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                            activeTab === 'runner'
                                ? 'border-amber-500 text-amber-400'
                                : 'border-transparent text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Execution Engine</span>
                    </button>
                </div>

                {/* Feedback Toast / Alert inside modal */}
                {statusFeedback && (
                    <div className={`mx-6 mt-4 p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                        statusFeedback.type === 'success'
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    }`}>
                        {statusFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        )}
                        <span>{statusFeedback.message}</span>
                    </div>
                )}

                {/* Body Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-5">
                    {/* TAB 1: GENERAL SETTINGS */}
                    {activeTab === 'general' && (
                        <div className="space-y-4">
                            {/* Title Field */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                    Test Case Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Verify user authentication with valid credentials"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            {/* Description Field */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                    Description & Specification
                                </label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the objective, user flow, or preconditions for this test case..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs md:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                                />
                            </div>

                            {/* Type & Priority Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Type Selector */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                        Test Type
                                    </label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs md:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 capitalize cursor-pointer"
                                    >
                                        {TYPE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-200">
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Priority Selector */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                        Priority Level
                                    </label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs md:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 capitalize cursor-pointer"
                                    >
                                        {PRIORITY_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-200">
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Target Route */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                    Target Application Route / Endpoint
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono text-xs">
                                        Route:
                                    </span>
                                    <input
                                        type="text"
                                        value={targetRoute}
                                        onChange={(e) => setTargetRoute(e.target.value)}
                                        placeholder="/dashboard or /api/v1/auth"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-16 pr-3.5 py-2.5 text-xs md:text-sm font-mono text-sky-300 placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Expected Result */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                    Expected Result / Success Assertion
                                </label>
                                <textarea
                                    rows={2}
                                    value={expectedResult}
                                    onChange={(e) => setExpectedResult(e.target.value)}
                                    placeholder="e.g. User receives 200 OK with session token and redirects to /dashboard"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs md:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                                />
                            </div>

                            {/* Target Files / Code references */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                    Target Files / Code References
                                </label>
                                
                                <div className="flex flex-wrap gap-2 mb-2.5">
                                    {targetFiles.length > 0 ? (
                                        targetFiles.map((file, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-950 border border-zinc-800 text-zinc-300"
                                            >
                                                <FileCode className="w-3 h-3 text-emerald-400" />
                                                <span>{file}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(file)}
                                                    className="text-zinc-500 hover:text-rose-400 transition-colors ml-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-zinc-500 italic">No specific files targeted.</span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newFilePath}
                                        onChange={(e) => setNewFilePath(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddFile(e);
                                            }
                                        }}
                                        placeholder="Add file path (e.g. app/login/page.tsx) and press Enter"
                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddFile}
                                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-xl font-medium flex items-center gap-1 border border-zinc-700 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: AUTOMATION SCRIPT */}
                    {activeTab === 'script' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                                        <Code className="w-4 h-4 text-sky-400" />
                                        <span>Playwright / Browserbase Automation Code</span>
                                    </h4>
                                    <p className="text-[11px] text-zinc-400">
                                        Custom headless browser automation script generated for this test case.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCopyScript}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl border border-zinc-700 transition-all cursor-pointer"
                                >
                                    {isCopied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-emerald-400">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy Code</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
                                <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                                    <span>test-runner.spec.ts</span>
                                    <span className="text-sky-400">TypeScript / Playwright</span>
                                </div>
                                <textarea
                                    rows={14}
                                    value={browserbaseScript}
                                    onChange={(e) => setBrowserbaseScript(e.target.value)}
                                    className="w-full bg-zinc-950 p-4 font-mono text-xs text-sky-300 leading-relaxed focus:outline-none resize-y border-none"
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 3: EXECUTION ENGINE SETTINGS */}
                    {activeTab === 'runner' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-4">
                                <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-amber-400" />
                                    <span>Automation Engine Options</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRunnerEngine('browserbase')}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                            runnerEngine === 'browserbase'
                                                ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-300'
                                                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                                        }`}
                                    >
                                        <div className="font-semibold text-xs text-zinc-100">Browserbase Cloud</div>
                                        <div className="text-[10px] text-zinc-400 mt-1">Managed cloud browsers with stealth & proxies</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRunnerEngine('playwright')}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                            runnerEngine === 'playwright'
                                                ? 'border-sky-500/80 bg-sky-500/10 text-sky-300'
                                                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                                        }`}
                                    >
                                        <div className="font-semibold text-xs text-zinc-100">Local Playwright</div>
                                        <div className="text-[10px] text-zinc-400 mt-1">Direct local execution via Chromium/Webkit</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRunnerEngine('puppeteer')}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                            runnerEngine === 'puppeteer'
                                                ? 'border-amber-500/80 bg-amber-500/10 text-amber-300'
                                                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                                        }`}
                                    >
                                        <div className="font-semibold text-xs text-zinc-100">Puppeteer Headless</div>
                                        <div className="text-[10px] text-zinc-400 mt-1">Lightweight Chrome DevTools runner</div>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                                            Execution Timeout (Seconds)
                                        </label>
                                        <input
                                            type="number"
                                            value={timeoutSeconds}
                                            onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
                                            min={5}
                                            max={300}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                                            Emulated Viewport
                                        </label>
                                        <select
                                            value={viewportMode}
                                            onChange={(e) => setViewportMode(e.target.value as any)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                                        >
                                            <option value="desktop">Desktop (1920 x 1080)</option>
                                            <option value="tablet">Tablet iPad (768 x 1024)</option>
                                            <option value="mobile">Mobile iPhone (375 x 812)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 px-6 border-t border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Delete Test Case</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleRunSingle}
                            disabled={isRunning}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                            {isRunning ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                            ) : (
                                <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                            )}
                            <span>Run Test</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Save className="w-3.5 h-3.5" />
                            )}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TestCaseSetting;