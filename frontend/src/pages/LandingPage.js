import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Target, FileText, TrendingUp, DollarSign, Users, Cpu, PenTool, Presentation, Sparkles } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-surface border-b border-slate-200/60" data-testid="landing-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-['Outfit'] font-bold text-lg text-slate-900">GrantGrabber</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button data-testid="nav-dashboard-btn" onClick={() => navigate("/dashboard")} className="btn-emerald rounded-lg px-5 h-9 text-sm font-semibold">
                Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button data-testid="nav-login-btn" variant="ghost" onClick={() => navigate("/auth")} className="text-sm font-medium text-slate-600 hover:text-slate-900">Log In</Button>
                <Button data-testid="nav-signup-btn" onClick={() => navigate("/auth?tab=register")} className="btn-emerald rounded-lg px-5 h-9 text-sm font-semibold">Get Started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20 px-4 sm:px-6 lg:px-8" data-testid="hero-section">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-4 animate-fade-in-up font-['Outfit']">AI-Powered Grant Discovery</p>
            <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6 animate-fade-in-up stagger-1">
              We Find Hidden<br />
              <span className="text-gradient-emerald">Government Money</span><br />
              For Your Business
            </h1>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mb-8 animate-fade-in-up stagger-2 font-['Manrope']">
              AI-powered grant matching. We write the applications, draft your business plan, and prepare your pitch deck. You only pay when approved. Zero risk.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in-up stagger-3">
              <Button data-testid="hero-cta-btn" onClick={() => navigate(user ? "/dashboard" : "/auth?tab=register")} className="btn-emerald rounded-lg px-8 h-12 text-base font-semibold shadow-lg shadow-emerald-500/20">
                Find My Grants <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button data-testid="hero-demo-btn" variant="outline" onClick={() => navigate("/auth")} className="rounded-lg px-8 h-12 text-base font-medium border-slate-300 hover:border-slate-400">
                Log In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-200 bg-white py-8" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "$2.5M+", label: "Grants Identified", icon: DollarSign },
              { value: "150+", label: "Canadian Businesses Served", icon: Users },
              { value: "96%", label: "Avg Match Score", icon: Target },
              { value: "10x", label: "ROI on Commission", icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-emerald-500" />
                  <span className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</span>
                </div>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grant Types */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white" data-testid="grant-types-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3 font-['Outfit']">Types of Government Assistance</p>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
              Refundable & Non-Refundable Grants
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-8 relative card-hover">
              <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-0 text-xs font-bold px-3">Recommended</Badge>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-['Outfit'] text-xl font-bold text-slate-900 mb-2">Non-Refundable Grants</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Free money for your business. Once approved, funds are yours to keep with no repayment obligation. Most federal and provincial SME grants fall into this category.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> No repayment required</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Covers up to 50-75% of project costs</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Examples: CanExport, Digital Adoption, Job Grant</li>
              </ul>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-8 card-hover">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="font-['Outfit'] text-xl font-bold text-slate-900 mb-2">Refundable Contributions</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Interest-free or low-interest loans from government programs. Must be repaid over time, but often with favorable terms and grace periods.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Repayment required (flexible terms)</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Often 0% or low interest</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Examples: IRAP, BDC, regional funds</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3 font-['Outfit']">How It Works</p>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">Three Steps to Free Money</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Search, title: "Scan Your Business", desc: "We analyze your business profile to understand your operations, industry, and growth potential." },
              { step: "02", icon: Target, title: "AI Grant Matching", desc: "Our AI cross-references your profile against hundreds of federal and provincial grant programs to find matches." },
              { step: "03", icon: FileText, title: "We Write & Submit", desc: "AI generates the full application narrative, you approve it, and we submit. You only pay when approved." },
            ].map((item, i) => (
              <div key={i} className={`bg-white border border-slate-200 rounded-xl p-8 card-hover animate-fade-in-up stagger-${i + 1}`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-['Outfit'] text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Step {item.step}</span>
                </div>
                <h3 className="font-['Outfit'] text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Services */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" data-testid="ai-services-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3 font-['Outfit']">AI-Powered Services</p>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">Beyond Grant Applications</h2>
            <p className="text-base text-slate-500 mt-3 max-w-2xl mx-auto">Our AI doesn't just find grants. It helps you build the complete business toolkit to maximize your chances.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: "Grant Narratives", desc: "AI-drafted grant application narratives tailored to each program's requirements and your business profile.", tag: "Core" },
              { icon: PenTool, title: "Business Plan Drafting", desc: "Complete executive summary and business plan generated from your business profile, ready for investors or grant committees.", tag: "New" },
              { icon: Presentation, title: "Pitch Deck Preparation", desc: "10-slide investor-ready pitch deck outline with speaker notes, market analysis, and financial projections.", tag: "New" },
              { icon: Cpu, title: "AI Match Scoring", desc: "Intelligent matching algorithm analyzes eligibility criteria against your business to surface the best opportunities.", tag: "Core" },
              { icon: Sparkles, title: "Document Analysis", desc: "Upload your financial documents and let AI extract key metrics to strengthen your applications.", tag: "Coming Soon" },
              { icon: Target, title: "Success Tracking", desc: "Real-time tracking of application status, approval timelines, and portfolio performance.", tag: "Core" },
            ].map((svc, i) => (
              <div key={i} className={`border border-slate-200 rounded-xl p-6 card-hover animate-fade-in-up stagger-${(i % 3) + 1}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svc.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <Badge className={`text-[10px] font-bold border-0 ${svc.tag === "New" ? "bg-amber-100 text-amber-700" : svc.tag === "Coming Soon" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>{svc.tag}</Badge>
                </div>
                <h3 className="font-['Outfit'] text-lg font-semibold text-slate-900 mb-2">{svc.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900" data-testid="cta-section">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">Stop Leaving Money on the Table</h2>
          <p className="text-base text-slate-400 mb-8 max-w-lg mx-auto">
            Join 150+ Canadian businesses that have discovered grants they didn't know existed. Zero upfront cost. Commission only on approval.
          </p>
          <Button data-testid="cta-btn" onClick={() => navigate(user ? "/dashboard" : "/auth?tab=register")} className="btn-emerald rounded-lg px-10 h-12 text-base font-semibold shadow-lg shadow-emerald-500/30">
            Get Your Free Grant Report <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 bg-white" data-testid="footer">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center"><Target className="w-3 h-3 text-white" /></div>
            <span className="font-['Outfit'] font-bold text-sm text-slate-900">GrantGrabber</span>
          </div>
          <p className="text-xs text-slate-400">Success-fee model. You only pay when your grant is approved.</p>
        </div>
      </footer>
    </div>
  );
}
