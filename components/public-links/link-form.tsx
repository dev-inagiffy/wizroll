"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";
import { parseConvexError } from "@/lib/errors";

interface LinkFormProps {
  link?: {
    _id: Id<"publicJoinLinks">;
    slug: string;
    activeCommunityId?: Id<"communities">;
    isActive: boolean;
  };
}

export function LinkForm({ link }: LinkFormProps) {
  const router = useRouter();
  const communities = useQuery(api.communities.list);
  const createLink = useMutation(api.publicJoinLinks.create);
  const updateLink = useMutation(api.publicJoinLinks.update);
  const checkSlug = useQuery(
    api.publicJoinLinks.checkSlugAvailable,
    link ? "skip" : { slug: "" }
  );

  const [slug, setSlug] = useState(link?.slug || "");
  const [activeCommunityId, setActiveCommunityId] = useState<string>(
    link?.activeCommunityId || "none"
  );
  const [isActive, setIsActive] = useState(link?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Check slug availability
  const slugCheck = useQuery(
    api.publicJoinLinks.checkSlugAvailable,
    !link && slug.length >= 3 ? { slug } : "skip"
  );

  useEffect(() => {
    if (slugCheck !== undefined && !link) {
      setSlugAvailable(slugCheck);
    }
  }, [slugCheck, link]);

  const handleSlugChange = (value: string) => {
    // Only allow alphanumeric, hyphens, and underscores
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-_]/g, "");
    setSlug(sanitized);
    setSlugAvailable(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (link) {
        await updateLink({
          id: link._id,
          slug,
          activeCommunityId: activeCommunityId !== "none"
            ? (activeCommunityId as Id<"communities">)
            : undefined,
          isActive,
        });
        router.push("/links");
      } else {
        await createLink({
          slug,
          activeCommunityId: activeCommunityId !== "none"
            ? (activeCommunityId as Id<"communities">)
            : undefined,
        });
        router.push("/links");
      }
    } catch (err) {
      setError(parseConvexError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">{link ? "Edit Public Link" : "Create Public Link"}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-xs">Slug</Label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">/j/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-community"
                required
                className="flex-1 h-8 text-sm"
              />
            </div>
            {!link && slug.length >= 3 && (
              <p
                className={`text-[11px] ${slugAvailable === true ? "text-green-600" : slugAvailable === false ? "text-destructive" : "text-muted-foreground"}`}
              >
                {slugAvailable === null
                  ? "Checking availability..."
                  : slugAvailable
                    ? "This slug is available"
                    : "This slug is already taken"}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Only lowercase letters, numbers, hyphens, and underscores
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="community" className="text-xs">Community</Label>
            <Select
              value={activeCommunityId}
              onValueChange={setActiveCommunityId}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No community</SelectItem>
                {communities?.map((community) => (
                  <SelectItem key={community._id} value={community._id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              The community that users will join when they click this link
            </p>
          </div>

          {link && (
            <div className="flex items-center justify-between py-1">
              <div className="space-y-0">
                <Label htmlFor="isActive" className="text-xs">Active</Label>
                <p className="text-[11px] text-muted-foreground">
                  Inactive links will show an error message
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              disabled={
                isSubmitting || (!link && slugAvailable === false) || !slug
              }
              size="sm"
              className="h-8"
            >
              {isSubmitting
                ? "Saving..."
                : link
                  ? "Save Changes"
                  : "Create Link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              size="sm"
              className="h-8"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
