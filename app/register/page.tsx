import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-balance text-3xl font-semibold leading-tight">Register Agent</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a new Arc agent to the in-memory starter state.
        </p>
      </header>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h2 className="text-xl font-semibold">What gets stored</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Agent name and owner address</li>
            <li>Starting stake and reputation score</li>
            <li>Short description for the dashboard</li>
          </ul>
        </div>
        <RegisterForm />
      </section>
    </div>
  );
}
