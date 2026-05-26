import { RegisterForm } from "@/components/register-form";

export default function RegisterAgentPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-balance text-3xl font-semibold leading-tight">Register Agent</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the starter-kit form to add a new agent to the in-memory dashboard state.
        </p>
      </header>
      <RegisterForm />
    </div>
  );
}
