"use client"
import { UserDetailsContext } from '@/context/UserDetailsContext';
import React, { useContext } from 'react'
import Image from 'next/image';
import { Plus } from 'lucide-react';
import EmptyWorkspace from './emptyworkspace';

function WorkspaceBody() {
    const { userDetails } = useContext(UserDetailsContext);

    return (
        <div className="max-w-6xl mx-auto mt-6 px-6 md:px-10 pb-12">
            {/* Header row with Title & Credits */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-100">Workspace</h2>
                <span className="text-sm font-medium text-gray-400">
                    Remaining Credits: <span className="text-amber-400 font-semibold">{userDetails?.credits ?? 100}</span>
                </span>
            </div>

            {/* Connect GitHub Card */}
            <div className="border border-gray-700/80 bg-zinc-900/60 rounded-2xl p-4 px-6 flex items-center justify-between shadow-lg backdrop-blur-sm hover:border-gray-600 transition-all mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden">
                        <Image src="/github.png" alt="GitHub" width={26} height={26} className="invert" />
                    </div>
                    <span className="text-base font-medium text-zinc-200">Connect Github &amp; Add Repo</span>
                </div>

                <button className="flex items-center gap-2 border border-zinc-600 hover:border-zinc-400 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium px-5 py-2 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95">
                    <Plus className="w-4 h-4 text-zinc-300" />
                    <span>Add</span>
                </button>
            </div>

            {/* Empty Workspace Section with Margin Spacing & Matching Styles */}
            <div className="mt-6">
                <EmptyWorkspace />
            </div>
        </div>
    )
}

export default WorkspaceBody
