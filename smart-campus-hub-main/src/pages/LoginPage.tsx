import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Please select a role"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const { login, registerUser, emailLogin } = useAuth();
  const [view, setView] = useState<"google" | "signup" | "login">("google");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", role: "STUDENT" }
  });

  const loginForm = useForm({
    defaultValues: { email: "", password: "" }
  });

  const onSignup = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      toast.success("Registration successful! You can now log in.");
      setView("login");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEmailLogin = async (data: any) => {
    setIsSubmitting(true);
    try {
      await emailLogin(data);
      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen campus-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-secondary/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary-foreground">Smart Campus</h1>
          <p className="text-primary-foreground/60 mt-1">Operations Hub</p>
        </div>

        <Card className="glass-card border-primary-foreground/10 bg-card/95 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">
              {view === "signup" ? "Create Account" : view === "login" ? "Sign In" : "Choose Role"}
            </CardTitle>
            <CardDescription>
              {view === "signup" ? "Join the smart campus community" :
                view === "login" ? "Enter your credentials" :
                  "Choose a role to explore the platform"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {view === "google" && (
              <>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" className="w-full justify-center h-auto py-4 bg-white text-black transition-all hover:scale-[1.02]"
                    onClick={() => { setSelectedRole("STUDENT"); setView("login"); }}>
                    <div className="text-center">
                      <div className="font-semibold text-sm">Student</div>
                      <div className="text-xs text-muted-foreground">Access courses & bookings</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-center h-auto py-4 bg-white text-black transition-all hover:scale-[1.02]"
                    onClick={() => { setSelectedRole("ADMIN"); setView("login"); }}>
                    <div className="text-center">
                      <div className="font-semibold text-sm">Admin</div>
                      <div className="text-xs text-muted-foreground">Manage operations</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-center h-auto py-4 bg-white text-black transition-all hover:scale-[1.02]"
                    onClick={() => { setSelectedRole("TECHNICIAN"); setView("login"); }}>
                    <div className="text-center">
                      <div className="font-semibold text-sm">Technician</div>
                      <div className="text-xs text-muted-foreground">Maintenance & repairs</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-center h-auto py-4 bg-white text-black transition-all hover:scale-[1.02]"
                    onClick={() => { setSelectedRole("MANAGER"); setView("login"); }}>
                    <div className="text-center">
                      <div className="font-semibold text-sm">Manager</div>
                      <div className="text-xs text-muted-foreground">Oversee facilities</div>
                    </div>
                  </Button>
                </div>
                <div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">OR</span></div></div>
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" className="text-primary-foreground/80" onClick={() => login()}>Sign in with Google</Button>
                  <Button variant="ghost" className="text-primary-foreground/80" onClick={() => setView("signup")}>Create an account</Button>
                </div>
              </>
            )}

            {view === "signup" && (
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                <div><Label>Full Name</Label><Input {...signupForm.register("name")} placeholder="John Doe" /></div>
                <div><Label>Email</Label><Input type="email" {...signupForm.register("email")} placeholder="john@example.com" /></div>
                <div><Label>Password</Label><Input type="password" {...signupForm.register("password")} placeholder="••••••••" /></div>
                <div><Label>Role</Label>
                  <Select value={signupForm.watch("role")} onValueChange={(v) => signupForm.setValue("role", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="STUDENT">Student</SelectItem><SelectItem value="ADMIN">Admin</SelectItem><SelectItem value="TECHNICIAN">Technician</SelectItem><SelectItem value="MANAGER">Manager</SelectItem></SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-secondary text-secondary-foreground" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register"}</Button>
                <Button variant="ghost" className="w-full" onClick={() => setView("google")}>Back to Google Login</Button>
              </form>
            )}

            {view === "login" && (
              <form onSubmit={loginForm.handleSubmit(onEmailLogin)} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sign in as {selectedRole?.toLowerCase()}</p>
                </div>
                <div><Label>Email</Label><Input type="email" {...loginForm.register("email")} placeholder="john@example.com" /></div>
                <div><Label>Password</Label><Input type="password" {...loginForm.register("password")} placeholder="••••••••" /></div>
                <Button type="submit" className="w-full bg-secondary text-secondary-foreground" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}</Button>
                <div className="flex flex-col gap-2 pt-2">
                  <Button variant="outline" type="button" className="w-full" onClick={() => login(selectedRole || undefined)}>
                    Sign in with Google
                  </Button>
                  <Button variant="ghost" type="button" className="w-full" onClick={() => setView("google")}>Back to Role Selection</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
