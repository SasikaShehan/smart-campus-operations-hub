import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TwoFactorStatus {
  enabled: boolean;
  verified: boolean;
}

export default function TwoFactorSettingsPage() {
  const [status, setStatus] = useState<TwoFactorStatus>({ enabled: false, verified: false });
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [disablingCode, setDisablingCode] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await api.get("/2fa/status");
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    setSetupLoading(true);
    try {
      const data = await api.post("/2fa/setup", {});
      setQrCode(data.qrCode);
      setSecret(data.secret);
      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code with your authenticator app",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: "Failed to setup two-factor authentication",
      });
    } finally {
      setSetupLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      toast({
        variant: "destructive",
        title: "Verification Code Required",
        description: "Please enter the code from your authenticator app",
      });
      return;
    }

    try {
      const data = await api.post("/2fa/verify", { code: verificationCode });
      if (data.success) {
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been enabled successfully",
        });
        fetchStatus();
        setQrCode(null);
        setSecret(null);
        setVerificationCode("");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Invalid verification code",
      });
    }
  };

  const handleDisable = async () => {
    if (!disablingCode) {
      toast({
        variant: "destructive",
        title: "Verification Code Required",
        description: "Please enter the code to disable 2FA",
      });
      return;
    }

    try {
      const data = await api.post("/2fa/disable", { code: disablingCode });
      if (data.success) {
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled",
        });
        fetchStatus();
        setDisablingCode("");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Disable Failed",
        description: "Invalid verification code",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {status.enabled ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-gray-400" />
              )}
              <div>
                <p className="font-medium">2FA Status</p>
                <p className="text-sm text-muted-foreground">
                  {status.enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
            {status.enabled && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Active
              </span>
            )}
          </div>

          {!status.enabled && !qrCode && (
            <Button onClick={handleSetup} disabled={setupLoading} className="w-full">
              {setupLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Enable Two-Factor Authentication"
              )}
            </Button>
          )}

          {qrCode && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <img src={qrCode} alt="2FA QR Code" className="mx-auto border rounded-lg" />
                {secret && (
                  <p className="mt-4 text-sm">
                    Or enter this code manually:{" "}
                    <code className="bg-muted px-2 py-1 rounded">{secret}</code>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  placeholder="Enter 6-digit code from your app"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleVerify} className="flex-1">
                  Verify & Enable
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQrCode(null);
                    setSecret(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {status.enabled && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To disable two-factor authentication, enter a code from your authenticator app:
              </p>
              <div className="space-y-2">
                <Input
                  placeholder="Enter 6-digit code"
                  value={disablingCode}
                  onChange={(e) => setDisablingCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button onClick={handleDisable} variant="destructive" className="w-full">
                Disable Two-Factor Authentication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}