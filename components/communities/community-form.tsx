"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { parseConvexError } from "@/lib/errors";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import Image from "next/image";

interface CommunityFormProps {
  community?: {
    _id: Id<"communities">;
    name: string;
    description?: string;
    logoStorageId?: Id<"_storage">;
    logoUrl?: string;
    maxMembers: number;
    isActive: boolean;
  };
}

export function CommunityForm({ community }: CommunityFormProps) {
  const router = useRouter();
  const createCommunity = useMutation(api.communities.create);
  const updateCommunity = useMutation(api.communities.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [name, setName] = useState(community?.name || "");
  const [description, setDescription] = useState(community?.description || "");
  const [maxMembers, setMaxMembers] = useState(community?.maxMembers || 256);
  const [isActive, setIsActive] = useState(community?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logo state - only use existing logoStorageId if it has a valid URL
  const [logoStorageId, setLogoStorageId] = useState<
    Id<"_storage"> | undefined
  >(community?.logoUrl ? community?.logoStorageId : undefined);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(
    community?.logoUrl,
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoChanged, setLogoChanged] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File): Promise<Id<"_storage">> => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file");
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be less than 5MB");
    }

    // Get upload URL
    const uploadUrl = await generateUploadUrl();

    // Upload file
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!result.ok) {
      const errorText = await result.text().catch(() => "Unknown error");
      throw new Error(`Failed to upload file: ${errorText}`);
    }

    const data = await result.json();
    if (!data.storageId) {
      throw new Error("No storage ID returned from upload");
    }

    return data.storageId as Id<"_storage">;
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setError(null);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

      // Upload to Convex
      const storageId = await handleFileUpload(file);
      setLogoStorageId(storageId);
      setLogoChanged(true);
    } catch (err) {
      setError(parseConvexError(err));
      setLogoPreview(community?.logoUrl);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogoStorageId(undefined);
    setLogoPreview(undefined);
    setLogoChanged(true);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (community) {
        await updateCommunity({
          id: community._id,
          name,
          description: description || undefined,
          // Only pass logoStorageId if it was changed
          ...(logoChanged && {
            logoStorageId: logoStorageId as string | undefined,
          }),
          removeLogoStorageId: logoChanged && !logoStorageId,
          maxMembers,
          isActive,
        });
        router.push(`/communities/${community._id}`);
      } else {
        const id = await createCommunity({
          name,
          description: description || undefined,
          logoStorageId: logoStorageId as string | undefined,
          maxMembers,
        });
        router.push(`/communities/${id}`);
      }
    } catch (err) {
      setError(parseConvexError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="h-max">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">
          {community ? "Edit Community" : "Create Community"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs">
              Community Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My WhatsApp Community"
              required
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxMembers" className="text-xs">
              Max Members per Link
            </Label>
            <Input
              id="maxMembers"
              type="number"
              min={1}
              max={1024}
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value) || 256)}
              className="h-8 text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              WhatsApp groups typically support up to 1024 members
            </p>
          </div>

          {/* Logo Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs">Logo (optional)</Label>
            <div className="flex items-center gap-3">
              {logoPreview ? (
                <div className="relative size-16 rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-1 -right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="size-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="size-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                >
                  {isUploadingLogo ? (
                    <div className="size-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <HugeiconsIcon
                      icon={Upload02Icon}
                      className="size-5 text-muted-foreground"
                    />
                  )}
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                >
                  {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                </Button>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Recommended: Square image, 256x256px
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">
              Description (optional)
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your community..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <p className="text-[11px] text-muted-foreground">
              This will be shown on your public join page and used for SEO
            </p>
          </div>

          {community && (
            <div className="flex items-center justify-between py-1">
              <div className="space-y-0">
                <Label htmlFor="isActive" className="text-xs">
                  Active
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Inactive communities won&apos;t accept new joins
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
              disabled={isSubmitting || isUploadingLogo}
              size="sm"
              className="h-8"
            >
              {isSubmitting
                ? "Saving..."
                : community
                  ? "Save Changes"
                  : "Create Community"}
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
