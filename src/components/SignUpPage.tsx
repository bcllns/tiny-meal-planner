import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { signUp } from "@/lib/auth";

interface SignUpPageProps {
  onSignUp: () => void;
  onSwitchToSignIn: () => void;
}

export function SignUpPage({ onSwitchToSignIn }: SignUpPageProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signUpError } = await signUp(email, fullName);

    if (signUpError) {
      setError(signUpError);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl">Create Account</CardTitle>
          <CardDescription className="text-base">Start planning delicious meals today</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-center">
              <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Check Your Email!</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                We've sent a confirmation link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-2">Click the link in the email to confirm your email address and sign in.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>
                <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required disabled={isLoading} autoComplete="name" />
              </div>

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
                    Sending confirmation link...
                  </>
                ) : (
                  "Continue with Email"
                )}
              </Button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button onClick={onSwitchToSignIn} className="text-primary hover:underline font-medium">
                  Sign in
                </button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
