import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Workspaceheader() {
    return (
        <div className='relative flex items-center justify-between p-4 px-6 border-b shadow-sm'>
            {/* logo */}
            <Link href="/" className="cursor-pointer">
                <Image src="/logo.svg" alt="Logo" width={190} height={45} className="w-48 h-auto object-contain" />
            </Link>

            {/* menu option - perfectly centered */}
            <ul className="absolute left-1/2 -translate-x-1/2 flex items-center gap-15">
                <li className="text-base font-semibold text-gray-400 cursor-pointer transition-all duration-300 hover:text-slate-100 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                    <Link href="/workspace">Workspace</Link>
                </li>
                <li className="text-base font-semibold text-gray-400 cursor-pointer transition-all duration-300 hover:text-slate-100 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                    <Link href="#pricing">Pricing</Link>
                </li>
                <li className="text-base font-semibold text-gray-400 cursor-pointer transition-all duration-300 hover:text-slate-100 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                    <Link href="#support">Support</Link>
                </li>
            </ul>

            {/* auth controls */}
            <div className='flex items-center gap-4'>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[#38bdf8] text-black hover:bg-sky-400 transition-all cursor-pointer">
                            Sign In
                        </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <button className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-700 hover:bg-zinc-800 text-white transition-all cursor-pointer">
                            Sign Up
                        </button>
                    </SignUpButton>
                </SignedOut>
                <SignedIn>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "!w-10 !h-10",
                                userButtonAvatarImage: "!w-10 !h-10",
                                userButtonTrigger: "!w-10 !h-10 focus:shadow-none"
                            }
                        }}
                    />
                </SignedIn>
            </div>
        </div>
    )
}

export default Workspaceheader


