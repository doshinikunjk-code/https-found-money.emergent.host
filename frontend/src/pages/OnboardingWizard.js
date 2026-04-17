import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Target, ArrowRight, ArrowLeft, Building2, FileText, ImageIcon,
  Sparkles, CheckCircle, Loader2, Upload, Briefcase, Stethoscope,
  Monitor, Leaf, Lightbulb, Globe, ShoppingBag, Truck,
} from "lucide-react";

const INDUSTRIES = [
  { id: "health_tech", label: "Health Tech", icon: Stethoscope, desc: "Medical devices, health apps, biotech" },
  { id: "saas", label: "SaaS / Software", icon: Monitor, desc: "Cloud platforms, enterprise software" },
  { id: "clean_tech", label: "Clean Tech", icon: Leaf, desc: "Sustainability, energy, environment" },
  { id: "innovation", label: "R&D / Innovation", icon: Lightbulb, desc: "Research, patents, new technology" },
  { id: "export", label: "Export / Trade", icon: Globe, desc: "International markets, cross-border" },
  { id: "ecommerce", label: "E-Commerce / Retail", icon: ShoppingBag, desc: "Online stores, retail tech" },
  { id: "manufacturing", label: "Manufacturing", icon: Truck, desc: "Production, supply chain, logistics" },
  { id: "professional", label: "Professional Services", icon: Briefcase, desc: "Consulting, finance, legal" },
];

