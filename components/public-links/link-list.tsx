"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete01Icon,
  Add01Icon,
  Copy01Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import { Id } from "@/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export function LinkList() {
  const router = useRouter();
  const links = useQuery(api.publicJoinLinks.list);
  const deleteLink = useMutation(api.publicJoinLinks.remove);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDelete = async (id: Id<"publicJoinLinks">) => {
    await deleteLink({ id });
  };

  const handleCopy = async (slug: string, id: string) => {
    const url = `${window.location.origin}/j/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRowClick = (id: string) => {
    router.push(`/links/${id}`);
  };

  if (!links) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          You haven&apos;t created any public links yet
        </p>
        <Button asChild size="sm">
          <Link href="/links/new">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="mr-1.5 size-3.5" />
            Create Public Link
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Slug</TableHead>
          <TableHead>Community</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right w-[120px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link) => (
          <TableRow
            key={link._id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleRowClick(link._id)}
          >
            <TableCell className="font-mono">/j/{link.slug}</TableCell>
            <TableCell>
              {link.communityName || (
                <span className="text-muted-foreground">Not assigned</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={link.isActive ? "default" : "secondary"}>
                {link.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(link.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopy(link.slug, link._id)}
                  title="Copy link"
                >
                  <HugeiconsIcon
                    icon={Copy01Icon}
                    strokeWidth={2}
                    className={
                      copiedId === link._id ? "text-green-500" : undefined
                    }
                  />
                </Button>
                <Button variant="ghost" size="icon-sm" asChild title="Open link">
                  <a
                    href={`/j/${link.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <HugeiconsIcon icon={Share01Icon} strokeWidth={2} />
                  </a>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" title="Delete">
                      <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Public Link</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the link &quot;/j/
                        {link.slug}&quot;? Anyone using this link will no longer
                        be able to join.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(link._id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
