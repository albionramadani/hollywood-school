import { useState } from "react";
import { Link } from "react-router-dom";

interface AdminLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gold";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center mb-8">
          <div className="font-display text-2xl font-bold">HOLLYWOOD <span className="text-gold">SCHOOL</span></div>
          <div className="text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground mt-1">Admin Console</div>
        </Link>

        <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-7 space-y-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Sign in</h1>
          <p className="font-body text-sm text-muted-foreground -mt-2">Authorised personnel only.</p>

          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} autoComplete="username" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={input} autoComplete="current-password" />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={busy} className="w-full bg-gold text-primary-foreground font-display font-bold uppercase tracking-wide rounded-full py-2.5 hover:bg-gold-light transition-colors disabled:opacity-60">
            {busy ? "Please wait…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
