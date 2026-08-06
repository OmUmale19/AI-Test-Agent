import React from 'react';
import Workspaceheader from '@/components/ui/custom/workspaceheader';
import WorkspaceBody from '@/components/ui/custom/workspacebody';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-[#fafafa]">
      <Workspaceheader />
      <WorkspaceBody />
    </main>
  );
}

