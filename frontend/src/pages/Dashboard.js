import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import MoneyWheel from "@/components/MoneyWheel";
import GrantCard from "@/components/GrantCard";
import DeadlineCalendar from "@/components/DeadlineCalendar";
import LogoUpload from "@/components/LogoUpload";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DollarSign, TrendingUp, FileText, Loader2, CheckCircle, PenTool, Presentation, Sparkles, Upload, X, Download, RefreshCw } from "lucide-react";

const formatMoney = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
  return `$${val.toLocaleString()}`;
};

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(null);
  const [uploadDialog, setUploadDialog] = useState(null);
  const [aiDialog, setAiDialog] = useState(null);
  const [aiContent, setAiContent] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTab, setAiTab] = useState("grant_narrative");
  const [uploadFile, setUploadFile] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const fileInputRef = useRef(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data: d } = await api.get("/dashboard");
      setData(d);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // Check for payment return
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const payment = searchParams.get("payment");
    if (payment === "success" && sessionId) {
      const pollStatus = async (attempts = 0) => {
        if (attempts >= 5) return;
        try {
          const { data: tx } = await api.get(`/payments/status/${sessionId}`);
          if (tx.payment_status === "paid") {
            toast.success("Payment successful! Commission paid.");
            fetchDashboard();
            return;
          }
        } catch {}
        setTimeout(() => pollStatus(attempts + 1), 2000);
      };
      pollStatus();
    } else if (payment === "cancelled") {
      toast.info("Payment was cancelled.");
    }
  }, [searchParams, fetchDashboard]);

  const handleAction = async (clientGrant, action) => {
    if (action === "review") { setReviewDialog(clientGrant); return; }
    if (action === "upload_document") { setUploadDialog(clientGrant); setUploadFile(null); return; }
    if (action === "pay") { handlePayment(clientGrant); return; }
    setActionLoading(clientGrant.grant_id);
    try {
      await api.post(`/client/grants/${clientGrant.grant_id}/action`, { action });
      toast.success(`Grant action completed!`);
      await fetchDashboard();
    } catch {
      toast.error("Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveSubmit = async () => {
    if (!reviewDialog) return;
    setActionLoading(reviewDialog.grant_id);
    try {
      await api.post(`/client/grants/${reviewDialog.grant_id}/action`, { action: "approve" });
      toast.success("Application approved and submitted!");
      setReviewDialog(null);
      await fetchDashboard();
    } catch { toast.error("Submit failed"); }
    finally { setActionLoading(null); }
  };

  const handleFileUpload = async () => {
    if (!uploadDialog || !uploadFile) return;
    setActionLoading(uploadDialog.grant_id);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      await api.post(`/client/grants/${uploadDialog.grant_id}/upload-doc`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded successfully!");
      setUploadDialog(null);
      setUploadFile(null);
      await fetchDashboard();
    } catch {
      toast.error("Upload failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayment = async (clientGrant) => {
    setActionLoading(clientGrant.grant_id);
    try {
      const { data: checkout } = await api.post("/payments/create-checkout", {
        grant_id: clientGrant.grant_id,
        origin_url: window.location.origin,
      });
      if (checkout.url) window.location.href = checkout.url;
    } catch (err) {
      toast.error("Payment initialization failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAiGenerate = async (serviceType, grantId = null) => {
    setAiLoading(true);
    setAiContent("");
    try {
      const { data: result } = await api.post("/ai/generate", {
        service_type: serviceType,
        grant_id: grantId,
      });
      setAiContent(result.content);
      if (serviceType === "grant_narrative" && grantId) {
        toast.success("Draft updated with AI-generated narrative!");
        fetchDashboard();
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "AI generation failed";
      const isBudget = msg.toLowerCase().includes("budget");
      toast.error(isBudget ? "Emergent key budget exceeded. Add balance in Profile → Universal Key → Add Balance." : msg);
      setAiContent(isBudget ? "Budget exceeded. Please add balance to your Emergent Universal Key:\n\nProfile → Universal Key → Add Balance (or enable auto top-up)\n\nOnce balance is added, click Regenerate." : "Generation failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiMatchGrants = async () => {
    setMatchLoading(true);
    try {
      const { data: result } = await api.post("/ai/match-grants");
      toast.success(`AI re-matched ${result.total} grants! Email notification sent.`);
      await fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.detail || "AI matching failed");
    } finally {
      setMatchLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!aiContent) return;
    setDownloadLoading("pdf");
    try {
      const response = await api.post("/ai/generate-pdf", {
        content: aiContent,
        title: aiTab === "business_plan" ? "Business Plan" : aiTab === "grant_narrative" ? "Grant Narrative" : "Pitch Deck",
      }, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const a = document.createElement("a"); a.href = url; a.download = `${aiTab}_${Date.now()}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch { toast.error("PDF generation failed"); }
    finally { setDownloadLoading(null); }
  };

  const handleDownloadPpt = async () => {
    if (!aiContent) return;
    setDownloadLoading("ppt");
    try {
      const response = await api.post("/ai/generate-ppt", {
        content: aiContent,
        title: aiTab === "pitch_deck" ? "Pitch Deck" : aiTab === "business_plan" ? "Business Plan" : "Grant Narrative",
      }, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }));
      const a = document.createElement("a"); a.href = url; a.download = `${aiTab}_${Date.now()}.pptx`; a.click();
      URL.revokeObjectURL(url);
      toast.success("PPT downloaded!");
    } catch { toast.error("PPT generation failed"); }
    finally { setDownloadLoading(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]"><Navbar />
        <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      </div>
    );
  }

  const { user, grants = [], total_potential = 0, total_secured = 0, total_grants = 0 } = data || {};
  const sortedGrants = [...grants].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="dashboard-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600 mb-1 font-['Outfit']">Grant Portfolio</p>
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{user?.business_name || "Your Business"}</h1>
          <p className="text-base text-slate-500 mt-1">AI-matched grants — apply directly to federal & provincial agencies from here</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: DollarSign, label: "Total Potential", value: formatMoney(total_potential), color: "text-amber-500", bg: "bg-amber-50" },
            { icon: TrendingUp, label: "Total Secured", value: formatMoney(total_secured), color: "text-emerald-500", bg: "bg-emerald-50" },
            { icon: FileText, label: "Grants Matched", value: total_grants, color: "text-blue-500", bg: "bg-blue-50" },
          ].map((stat, i) => (
            <Card key={i} className={`border-slate-200 bg-white shadow-sm animate-fade-in-up stagger-${i + 1}`}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className="font-['Outfit'] text-3xl font-bold text-slate-900" data-testid={`stat-${stat.label.replace(/\s+/g, '-').toLowerCase()}`}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Services Bar */}
        <Card className="border-slate-200 bg-white shadow-sm mb-8 animate-fade-in-up stagger-4">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span className="font-['Outfit'] text-base font-semibold text-slate-900">AI Business Services</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  data-testid="ai-rematch-btn"
                  onClick={handleAiMatchGrants}
                  disabled={matchLoading}
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-7 px-3"
                >
                  {matchLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                  {matchLoading ? "AI Matching..." : "Re-Match with AI"}
                </Button>
                <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] font-bold">Powered by Claude AI</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: FileText, title: "Grant Narrative", desc: "AI-draft for any grant", type: "grant_narrative" },
                { icon: PenTool, title: "Business Plan", desc: "Executive summary & plan", type: "business_plan" },
                { icon: Presentation, title: "Pitch Deck", desc: "10-slide deck outline", type: "pitch_deck" },
              ].map((svc) => (
                <button
                  key={svc.type}
                  data-testid={`ai-service-${svc.type}`}
                  onClick={() => { setAiDialog(svc); setAiContent(""); setAiTab(svc.type); }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition-colors">
                    <svc.icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{svc.title}</p>
                    <p className="text-xs text-slate-400">{svc.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Grid: Money Wheel + Calendar + Grants */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[280px]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 font-['Outfit']">Fund Tracker</p>
                <MoneyWheel secured={total_secured} potential={total_potential} />
              </CardContent>
            </Card>
            <LogoUpload />
            <DeadlineCalendar grants={sortedGrants} />
          </div>
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Outfit'] text-xl font-semibold text-slate-900">Your Grant Opportunities</h2>
              <span className="text-xs text-slate-400 font-medium">{total_grants} grants matched</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedGrants.map((cg, i) => (
                <GrantCard key={cg.id || cg.grant_id} clientGrant={cg} onAction={handleAction} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Draft Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
        <DialogContent className="sm:max-w-lg rounded-xl border-slate-200" data-testid="review-draft-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Outfit'] text-xl">Review Application Draft</DialogTitle>
            <DialogDescription>{reviewDialog?.grant?.name} - AI-generated draft</DialogDescription>
          </DialogHeader>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 max-h-[300px] overflow-y-auto">
            <pre className="text-base text-slate-700 whitespace-pre-wrap font-['Manrope'] leading-relaxed" data-testid="draft-content">
              {reviewDialog?.draft_content || "No draft yet. Use AI to generate one."}
            </pre>
          </div>
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Submit to {reviewDialog?.grant?.provider || "Government Agency"}</p>
              <p className="text-sm text-emerald-700">This application will be submitted directly to the granting agency on your behalf. You only pay the success fee if approved.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button data-testid="ai-redraft-btn" variant="outline" onClick={() => { setReviewDialog(null); setAiDialog({ type: "grant_narrative", title: "Grant Narrative" }); setAiContent(""); handleAiGenerate("grant_narrative", reviewDialog?.grant_id); }} className="rounded-lg border-slate-300">
              <Sparkles className="w-4 h-4 mr-1.5" /> AI Redraft
            </Button>
            <Button data-testid="approve-submit-btn" onClick={handleApproveSubmit} disabled={actionLoading === reviewDialog?.grant_id} className="btn-emerald rounded-lg font-semibold px-6">
              {actionLoading === reviewDialog?.grant_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Approve & Submit to {reviewDialog?.grant?.provider?.split(" ")[0] || "Agency"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Documents Dialog */}
      <Dialog open={!!uploadDialog} onOpenChange={() => { setUploadDialog(null); setUploadFile(null); }}>
        <DialogContent className="sm:max-w-md rounded-xl border-slate-200" data-testid="upload-docs-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Outfit'] text-xl">Upload Documents</DialogTitle>
            <DialogDescription>{uploadDialog?.grant?.name} requires documentation</DialogDescription>
          </DialogHeader>
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.csv"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)} data-testid="file-input"
          />
          {uploadFile ? (
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{uploadFile.name}</p>
                  <p className="text-xs text-slate-500">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={() => setUploadFile(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:border-emerald-400 transition-colors cursor-pointer"
              data-testid="upload-dropzone"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 mb-1">Click to select a file</p>
              <p className="text-xs text-slate-400">PDF, DOC, images, spreadsheets (NOA, financials, etc.)</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setUploadDialog(null); setUploadFile(null); }} className="rounded-lg border-slate-300">Cancel</Button>
            <Button data-testid="submit-docs-btn" onClick={handleFileUpload} disabled={!uploadFile || actionLoading === uploadDialog?.grant_id} className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">
              {actionLoading === uploadDialog?.grant_id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload & Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generation Dialog */}
      <Dialog open={!!aiDialog} onOpenChange={() => setAiDialog(null)}>
        <DialogContent className="sm:max-w-2xl rounded-xl border-slate-200" data-testid="ai-generation-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Outfit'] text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" /> AI Content Generator
            </DialogTitle>
            <DialogDescription>Generate professional business documents using AI</DialogDescription>
          </DialogHeader>
          <Tabs value={aiTab} onValueChange={(v) => { setAiTab(v); setAiContent(""); }}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-lg h-10 mb-4">
              <TabsTrigger data-testid="ai-tab-narrative" value="grant_narrative" className="rounded-md text-xs font-semibold font-['Outfit']">Grant Narrative</TabsTrigger>
              <TabsTrigger data-testid="ai-tab-plan" value="business_plan" className="rounded-md text-xs font-semibold font-['Outfit']">Business Plan</TabsTrigger>
              <TabsTrigger data-testid="ai-tab-deck" value="pitch_deck" className="rounded-md text-xs font-semibold font-['Outfit']">Pitch Deck</TabsTrigger>
            </TabsList>
            {["grant_narrative", "business_plan", "pitch_deck"].map((type) => (
              <TabsContent key={type} value={type}>
                <div className="space-y-4">
                  {!aiContent && !aiLoading && (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                      <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 mb-4">
                        {type === "grant_narrative" ? "Generate a professional grant application narrative" :
                         type === "business_plan" ? "Generate an executive summary and business plan" :
                         "Generate a 10-slide pitch deck outline with speaker notes"}
                      </p>
                      <Button data-testid={`generate-${type}-btn`} onClick={() => handleAiGenerate(type)} className="btn-emerald rounded-lg font-semibold">
                        <Sparkles className="w-4 h-4 mr-2" /> Generate with AI
                      </Button>
                    </div>
                  )}
                  {aiLoading && (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">AI is generating your content...</p>
                      <p className="text-xs text-slate-400 mt-1">This may take 15-30 seconds</p>
                    </div>
                  )}
                  {aiContent && !aiLoading && (
                    <div className="bg-white border border-slate-200 rounded-lg p-5 max-h-[400px] overflow-y-auto">
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-['Manrope'] leading-relaxed" data-testid="ai-generated-content">{aiContent}</pre>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          {aiContent && !aiLoading && (
            <DialogFooter className="gap-2 flex-wrap">
              <Button variant="outline" onClick={() => { setAiContent(""); }} className="rounded-lg border-slate-300">
                <Sparkles className="w-4 h-4 mr-1.5" /> Regenerate
              </Button>
              {!aiContent.toLowerCase().includes("failed") && (
                <>
                  <Button
                    data-testid="download-pdf-btn"
                    variant="outline"
                    onClick={handleDownloadPdf}
                    disabled={downloadLoading === "pdf"}
                    className="rounded-lg border-slate-300"
                  >
                    {downloadLoading === "pdf" ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Download className="w-4 h-4 mr-1.5" />}
                    Download PDF
                  </Button>
                  {aiTab === "pitch_deck" && (
                    <Button
                      data-testid="download-ppt-btn"
                      variant="outline"
                      onClick={handleDownloadPpt}
                      disabled={downloadLoading === "ppt"}
                      className="rounded-lg border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      {downloadLoading === "ppt" ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Presentation className="w-4 h-4 mr-1.5" />}
                      Download PPT
                    </Button>
                  )}
                  <Button data-testid="copy-ai-content-btn" onClick={() => { navigator.clipboard.writeText(aiContent); toast.success("Copied to clipboard!"); }} className="btn-emerald rounded-lg font-semibold">
                    Copy to Clipboard
                  </Button>
                </>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
