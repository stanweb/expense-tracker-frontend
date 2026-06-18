"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { CircleAlert, Eye, EyeOff, Loader2, Lock, Sparkles, TrendingUp, User } from "lucide-react";

import { setAuthTokens } from "@/store/user-slice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import apiClient from "@/utils/apiClient";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,30}$/;

const validateUsername = (value: string): string | null => {
  const v = value.trim();
  if (!v) return "Username is required.";
  if (v.length < 3) return "Username must be at least 3 characters.";
  if (v.length > 30) return "Username must be 30 characters or fewer.";
  if (!USERNAME_PATTERN.test(v)) return "Use letters, numbers, dots, dashes, or underscores only.";
  return null;
};

const validatePassword = (value: string): string | null => {
  if (!value) return "Password is required.";
  if (value.length < 5) return "Password must be at least 6 characters.";
  return null;
};

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  // When arriving from /register, the username is passed as a query string
  // so the user only has to type their password.
  useEffect(() => {
    const prefill = searchParams.get("username");
    if (prefill) setUsername(prefill);
  }, [searchParams]);

  const handleUsernameBlur = () => {
    setUsernameError(validateUsername(username));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const uErr = validateUsername(username);
    const pErr = validatePassword(password);
    setUsernameError(uErr);
    setPasswordError(pErr);
    if (uErr || pErr) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/auth/login", { username: username.trim(), password });
      const data = response.data;

      dispatch(setAuthTokens({
        userId: data.userId,
        username: data.username,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        refreshExpiresIn: data.refreshExpiresIn,
        onboardingCompleted: data.onboardingCompleted,
      }));

      router.push(data.onboardingCompleted ? "/" : "/onboarding-wizard");
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 401) {
          setFormError("Invalid username or password.");
        } else {
          setFormError(`Sign-in failed (${err.response.status}). ${err.response.data?.message || "Please try again."}`);
        }
      } else if (err.request) {
        setFormError("Can't reach the server. Check your network and try again.");
      } else {
        setFormError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 md:grid-cols-2">
        {/* Brand panel — hidden on mobile */}
        <aside className="hidden md:flex flex-col justify-between p-10 lg:p-14">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Spending Tracker
            </span>
          </Link>

          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Real-time expense insights
            </span>
            <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground lg:text-4xl">
              See where your money goes, <span className="text-primary">without the spreadsheet</span>.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Track spending, set budgets, and get AI-powered categorization across all your
              accounts - all in one place.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Spending Tracker
          </p>
        </aside>

        {/* Form panel */}
        <main className="flex items-center justify-center p-6 sm:p-10">
          <Card className="w-full max-w-md border-border/60 bg-card/80 shadow-sm backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto mb-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary md:hidden">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription>
                Sign in to continue to your dashboard
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <InputGroup
                    aria-invalid={usernameError ? true : undefined}
                    data-invalid={usernameError ? true : undefined}
                  >
                    <InputGroupAddon align="inline-start">
                      <User className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="your_username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (usernameError) setUsernameError(null);
                      }}
                      onBlur={handleUsernameBlur}
                      disabled={isSubmitting}
                      aria-invalid={usernameError ? true : undefined}
                      aria-describedby={usernameError ? "username-error" : undefined}
                    />
                  </InputGroup>
                  {usernameError && (
                    <p
                      id="username-error"
                      className="flex items-center gap-1.5 text-xs text-destructive"
                    >
                      <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                      <span>{usernameError}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary hover:text-primary/80"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <InputGroup
                    aria-invalid={passwordError ? true : undefined}
                    data-invalid={passwordError ? true : undefined}
                  >
                    <InputGroupAddon align="inline-start">
                      <Lock className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                      }}
                      onBlur={handlePasswordBlur}
                      disabled={isSubmitting}
                      aria-invalid={passwordError ? true : undefined}
                      aria-describedby={passwordError ? "password-error" : undefined}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        size="icon-xs"
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={isSubmitting}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {passwordError && (
                    <p
                      id="password-error"
                      className="flex items-center gap-1.5 text-xs text-destructive"
                    >
                      <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                      <span>{passwordError}</span>
                    </p>
                  )}
                </div>

                {formError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{formError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <div className="relative my-2">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    or
                  </span>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  New here?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

const LoginPageWrapper = () => (
  // Suspense boundary is required because LoginPage calls useSearchParams.
  <Suspense fallback={null}>
    <LoginPage />
  </Suspense>
);

export default LoginPageWrapper;
