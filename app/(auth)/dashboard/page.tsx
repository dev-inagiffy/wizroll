import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { Header } from "./header";

const Page = async () => {
  const [preloadedUserQuery] = await Promise.all([
    preloadAuthQuery(api.auth.getCurrentUser),
    // Load multiple queries in parallel if needed
  ]);

  return (
    <div>
      <Header preloadedUserQuery={preloadedUserQuery} />
    </div>
  );
};

export default Page;
