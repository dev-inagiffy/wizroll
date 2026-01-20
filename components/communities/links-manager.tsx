"use client";

import { useState, useEffect } from "react";
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
  Tick01Icon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons";
import { Label } from "@/components/ui/label";
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
  const community = useQuery(api.communities.get, { id: communityId });
  const links = useQuery(api.communityLinks.listByCommunity, { communityId });
  const createLink = useMutation(api.communityLinks.create);
  const deleteLink = useMutation(api.communityLinks.remove);
  const updateLink = useMutation(api.communityLinks.update);
  const resetExhausted = useMutation(api.communityLinks.resetExhausted);
  const reorderLinks = useMutation(api.communityLinks.reorder);

  const [newUrl, setNewUrl] = useState("");
  const [newMaxMembers, setNewMaxMembers] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default max members from community settings
  useEffect(() => {
    if (community?.maxMembers && !newMaxMembers) {
      setNewMaxMembers(String(community.maxMembers));
    }
  }, [community?.maxMembers, newMaxMembers]);

  // Track edited values for each link (key: linkId, value: { memberCount, maxMembers })
  const [editedValues, setEditedValues] = useState<
    Record<string, { memberCount: string; maxMembers: string }>
  >({});

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null);

    const defaultMaxMembers = community?.maxMembers || 256;

    try {
      await createLink({
        communityId,
        whatsappInviteUrl: newUrl,
        maxMembers: parseInt(newMaxMembers) || defaultMaxMembers,
      });
      setNewUrl("");
      setNewMaxMembers(String(defaultMaxMembers));
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

  // Get the current edited value or fall back to the link's actual value
  const getEditedValue = (
    linkId: string,
    field: "memberCount" | "maxMembers",
    actualValue: number
  ) => {
    return editedValues[linkId]?.[field] ?? String(actualValue);
  };

  // Check if a link has been edited
  const hasChanges = (linkId: string, link: { memberCount: number; maxMembers: number }) => {
    const edited = editedValues[linkId];
    if (!edited) return false;
    return (
      edited.memberCount !== String(link.memberCount) ||
      edited.maxMembers !== String(link.maxMembers)
    );
  };

  // Handle input change - just update local state
  const handleInputChange = (
    linkId: string,
    field: "memberCount" | "maxMembers",
    value: string,
    link: { memberCount: number; maxMembers: number }
  ) => {
    setEditedValues((prev) => ({
      ...prev,
      [linkId]: {
        memberCount: field === "memberCount" ? value : (prev[linkId]?.memberCount ?? String(link.memberCount)),
        maxMembers: field === "maxMembers" ? value : (prev[linkId]?.maxMembers ?? String(link.maxMembers)),
      },
    }));
  };

  // Save the edited values to the database
  const handleSaveChanges = async (id: Id<"communityLinks">) => {
    const edited = editedValues[id];
    if (!edited) return;

    const memberCount = Math.max(0, parseInt(edited.memberCount) || 0);
    const maxMembers = Math.max(1, parseInt(edited.maxMembers) || 256);

    await updateLink({ id, memberCount, maxMembers });

    // Clear the edited state for this link
    setEditedValues((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
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
      <CardHeader className="py-4">
        <CardTitle className="text-base">WhatsApp Invite Links</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Links are used in priority order. When a group fills up, the next link is used automatically.
        </p>
      </CardHeader>
      <CardContent className="py-4 space-y-4">
        {/* Add New Link Form */}
        <form onSubmit={handleAddLink} className="space-y-3 p-4 rounded-lg border bg-muted/30">
          <Label className="text-sm font-medium">Add New Link</Label>
          <div className="space-y-3">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="h-10"
            />
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Max Members (1-1024)
                </Label>
                <Input
                  type="number"
                  value={newMaxMembers}
                  onChange={(e) => setNewMaxMembers(e.target.value)}
                  placeholder={String(community?.maxMembers || 256)}
                  className="h-10"
                  min={1}
                  max={1024}
                />
              </div>
              <Button type="submit" disabled={isAdding || !newUrl} className="h-10 px-6">
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Links List */}
        {links.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <HugeiconsIcon icon={LinkSquare01Icon} strokeWidth={1.5} className="size-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No invite links added yet</p>
            <p className="text-xs mt-1">Add your first WhatsApp group invite link above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => (
              <div
                key={link._id}
                className="rounded-lg border bg-card p-4"
              >
                {/* Header Row: Priority, Status, Actions */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => moveLink(index, "up")}
                        disabled={index === 0}
                        className="h-8 w-8"
                      >
                        <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => moveLink(index, "down")}
                        disabled={index === links.length - 1}
                        className="h-8 w-8"
                      >
                        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4" />
                      </Button>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      Priority #{index + 1}
                    </span>
                    <Badge
                      variant={link.isExhausted ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {link.isExhausted ? "Full" : "Active"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {link.isExhausted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReset(link._id)}
                        className="h-8"
                      >
                        <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="size-4 mr-1.5" />
                        Reset
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Link</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this invite link? This action cannot be undone.
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

                {/* URL Display */}
                <div className="mb-4">
                  <Label className="text-xs text-muted-foreground mb-1 block">Invite URL</Label>
                  <p className="text-sm font-mono truncate bg-muted/50 rounded px-3 py-2">
                    {link.whatsappInviteUrl}
                  </p>
                </div>

                {/* Member Count Inputs */}
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[140px]">
                    <Label htmlFor={`current-${link._id}`} className="text-xs text-muted-foreground mb-1.5 block">
                      Current Members
                    </Label>
                    <Input
                      id={`current-${link._id}`}
                      type="number"
                      value={getEditedValue(link._id, "memberCount", link.memberCount)}
                      onChange={(e) =>
                        handleInputChange(link._id, "memberCount", e.target.value, link)
                      }
                      className="h-10 text-center font-medium"
                      min={0}
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <Label htmlFor={`max-${link._id}`} className="text-xs text-muted-foreground mb-1.5 block">
                      Max Members
                    </Label>
                    <Input
                      id={`max-${link._id}`}
                      type="number"
                      value={getEditedValue(link._id, "maxMembers", link.maxMembers)}
                      onChange={(e) =>
                        handleInputChange(link._id, "maxMembers", e.target.value, link)
                      }
                      className="h-10 text-center font-medium"
                      min={1}
                      max={1024}
                    />
                  </div>
                  {hasChanges(link._id, link) && (
                    <Button
                      onClick={() => handleSaveChanges(link._id)}
                      className="h-10 px-4 bg-green-600 hover:bg-green-700"
                    >
                      <HugeiconsIcon icon={Tick01Icon} strokeWidth={2} className="size-4 mr-1.5" />
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
