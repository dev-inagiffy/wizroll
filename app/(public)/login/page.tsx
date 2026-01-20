import { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Wizroll account to manage your WhatsApp communities.",
};

export default function LoginPage() {
  return <LoginForm />;
}
