"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Post } from "@/types/post";

const POST_EXCERPT_PREVIEW_LIMIT = 60;

export const POST_CUSTOMIZABLE_COLUMNS = [
  { id: "author", label: "Author" },
  { id: "category", label: "Category" },
  { id: "tags", label: "Tags" },
  { id: "createdAt", label: "Created" },
  { id: "publishedAt", label: "Published" },
] as const;

export const createColumns = (): ColumnDef<Post>[] => [
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8 data-[state=open]:bg-accent"
        >
          Title
          {isSorted === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const post = row.original;
      const excerptPreview =
        post.excerpt.length > POST_EXCERPT_PREVIEW_LIMIT
          ? `${post.excerpt.slice(0, POST_EXCERPT_PREVIEW_LIMIT - 3).trimEnd()}...`
          : post.excerpt;

      return (
        <div className="min-w-0">
          <div className="truncate font-medium">{post.title || "Untitled"}</div>
          {excerptPreview && (
            <div className="truncate text-sm text-muted-foreground">
              {excerptPreview}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as "draft" | "published";
      return (
        <Badge
          variant={status === "published" ? "default" : "secondary"}
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "author",
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => {
      const author = row.original.author;
      return (
        <div className="text-sm">
          {author ? (
            author.name
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    id: "category",
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <div className="text-sm">
          {category ? (
            category.name
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    id: "tags",
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (!tags || tags.length === 0) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag.slug} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8 data-[state=open]:bg-accent"
        >
          Created
          {isSorted === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-sm">{format(new Date(date), "MMM d, yyyy")}</div>
      );
    },
  },
  {
    id: "publishedAt",
    accessorKey: "publishedAt",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8 data-[state=open]:bg-accent"
        >
          Published
          {isSorted === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("publishedAt") as string | null;
      return (
        <div className="text-sm">
          {date ? (
            format(new Date(date), "MMM d, yyyy")
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
];

export const columns = createColumns();
