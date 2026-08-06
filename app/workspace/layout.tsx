import React from "react";
import Workspaceheader from "@/components/ui/custom/workspaceheader";

function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    return <main>
        <Workspaceheader />
        {children}
    </main>;
}

export default WorkspaceLayout;