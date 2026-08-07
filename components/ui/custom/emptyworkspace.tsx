import React from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'

interface EmptyWorkspaceProps {
    onAddRepo?: () => void;
}

export default function EmptyWorkspace({ onAddRepo }: EmptyWorkspaceProps) {
    return (
        <div className="border border-gray-700/80 bg-zinc-900/60 rounded-2xl p-8 md:p-12 shadow-lg backdrop-blur-sm hover:border-gray-600 transition-all flex flex-col items-center justify-center text-center">
            {/* Folder Icon SVG with Transparent Background */}
            <div className="relative w-48 h-40 mb-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105">
                <Image
                    src="/folder.svg"
                    alt="Empty Workspace Folder"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <h3 className="text-lg font-bold text-zinc-100 tracking-wide">
                No Repositories Connected
            </h3>

            <p className="text-xs md:text-sm text-zinc-400 mt-2 max-w-md leading-relaxed">
                Connect your GitHub repository to generate automated AI test suites, trigger CI/CD webhooks, and monitor code quality.
            </p>

            <button
                onClick={onAddRepo}
                className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs md:text-sm bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-black transition-all duration-200 shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer"
            >
                <Image src="/link.png" alt="Add Repo" width={20} height={20} />
                <span>Connect GitHub Repository</span>
            </button>
        </div>
    )
}