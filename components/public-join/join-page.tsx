"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { JoinButton } from "./join-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface JoinPageProps {
  slug: string;
}

export function JoinPage({ slug }: JoinPageProps) {
  const pageData = useQuery(api.publicApi.getPublicJoinPage, { slug });

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <div className="animate-pulse">
              <div className="h-16 w-16 mx-auto rounded-full bg-muted mb-4" />
              <div className="h-6 w-32 mx-auto bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pageData.found) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
            <p className="text-muted-foreground">
              This join link doesn&apos;t exist or has been deactivated.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { communityName, logoUrl, backgroundUrl, hasAvailableLinks } =
    pageData;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: backgroundUrl
          ? `url(${backgroundUrl})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {backgroundUrl && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      )}
      {!backgroundUrl && (
        <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900" />
      )}

      <Card className="w-full max-w-md mx-4 relative z-10 shadow-2xl">
        <CardHeader className="text-center pb-2">
          {logoUrl ? (
            <div className="flex justify-center mb-4">
              <Image
                src={logoUrl}
                alt={communityName}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  className="h-10 w-10 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
            </div>
          )}
          <CardTitle className="text-2xl">{communityName}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Click the button below to join our WhatsApp community
          </p>

          {hasAvailableLinks ? (
            <JoinButton slug={slug} />
          ) : (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              <p className="font-medium">Community is currently full</p>
              <p className="text-sm mt-1">Please check back later</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Powered by Wizroll
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
