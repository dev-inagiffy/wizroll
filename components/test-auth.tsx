import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
function App() {
  return (
    <main>
      <Unauthenticated>Logged out</Unauthenticated>
      <Authenticated>Logged in</Authenticated>
      <AuthLoading>Loading...</AuthLoading>
    </main>
  );
}
const Content = () => {
  const messages = useQuery(api.users.getUsers);
  return <div>Authenticated content: {messages?.length}</div>;
};
export default App;
