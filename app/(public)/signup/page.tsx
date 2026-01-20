import { Metadata } from "next";
import SignupForm from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a Wizroll account to start managing your WhatsApp community links.",
};

export default function SignupPage() {
  return <SignupForm />;
}
