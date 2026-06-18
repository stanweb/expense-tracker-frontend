"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, Eye, EyeOff, Loader2, Lock, Mail, Sparkles, TrendingUp, User, UserPlus } from "lucide-react";

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
  if (value.length < 8) return "Password must be at least 8 characters.";
  return null;
};

const validateConfirmPassword = (value: string, password: string): string | null => {
  if (!value) return "Please confirm your password.";
  if (value !== password) return "Passwords do not match.";
  return null;
};

const NAME_PATTERN = /^[\p{L} '\-]{1,50}$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateName = (field: "First name" | "Last name", value: string): string | null => {
  const v = value.trim();
  if (!v) return `${field} is required.`;
  if (v.length > 50) return `${field} must be 50 characters or fewer.`;
  if (!NAME_PATTERN.test(v)) return `Enter a valid ${field.toLowerCase()}.`;
  return null;
};

const validateEmail = (value: string): string | null => {
  const v = value.trim();
  if (!v) return "Email is required.";
  if (!EMAIL_PATTERN.test(v)) return "Enter a valid email address.";
  return null;
};

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const fErr = validateName("First name", firstName);
    const lErr = validateName("Last name", lastName);
    const eErr = validateEmail(email);
    const uErr = validateUsername(username);
    const pErr = validatePassword(password);
    const cErr = validateConfirmPassword(confirmPassword, password);
    setFirstNameError(fErr);
    setLastNameError(lErr);
    setEmailError(eErr);
    setUsernameError(uErr);
    setPasswordError(pErr);
    setConfirmPasswordError(cErr);
    if (fErr || lErr || eErr || uErr || pErr || cErr) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/auth/register", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
      });
      const data = response.data;

      // The register endpoint returns no tokens, so the user has to sign in
      // with their new credentials. Redirect to /login with the username
      // pre-filled so they only have to type their password.
      const params = new URLSearchParams({ username: data.username ?? username.trim() });
      router.push(`/login?${params.toString()}`);
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 403) {
          setUsernameError("That username is already taken.");
        } else if (err.response.status === 400) {
          setFormError(err.response.data?.message || "Please check your details and try again.");
        } else {
          setFormError(`Sign-up failed (${err.response.status}). Please try again.`);
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
              Free forever — no card required
            </span>
            <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground lg:text-4xl">
              Take control of your money, <span className="text-primary">one transaction at a time</span>.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Create an account to track spending, set budgets, and let AI categorize your
              transactions automatically.
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
                Create your account
              </CardTitle>
              <CardDescription>
                Start tracking in under a minute
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <InputGroup
                      aria-invalid={firstNameError ? true : undefined}
                      data-invalid={firstNameError ? true : undefined}
                    >
                      <InputGroupAddon align="inline-start">
                        <User className="h-4 w-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="Jane"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (firstNameError) setFirstNameError(null);
                        }}
                        onBlur={() => setFirstNameError(validateName("First name", firstName))}
                        disabled={isSubmitting}
                        aria-invalid={firstNameError ? true : undefined}
                        aria-describedby={firstNameError ? "firstName-error" : undefined}
                      />
                    </InputGroup>
                    {firstNameError && (
                      <p
                        id="firstName-error"
                        className="flex items-center gap-1.5 text-xs text-destructive"
                      >
                        <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                        <span>{firstNameError}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <InputGroup
                      aria-invalid={lastNameError ? true : undefined}
                      data-invalid={lastNameError ? true : undefined}
                    >
                      <InputGroupAddon align="inline-start">
                        <User className="h-4 w-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (lastNameError) setLastNameError(null);
                        }}
                        onBlur={() => setLastNameError(validateName("Last name", lastName))}
                        disabled={isSubmitting}
                        aria-invalid={lastNameError ? true : undefined}
                        aria-describedby={lastNameError ? "lastName-error" : undefined}
                      />
                    </InputGroup>
                    {lastNameError && (
                      <p
                        id="lastName-error"
                        className="flex items-center gap-1.5 text-xs text-destructive"
                      >
                        <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                        <span>{lastNameError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <InputGroup
                    aria-invalid={emailError ? true : undefined}
                    data-invalid={emailError ? true : undefined}
                  >
                    <InputGroupAddon align="inline-start">
                      <Mail className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="[email protected]"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      onBlur={() => setEmailError(validateEmail(email))}
                      disabled={isSubmitting}
                      aria-invalid={emailError ? true : undefined}
                      aria-describedby={emailError ? "email-error" : undefined}
                    />
                  </InputGroup>
                  {emailError && (
                    <p
                      id="email-error"
                      className="flex items-center gap-1.5 text-xs text-destructive"
                    >
                      <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

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
                      onBlur={() => setUsernameError(validateUsername(username))}
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
                  <Label htmlFor="password">Password</Label>
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
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                        if (confirmPasswordError) {
                          setConfirmPasswordError(validateConfirmPassword(confirmPassword, e.target.value));
                        }
                      }}
                      onBlur={() => setPasswordError(validatePassword(password))}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <InputGroup
                    aria-invalid={confirmPasswordError ? true : undefined}
                    data-invalid={confirmPasswordError ? true : undefined}
                  >
                    <InputGroupAddon align="inline-start">
                      <Lock className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError) {
                          setConfirmPasswordError(validateConfirmPassword(e.target.value, password));
                        }
                      }}
                      onBlur={() => setConfirmPasswordError(validateConfirmPassword(confirmPassword, password))}
                      disabled={isSubmitting}
                      aria-invalid={confirmPasswordError ? true : undefined}
                      aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        size="icon-xs"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        disabled={isSubmitting}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        aria-pressed={showConfirmPassword}
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {confirmPasswordError && (
                    <p
                      id="confirm-password-error"
                      className="flex items-center gap-1.5 text-xs text-destructive"
                    >
                      <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                      <span>{confirmPasswordError}</span>
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
                      Creating account…
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create account
                    </>
                  )}
                </Button>

                <div className="relative my-2">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    or
                  </span>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Sign in
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

export default RegisterPage;
