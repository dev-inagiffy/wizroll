"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
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
import { parseConvexError } from "@/lib/errors";

interface LinksManagerProps {
  communityId: Id<"communities">;
}

export function LinksManager({ communityId }: LinksManagerProps) {
  const links = useQuery(api.communityLinks.listByCommunity, { communityId });
  const createLink = useMutation(api.communityLinks.create);
  const deleteLink = useMutation(api.communityLinks.remove);
  const updateLink = useMutation(api.communityLinks.update);
  const resetExhausted = useMutation(api.communityLinks.resetExhausted);
  const reorderLinks = useMutation(api.communityLinks.reorder);

  const [newUrl, setNewUrl] = useState("");
  const [newMaxMembers, setNewMaxMembers] = useState("256");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null);

    try {
      await createLink({
        communityId,
        whatsappInviteUrl: newUrl,
        maxMembers: parseInt(newMaxMembers) || 256,
      });
      setNewUrl("");
      setNewMaxMembers("256");
    } catch (err) {
      setError(parseConvexError(err));
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: Id<"communityLinks">) => {
    await deleteLink({ id });
  };

  const handleReset = async (id: Id<"communityLinks">) => {
    await resetExhausted({ id });
  };

  const handleUpdateMemberCount = async (
    id: Id<"communityLinks">,
    memberCount: number
  ) => {
    await updateLink({ id, memberCount: Math.max(0, memberCount) });
  };

  const handleUpdateMaxMembers = async (
    id: Id<"communityLinks">,
    maxMembers: number
  ) => {
    await updateLink({ id, maxMembers: Math.max(1, maxMembers) });
  };

  const moveLink = async (index: number, direction: "up" | "down") => {
    if (!links) return;

    const newOrder = [...links];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];

    await reorderLinks({
      communityId,
      linkIds: newOrder.map((l) => l._id),
    });
  };

  if (!links) {
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">WhatsApp Invite Links</CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">WhatsApp Invite Links</CardTitle>
      </CardHeader>
      <CardContent className="py-3 space-y-3">
        <form onSubmit={handleAddLink} className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="flex-1 h-8 text-sm"
            />
            <Input
              type="number"
              value={newMaxMembers}
              onChange={(e) => setNewMaxMembers(e.target.value)}
              placeholder="Max"
              className="w-20 h-8 text-sm"
              min={1}
              max={1024}
            />
            <Button type="submit" size="sm" disabled={isAdding || !newUrl}>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </div>
        </form>

        {error && (
          <div className="rounded bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
            {error}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Links are used in priority order. Set member count manually.
        </p>

        {links.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground text-sm">
            No invite links added yet
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link, index) => (
              <div
                key={link._id}
                className="flex items-center gap-2 rounded border p-2"
              >
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => moveLink(index, "up")}
                    disabled={index === 0}
                  >
                    <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => moveLink(index, "down")}
                    disabled={index === links.length - 1}
                  >
                    <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <Badge
                      variant={link.isExhausted ? "secondary" : "default"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {link.isExhausted ? "Full" : "Active"}
                    </Badge>
                  </div>
                  <p className="text-xs truncate text-muted-foreground">
                    {link.whatsappInviteUrl}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={link.memberCount}
                    onChange={(e) =>
                      handleUpdateMemberCount(link._id, parseInt(e.target.value) || 0)
                    }
                    className="w-14 h-7 text-xs text-center"
                    min={0}
                  />
                  <span className="text-xs text-muted-foreground">/</span>
                  <Input
                    type="number"
                    value={link.maxMembers}
                    onChange={(e) =>
                      handleUpdateMaxMembers(link._id, parseInt(e.target.value) || 256)
                    }
                    className="w-14 h-7 text-xs text-center"
                    min={1}
                    max={1024}
                  />
                </div>

                <div className="flex items-center gap-0.5">
                  {link.isExhausted && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleReset(link._id)}
                      title="Reset to active"
                    >
                      <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="size-3" />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Link</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this invite link?
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
