import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { login } = useAuth();

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
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Choose a role to explore the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-border hover:bg-muted bg-white text-black"
              onClick={() => login()}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
              <span className="font-semibold text-base">Sign in with Google</span>
            </Button>

            <div className="mt-6 p-4 rounded-lg bg-secondary/5 border border-secondary/10">
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
