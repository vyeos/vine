"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown, Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { CreateWorkspaceDialog } from "@/components/Workspace/CreateWorkspaceDialog";
import { JoinWorkspaceDialog } from "@/components/Workspace/JoinWorkspaceDialog";
import { UpdateWorkspaceDialog } from "@/components/Workspace/UpdateWorkspaceDialog";
import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteWorkspace, useUserWorkspaces } from "@/hooks/useWorkspace";
import {
  getLastWorkspaceSlugs,
  getWorkspacePath,
  getWorkspacePathSuffix,
  updateLastWorkspaceCookie,
} from "@/lib/utils";

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-secondary/80 px-1.5 py-0 text-[10px] font-medium text-secondary-foreground">
      {role}
    </span>
  );
}

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workspaceToUpdate, setWorkspaceToUpdate] = useState<{
    slug: string;
    name: string;
  } | null>(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<{
    id: string;
    slug: string;
    name: string;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ workspaceSlug?: string }>();
  const workspaceSlug = params.workspaceSlug;
  const { data: workspaces = [], isLoading } = useUserWorkspaces();
  const deleteWorkspace = useDeleteWorkspace();
  const { previous: lastUsedSlug } = getLastWorkspaceSlugs();

  const getCurrentRoutePath = () => {
    return getWorkspacePathSuffix(pathname, workspaceSlug);
  };

  const currentWorkspace = useMemo(() => {
    if (!workspaceSlug) return null;
    return (
      workspaces.find((workspace) => workspace.slug === workspaceSlug) ?? null
    );
  }, [workspaceSlug, workspaces]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const workspaceColors = [
    "bg-chart-1",
    "bg-chart-2",
    "bg-chart-3",
    "bg-chart-4",
    "bg-chart-5",
    "bg-primary",
    "bg-secondary",
    "bg-accent",
  ];

  const getWorkspaceColor = (index: number) =>
    workspaceColors[index % workspaceColors.length];

  const navigateToWorkspace = (slug: string) => {
    updateLastWorkspaceCookie(slug);
    const currentRoutePath = getCurrentRoutePath();
    const targetPath = currentRoutePath
      ? `${getWorkspacePath(slug)}${currentRoutePath}`
      : getWorkspacePath(slug);
    router.push(targetPath);
  };

  const handleCreateWorkspace = (slug: string) => {
    setOpen(false);
    navigateToWorkspace(slug);
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;

    const isDeletingCurrentWorkspace = workspaceToDelete.slug === workspaceSlug;
    const fallbackWorkspace = workspaces.find(
      (workspace) => workspace.slug !== workspaceToDelete.slug,
    );

    try {
      await deleteWorkspace.mutateAsync(workspaceToDelete.slug);
      setDeleteDialogOpen(false);
      setWorkspaceToDelete(null);
      setOpen(false);

      if (isDeletingCurrentWorkspace) {
        if (fallbackWorkspace) {
          navigateToWorkspace(fallbackWorkspace.slug);
        } else {
          router.push("/");
        }
      }
    } catch {
      return;
    }
  };

  const workspaceList = (
    <>
      <DropdownMenuLabel className="text-xs text-muted-foreground">
        Your Workspaces
      </DropdownMenuLabel>
      {workspaces.map((workspace) => {
        const wsInitials = getInitials(workspace.name);
        const wsIndex = workspaces.findIndex((item) => item.id === workspace.id);
        const wsColor = getWorkspaceColor(wsIndex);
        const isActive = workspace.id === currentWorkspace?.id;
        const currentRoutePath = getCurrentRoutePath();
        const targetPath = currentRoutePath
          ? `${getWorkspacePath(workspace.slug)}${currentRoutePath}`
          : getWorkspacePath(workspace.slug);

        return (
          <div
            key={workspace.id}
            className={`mb-1.5 flex items-center gap-2 rounded-md px-2 py-1.5 last:mb-0 ${
              isActive
                ? "bg-primary/15 text-foreground ring-1 ring-primary/25"
                : "hover:bg-accent"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                if (!isActive) {
                  setOpen(false);
                  updateLastWorkspaceCookie(workspace.slug);
                  router.push(targetPath);
                }
              }}
              className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default"
              disabled={isActive}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-md border ${wsColor}`}
              >
                <span className="text-sm font-bold text-background">
                  {wsInitials}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {workspace.name}
                  </span>
                  <RoleBadge role={workspace.role} />
                  {workspace.slug === lastUsedSlug && (
                    <Badge className="h-4 px-1.5 text-[10px]">
                      Last used
                    </Badge>
                  )}
                </div>
                <span
                  className={`truncate text-xs ${
                    isActive ? "text-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {workspace.slug}
                </span>
              </div>
            </button>
            {workspace.role === "owner" && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpen(false);
                    setWorkspaceToUpdate({
                      slug: workspace.slug,
                      name: workspace.name,
                    });
                    setUpdateDialogOpen(true);
                  }}
                  aria-label={`Edit ${workspace.name}`}
                >
                  <Pencil />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpen(false);
                    setWorkspaceToDelete({
                      id: workspace.id,
                      slug: workspace.slug,
                      name: workspace.name,
                    });
                    setDeleteDialogOpen(true);
                  }}
                  aria-label={`Delete ${workspace.name}`}
                >
                  <Trash2 />
                </Button>
              </div>
            )}
          </div>
        );
      })}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={(event) => {
          event.preventDefault();
          setOpen(false);
          setJoinDialogOpen(true);
        }}
      >
        <Link2 className="mr-2 h-4 w-4" />
        Join Workspace
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={(event) => {
          event.preventDefault();
          setOpen(false);
          setCreateDialogOpen(true);
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Workspace
      </DropdownMenuItem>
    </>
  );

  const workspaceDialogs = (
    <>
      <JoinWorkspaceDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
      />

      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleCreateWorkspace}
      />

      {workspaceToUpdate && (
        <UpdateWorkspaceDialog
          open={updateDialogOpen}
          onOpenChange={(nextOpen) => {
            setUpdateDialogOpen(nextOpen);
            if (!nextOpen) {
              setWorkspaceToUpdate(null);
            }
          }}
          workspaceSlug={workspaceToUpdate.slug}
          currentName={workspaceToUpdate.name}
        />
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{workspaceToDelete?.name}&quot;?
              This action cannot be undone and will permanently delete all
              workspace data including all posts, categories, tags, and authors.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setWorkspaceToDelete(null);
              }}
              disabled={deleteWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWorkspace}
              disabled={deleteWorkspace.isPending}
            >
              {deleteWorkspace.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="h-14 w-full justify-center group-data-[state=expanded]:justify-start"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted" />
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
              <span className="truncate font-medium">Loading...</span>
              <span className="truncate text-xs">Please wait</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!currentWorkspace) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-14 w-full justify-center group-data-[state=expanded]:justify-start"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <span className="text-sm font-semibold">?</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
                  <span className="truncate font-medium">Select Workspace</span>
                  <span className="truncate text-xs">Choose a workspace</span>
                </div>
                <ChevronsUpDown className="ml-auto group-data-[state=collapsed]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[280px]">
              {workspaceList}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
        {workspaceDialogs}
      </SidebarMenu>
    );
  }

  const initials = getInitials(currentWorkspace.name);
  const currentIndex = workspaces.findIndex(
    (workspace) => workspace.id === currentWorkspace.id,
  );
  const colorClass = getWorkspaceColor(currentIndex);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-14 w-full justify-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[state=expanded]:justify-start"
            >
              <div
                className={`flex aspect-square h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}
              >
                <span className="text-sm font-bold text-background">
                  {initials}
                </span>
              </div>
              <div className="grid min-w-0 flex-1 gap-1.5 text-left leading-relaxed group-data-[state=collapsed]:hidden">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {currentWorkspace.name}
                  </span>
                  <RoleBadge role={currentWorkspace.role} />
                </div>
                <span className="truncate text-xs text-muted-foreground">
                  {currentWorkspace.slug}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto group-data-[state=collapsed]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="right"
            sideOffset={4}
          >
            {workspaceList}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      {workspaceDialogs}
    </SidebarMenu>
  );
}
