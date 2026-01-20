import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Wizroll",
    default: "Wizroll",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
