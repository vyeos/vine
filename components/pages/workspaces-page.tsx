"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { CreateWorkspaceDialog } from "@/components/Workspace/CreateWorkspaceDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useUserWorkspaces } from "@/hooks/useWorkspace";
import { Badge } from "@/components/ui/badge";
import { getWorkspacePath } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function getRoleBadgeVariant(role: string) {
  if (role === "owner") return "default";
  if (role === "admin") return "secondary";
  return "outline";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const workspaceSurfaceClasses = [
  "bg-primary/90 text-primary-foreground shadow-[0_18px_50px_-22px_hsl(var(--primary)/0.75)]",
  "bg-secondary text-secondary-foreground shadow-[0_18px_50px_-22px_hsl(var(--secondary)/0.7)]",
  "bg-accent text-accent-foreground shadow-[0_18px_50px_-22px_hsl(var(--accent)/0.7)]",
  "bg-muted text-foreground shadow-[0_18px_50px_-22px_hsl(var(--foreground)/0.18)]",
];

export function WorkspacesPage() {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: user, isLoading: isLoadingUser } = useAuth();
  const { data: workspaces, isLoading } = useUserWorkspaces();
  const hasWorkspaces = workspaces.length > 0;
  const userInitials = getInitials(user?.name || user?.email || "U");

  return (
    <>
      <main className="relative box-border min-h-dvh overflow-x-hidden flex items-center justify-center bg-background px-4 py-8 sm:px-6 sm:py-12">
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center">
          <div className="w-full max-w-3xl space-y-10 text-center">
            <div className="space-y-5">
              <div className="mx-auto flex w-full max-w-md items-center justify-center">
                {isLoadingUser ? (
                  <div className="flex w-full items-center gap-2.5 rounded-xl border border-border/50 bg-card/70 px-3 py-2.5 shadow-sm">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex-1 space-y-2 text-left">
                      <Skeleton className="h-3.5 w-28 rounded-md" />
                      <Skeleton className="h-3 w-40 rounded-md" />
                    </div>
                  </div>
                ) : user ? (
                  <div className="flex w-full items-center gap-2.5 rounded-xl border border-border/50 bg-card/80 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm">
                    <Avatar className="size-9 rounded-lg border border-border/50">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        Signed in as
                      </p>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  Select a workspace
                </h1>
                <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Choose where you want to work, or spin up a new workspace for
                  another team, brand, or project.
                </p>
              </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-wrap justify-center gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="w-full max-w-[172px] space-y-4">
                    <Skeleton className="aspect-square w-full rounded-4xl" />
                    <Skeleton className="mx-auto h-5 w-40 rounded-md" />
                    <Skeleton className="mx-auto h-4 w-24 rounded-md" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-3.5">
                {workspaces.map((workspace, index) => (
                  <button
                    key={workspace.id}
                    type="button"
                    onClick={() =>
                      router.push(getWorkspacePath(workspace.slug))
                    }
                    className="group flex w-full max-w-[172px] flex-col items-center text-center"
                  >
                    <div
                      className={`flex aspect-square w-full max-w-[172px] items-center justify-center rounded-[1.35rem] border border-border/40 transition-all duration-150 group-hover:scale-[1.05] group-hover:border-border/80 ${workspaceSurfaceClasses[index % workspaceSurfaceClasses.length]}`}
                    >
                      <span className="text-4xl font-semibold tracking-tight sm:text-5xl">
                        {getInitials(workspace.name)}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1 opacity-80 group-hover:opacity-100">
                      <p className="text-sm font-medium tracking-tight text-foreground sm:text-[15px]">
                        {workspace.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        /{workspace.slug}
                      </p>
                      <div className="flex justify-center">
                        <Badge variant={getRoleBadgeVariant(workspace.role)}>
                          {workspace.role}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCreateDialogOpen(true)}
                  className="group flex w-full max-w-[172px] flex-col items-center text-center"
                >
                  <div className="flex aspect-square w-full max-w-[172px] items-center justify-center rounded-[1.35rem] border-2 border-dashed border-border/70 bg-card/40 text-muted-foreground transition-all duration-150  group-hover:border-primary/50 group-hover:bg-card/70 group-hover:text-foreground">
                    <Plus className="h-10 w-10 stroke-[1.5] group-hover:text-primary transition-colors duration-150" />
                  </div>
                  <div className="mt-3 space-y-1 opacity-80 group-hover:opacity-100">
                    <p className="text-sm font-medium tracking-tight text-foreground sm:text-[15px]">
                      Add Workspace
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Create a fresh space for new content.
                    </p>
                  </div>
                </button>
              </div>
            )}

            {!isLoading && !hasWorkspaces && (
              <p className="text-sm text-muted-foreground">
                You don&apos;t have any workspaces yet. Start by creating your
                first one.
              </p>
            )}
          </div>
        </div>
      </main>

      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={(workspaceSlug) => {
          router.replace(getWorkspacePath(workspaceSlug));
        }}
      />
    </>
  );
}
