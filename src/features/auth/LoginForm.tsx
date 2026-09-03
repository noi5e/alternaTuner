import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

import { supabase } from "@/lib/supabase";
import type {
  EmailOtpType,
  VerifyTokenHashParams,
} from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/features/auth/AuthContext";

function getAuthErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = error.code;

    switch (code) {
      case "over_email_send_rate_limit":
        return "Too many magic links have been sent. Please wait a bit before trying again.";
      case "over_request_rate_limit":
        return "Too many requests. Please wait a few minutes and try again.";
      case "otp_expired":
        return "This magic link has expired. Please request a new one.";
      case "email_address_invalid":
        return "Please enter a valid email address.";
      case "email_address_not_authorized":
        return "This email address is not allowed with the current email setup.";
      case "signup_disabled":
        return "New signups are currently disabled.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  return "Something went wrong. Please try again.";
}

export function LoginForm() {
  const [sendingLink, setSendingLink] = useState(false);
  const [email, setEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const { claims, loading } = useAuth();

  // Check URL params on initial render
  const [verifyingMagicLink, setVerifyingMagicLink] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get("token_hash"));
  });

  const hasVerifiedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have token_hash in URL (magic link callback)
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    const type = params.get("type");

    // hasVerified guards against double verifyOtp calls in React Strict Mode (dev only)
    if (!token_hash || hasVerifiedRef.current) {
      return;
    }

    hasVerifiedRef.current = true;

    async function verifyMagicLink() {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token_hash,
        type: (type || "email") as EmailOtpType,
      } as VerifyTokenHashParams);

      if (error) {
        setAuthError(error.message);
        setVerifyingMagicLink(false);
        return;
      }

      navigate("/", { replace: true });
    }

    verifyMagicLink();
  }, [navigate]);

  useEffect(() => {
    if (!loading && claims && !verifyingMagicLink) {
      navigate("/", { replace: true });
    }
  }, [verifyingMagicLink, navigate, claims, loading]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (sendingLink) return;

    setSendingLink(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/login",
      },
    });

    if (error) {
      setAuthError(getAuthErrorMessage(error));
    }

    setSendingLink(false);
  }

  // Show verification state
  if (verifyingMagicLink) {
    return (
      <div>
        <h1>Authentication</h1>
        <p>Confirming your magic link...</p>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-xl font-bold">Welcome to alternaTuner!</h1>
                <FieldDescription>
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="me@example.com"
                  value={email}
                  required
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={sendingLink || !email}>
                  {sendingLink ? "Sending..." : "Send Magic Link"}
                  {/* TO DO: add linkSent state to keep button disabled while waiting for user to confirm magic link, otherwise button reenables itself after Supabase Auth sends email, and user can spam the button*/}
                </Button>
                {authError && (
                  <p className="text-sm text-destructive" role="alert">
                    {authError}
                  </p>
                )}
              </Field>
              <FieldSeparator>Or</FieldSeparator>
              <Field className="grid gap-4 sm:grid-cols-2">
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Apple
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}
