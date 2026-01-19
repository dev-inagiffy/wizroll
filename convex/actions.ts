"use server";

import { fetchAuthMutation } from "../lib/auth-server";
import { api } from "../convex/_generated/api";

// Authenticated mutation via server function
export async function updatePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  await fetchAuthMutation(api.users.updateUserPassword, {
    currentPassword,
    newPassword,
  });
}
