import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cpu } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Bytewave" }] }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  fullName: z.string().trim().min(1).max(100).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const submit = async (mode: "in" | "up") => {
    setLoading(true);
    try {
      const parsed = schema.parse({ email, password, fullName: mode === "up" ? fullName : undefined });
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email: parsed.email,
          password: parsed.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created! You're signed in.");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.email,
          password: parsed.password,
        });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: "/dashboard" });
      }
    } catch (e) {
      const msg = e instanceof z.ZodError ? e.issues[0].message : (e as Error).message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary glow">
            <Cpu className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Byte<span className="text-gradient">wave</span></span>
        </Link>

        <div className="glass rounded-2xl p-8 shadow-card">
          <Tabs defaultValue="in">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="in">Sign in</TabsTrigger>
              <TabsTrigger value="up">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="in" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="e1">Email</Label>
                <Input id="e1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="p1">Password</Label>
                <Input id="p1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button onClick={() => submit("in")} disabled={loading} className="w-full bg-gradient-primary text-primary-foreground">
                Sign in
              </Button>
            </TabsContent>
            <TabsContent value="up" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="n2">Full name</Label>
                <Input id="n2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="e2">Email</Label>
                <Input id="e2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="p2">Password</Label>
                <Input id="p2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
              </div>
              <Button onClick={() => submit("up")} disabled={loading} className="w-full bg-gradient-primary text-primary-foreground">
                Create account
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
