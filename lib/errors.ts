/**
 * Parse Convex error messages to extract the user-friendly message
 * Convex errors come in format: "[CONVEX M(module:function)] [Request ID: xxx] Server Error Uncaught Error: Actual message"
 */
export function parseConvexError(error: unknown): string {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  const message = error instanceof Error ? error.message : String(error);

  // Try to extract the actual error message after "Uncaught Error: "
  const uncaughtMatch = message.match(/Uncaught Error:\s*(.+?)(?:\s+at\s|$)/);
  if (uncaughtMatch) {
    return uncaughtMatch[1].trim();
  }

  // Try to extract message after "Server Error"
  const serverErrorMatch = message.match(/Server Error\s+(.+?)(?:\s+at\s|$)/);
  if (serverErrorMatch) {
    return serverErrorMatch[1].trim();
  }

  // If it's a clean message without Convex formatting, return as is
  if (!message.includes("[CONVEX")) {
    return message;
  }

  // Fallback
  return "Something went wrong. Please try again.";
}