const TOTAL_STEPS = 4;

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchDone, setMatchDone] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    business_name: user?.business_name || "",
    business_description: user?.business_description || "",
    industry: "",
  });

  const updateField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSaveProfile = async () => {
    if (!form.business_name.trim()) { toast.error("Business name is required"); return; }
    if (!form.business_description.trim()) { toast.error("Please describe your business"); return; }
    setSaving(true);
    try {
      await api.post("/onboarding/update-profile", form);
      toast.success("Profile saved!");
      setStep(2);
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleSelectIndustry = async (id) => {
    updateField("industry", id);
    setSaving(true);
    try {
      await api.post("/onboarding/update-profile", { industry: id });
      setTimeout(() => { setSaving(false); setStep(3); }, 300);
    } catch { setSaving(false); toast.error("Failed to save"); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2MB"); return; }
    setLogoUploading(true);
    setLogoPreview(URL.createObjectURL(file));
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.post("/client/upload-logo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Logo uploaded!");
    } catch { toast.error("Upload failed"); setLogoPreview(null); }
    finally { setLogoUploading(false); }
  };

  const handleRunMatching = async () => {
    setMatching(true);
    try {
      const { data } = await api.post("/ai/match-grants");
      toast.success(`AI matched ${data.total} grants to your business!`);
      setMatchDone(true);
    } catch {
      toast.info("Basic matching applied. AI matching can be done later from dashboard.");
      setMatchDone(true);
    } finally { setMatching(false); }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await api.post("/onboarding/complete");
      await refreshUser();
      toast.success("Welcome to GrantGrabber!");
      navigate("/dashboard", { replace: true });
    } catch { toast.error("Failed to complete"); }
    finally { setSaving(false); }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col" data-testid="onboarding-wizard">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-['Outfit'] font-bold text-lg text-slate-900">GrantGrabber</span>
          </div>
          <span className="text-xs text-slate-400 font-medium font-['Outfit']">Step {step} of {TOTAL_STEPS}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-emerald-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl animate-fade-in-up">

          {/* Step 1: Business Info */}
          {step === 1 && (
            <div data-testid="onboarding-step-1">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-emerald-600" />
                </div>
                <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Tell us about your business</h1>
                <p className="text-sm text-slate-500">We'll use this to match you with the best government grants.</p>
              </div>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Business Name *</Label>
                    <Input
                      data-testid="onboarding-business-name"
                      value={form.business_name}
                      onChange={(e) => updateField("business_name", e.target.value)}
                      placeholder="e.g., LiverLytics (Mukesoft)"
                      className="h-11 rounded-lg border-slate-300 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">What does your business do? *</Label>
                    <textarea
                      data-testid="onboarding-business-desc"
                      value={form.business_description}
                      onChange={(e) => updateField("business_description", e.target.value)}
                      placeholder="Describe your products, services, and target market. The more detail, the better we can match grants..."
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                    />
                  </div>
                  <Button
                    data-testid="onboarding-next-1"
                    onClick={handleSaveProfile}
                    disabled={saving || !form.business_name.trim() || !form.business_description.trim()}
                    className="w-full btn-emerald rounded-lg h-11 text-base font-semibold"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5 ml-2" /></>}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Industry */}
          {step === 2 && (
            <div data-testid="onboarding-step-2">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-7 h-7 text-emerald-600" />
                </div>
                <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Select your industry</h1>
                <p className="text-sm text-slate-500">This helps us prioritize the most relevant grant programs.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.id}
                    data-testid={`industry-${ind.id}`}
                    onClick={() => handleSelectIndustry(ind.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all hover:border-emerald-400 hover:bg-emerald-50/50 ${
                      form.industry === ind.id ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      form.industry === ind.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <ind.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{ind.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ind.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button data-testid="onboarding-back-2" onClick={() => setStep(1)} className="mt-4 flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mx-auto">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>
          )}

          {/* Step 3: Logo */}
          {step === 3 && (
            <div data-testid="onboarding-step-3">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-7 h-7 text-emerald-600" />
                </div>
                <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Upload your logo</h1>
                <p className="text-sm text-slate-500">Your logo will appear on generated PDFs and pitch decks.</p>
              </div>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <input ref={fileRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} data-testid="onboarding-logo-input" />
                  {logoPreview ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-32 h-32 rounded-2xl border-2 border-emerald-200 bg-white flex items-center justify-center overflow-hidden p-3">
                        <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Logo uploaded!</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="rounded-lg border-slate-300 text-xs">
                        Change Logo
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                      data-testid="onboarding-logo-dropzone"
                    >
                      {logoUploading ? (
                        <Loader2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 animate-spin" />
                      ) : (
                        <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      )}
                      <p className="text-sm font-medium text-slate-600 mb-1">Click to upload your logo</p>
                      <p className="text-xs text-slate-400">PNG, JPEG, SVG, or WebP (max 2MB)</p>
                    </div>
                  )}
                  <div className="flex gap-3 mt-6">
                    <Button data-testid="onboarding-skip-logo" variant="outline" onClick={() => setStep(4)} className="flex-1 rounded-lg h-11 border-slate-300 text-sm font-medium">
                      Skip for now
                    </Button>
                    <Button data-testid="onboarding-next-3" onClick={() => setStep(4)} disabled={logoUploading} className="flex-1 btn-emerald rounded-lg h-11 text-sm font-semibold">
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <button data-testid="onboarding-back-3" onClick={() => setStep(2)} className="mt-4 flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mx-auto">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>
          )}

          {/* Step 4: AI Matching & Complete */}
          {step === 4 && (
            <div data-testid="onboarding-step-4">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-emerald-600" />
                </div>
                <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  {matchDone ? "You're all set!" : "Find your grants"}
                </h1>
                <p className="text-sm text-slate-500">
                  {matchDone ? "Your personalized grant portfolio is ready." : "Let AI analyze your business and match it with government grants."}
                </p>
              </div>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  {/* Summary */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">Business</p>
                        <p className="text-sm font-semibold text-slate-900">{form.business_name || "Your Business"}</p>
                      </div>
                    </div>
                    {form.industry && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Briefcase className="w-5 h-5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400">Industry</p>
                          <p className="text-sm font-semibold text-slate-900">{INDUSTRIES.find((i) => i.id === form.industry)?.label || form.industry}</p>
                        </div>
                      </div>
                    )}
                    {logoPreview && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 rounded border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <img src={logoPreview} alt="" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Logo</p>
                          <p className="text-sm font-semibold text-emerald-600">Uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!matchDone ? (
                    <Button
                      data-testid="onboarding-run-matching"
                      onClick={handleRunMatching}
                      disabled={matching}
                      className="w-full btn-emerald rounded-lg h-12 text-base font-semibold shadow-lg shadow-emerald-500/20"
                    >
                      {matching ? (
                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> AI is analyzing grants...</>
                      ) : (
                        <><Sparkles className="w-5 h-5 mr-2" /> Run AI Grant Matching</>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">Grants matched!</p>
                          <p className="text-xs text-emerald-600">Your personalized grant portfolio is ready to explore.</p>
                        </div>
                      </div>
                      <Button
                        data-testid="onboarding-complete-btn"
                        onClick={handleComplete}
                        disabled={saving}
                        className="w-full btn-emerald rounded-lg h-12 text-base font-semibold shadow-lg shadow-emerald-500/20"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Go to My Dashboard <ArrowRight className="w-5 h-5 ml-2" /></>}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              <button data-testid="onboarding-back-4" onClick={() => setStep(3)} className="mt-4 flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mx-auto">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
