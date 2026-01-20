"use client";

import { useQuery } from "convex/react";
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
import { Delete01Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { useMutation } from "convex/react";
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
import { Id } from "@/convex/_generated/dataModel";

export function CommunityList() {
  const router = useRouter();
  const communities = useQuery(api.communities.list);
  const deleteCommunity = useMutation(api.communities.remove);

  const handleDelete = async (id: Id<"communities">) => {
    await deleteCommunity({ id });
  };

  const handleRowClick = (id: string) => {
    router.push(`/communities/${id}`);
  };

  if (!communities) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          You haven&apos;t created any communities yet
        </p>
        <Button asChild size="sm">
          <Link href="/communities/new">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="mr-1.5 size-3.5" />
            Create Community
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right w-[60px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {communities.map((community) => (
          <TableRow
            key={community._id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleRowClick(community._id)}
          >
            <TableCell className="font-medium">{community.name}</TableCell>
            <TableCell>
              {community.currentMembers}/{community.maxMembers}
            </TableCell>
            <TableCell>
              <Badge variant={community.isActive ? "default" : "secondary"}>
                {community.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(community.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" title="Delete">
                    <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Community</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{community.name}
                      &quot;? This action cannot be undone and will also
                      delete all associated WhatsApp links.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(community._id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
