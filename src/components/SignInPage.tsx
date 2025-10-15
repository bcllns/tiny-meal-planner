import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { signIn, verifyOtp } from "@/lib/auth";

interface SignInPageProps {
  onSignIn: () => void;
  onSwitchToSignUp: () => void;
}

export function SignInPage({ onSignIn, onSwitchToSignUp }: SignInPageProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email);

    if (signInError) {
      setError(signInError);
      setIsLoading(false);
    } else {
      setOtpSent(true);
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { user, error: verifyError } = await verifyOtp(email, otp);

    if (verifyError) {
      setError(verifyError);
      setIsLoading(false);
    } else if (user) {
      onSignIn();
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    setOtp("");

    const { error: signInError } = await signIn(email);

    if (signInError) {
      setError(signInError);
      setIsLoading(false);
    } else {
      setError(null);
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtp("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <CardDescription className="text-base">Sign in to your Meal Planner account</CardDescription>
        </CardHeader>
        <CardContent>
          {otpSent ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300 text-center">
                  We've sent a verification code to <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium">
                    Verification Code
                  </label>
                  <Input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code" required disabled={isLoading} autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" />
                  <p className="text-xs text-muted-foreground">Enter the 6-digit code from your email</p>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={handleChangeEmail} className="text-muted-foreground hover:text-foreground hover:underline">
                    Change email
                  </button>
                  <button type="button" onClick={handleResendOtp} disabled={isLoading} className="text-primary hover:underline font-medium disabled:opacity-50">
                    Resend code
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required disabled={isLoading} autoComplete="email" />
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Continue with Email"
                )}
              </Button>
            </form>
          )}

          {!otpSent && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={onSwitchToSignUp} className="text-primary hover:underline font-medium">
                  Sign up
                </button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
