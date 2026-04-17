import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, formatApiError } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Target, ArrowLeft, Loader2 } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, register } = useAuth();
  const [tab, setTab] = useState(searchParams.get("tab") || "login");
  const [loginLoading, setLoginLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => { if (user) navigate("/dashboard", { replace: true }); }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    const fd = new FormData(e.target);
    try {
      const u = await login(fd.get("email"), fd.get("password"));
      toast.success(`Welcome back, ${u.name || u.email}!`);
      navigate(u.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    const fd = new FormData(e.target);
    try {
      await register(fd.get("email"), fd.get("password"), fd.get("name"), fd.get("business_name"), fd.get("business_description"));
      toast.success("Account created! Grants are being matched...");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="font-['Outfit'] font-bold text-xl text-slate-900">GrantGrabber</span>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 rounded-lg h-10">
            <TabsTrigger data-testid="login-tab" value="login" className="rounded-md text-sm font-semibold font-['Outfit']">Log In</TabsTrigger>
            <TabsTrigger data-testid="register-tab" value="register" className="rounded-md text-sm font-semibold font-['Outfit']">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="font-['Outfit'] text-xl">Welcome Back</CardTitle>
                <CardDescription className="text-sm text-slate-500">Log in to view your grant portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <Input data-testid="login-email-input" id="login-email" name="email" type="email" required placeholder="you@business.com" className="h-10 rounded-lg border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <Input data-testid="login-password-input" id="login-password" name="password" type="password" required placeholder="Enter password" className="h-10 rounded-lg border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500" />
                  </div>
                  <Button data-testid="login-submit-btn" type="submit" disabled={loginLoading} className="w-full btn-emerald rounded-lg h-10 font-semibold">
                    {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="font-['Outfit'] text-xl">Create Account</CardTitle>
                <CardDescription className="text-sm text-slate-500">Start discovering grants for your business</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-sm font-medium">Full Name</Label>
                    <Input data-testid="register-name-input" id="reg-name" name="name" required placeholder="John Baker" className="h-10 rounded-lg border-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-sm font-medium">Email</Label>
                    <Input data-testid="register-email-input" id="reg-email" name="email" type="email" required placeholder="you@business.com" className="h-10 rounded-lg border-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-sm font-medium">Password</Label>
                    <Input data-testid="register-password-input" id="reg-password" name="password" type="password" required minLength={6} placeholder="Min 6 characters" className="h-10 rounded-lg border-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-biz" className="text-sm font-medium">Business Name</Label>
                    <Input data-testid="register-business-input" id="reg-biz" name="business_name" placeholder="Brampton Bakery Ltd." className="h-10 rounded-lg border-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-desc" className="text-sm font-medium">What does your business do?</Label>
                    <Input data-testid="register-description-input" id="reg-desc" name="business_description" placeholder="We specialize in artisan breads and catering..." className="h-10 rounded-lg border-slate-300" />
                  </div>
                  <Button data-testid="register-submit-btn" type="submit" disabled={regLoading} className="w-full btn-emerald rounded-lg h-10 font-semibold">
                    {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account & Find Grants"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <button data-testid="back-to-landing-btn" onClick={() => navigate("/")} className="mt-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mx-auto">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </button>
      </div>
    </div>
  );
}
