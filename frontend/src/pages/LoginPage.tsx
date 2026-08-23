import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Tab = "google" | "login" | "register";

export default function LoginPage() {
  const { login, loginWithCredentials, register } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login();
      // Page redirects away — keep spinner active
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setIsLoading(false);
    }
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await loginWithCredentials(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await register(name, email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "login", label: "Sign In" },
    { id: "register", label: "Register" },
  ];

  return (
    <div className="min-h-screen campus-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-secondary/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary-foreground">Smart Campus</h1>
          <p className="text-primary-foreground/60 mt-1">Operations Hub</p>
        </div>

        <Card className="glass-card border-primary-foreground/10 bg-card/95 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">Welcome Back</CardTitle>
            <CardDescription>Access your campus resources</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Tab switcher */}
            <div className="flex rounded-lg bg-muted p-1 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => { setActiveTab(tab.id); clearForm(); }}
                  className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Sign In tab ── */}
            {activeTab === "login" && (
              <form onSubmit={handleCredentialLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button id="login-submit-btn" type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Signing in…" : "Sign In"}
                </Button>

                {/* Divider */}
                <div className="relative flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Google sign-in */}
                <Button
                  id="google-sign-in-btn"
                  type="button"
                  variant="outline"
                  className="w-full justify-center gap-3 h-auto py-3 bg-white text-black hover:bg-gray-50"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Continue with Google</span>
                </Button>
              </form>
            )}

            {/* ── Register tab ── */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-9"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      className="pl-9 pr-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button id="register-submit-btn" type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Creating account…" : "Create Account"}
                </Button>
              </form>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive text-center">{error}</p>
              </div>
            )}

            <div className="mt-2 p-4 rounded-lg bg-secondary/5 border border-secondary/10">
              <p className="text-xs text-muted-foreground text-center italic">
                Sign in to access your campus resources, report maintenance issues, and manage your bookings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
