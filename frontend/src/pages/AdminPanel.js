import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, FileText, TrendingUp, CheckCircle, Plus, Loader2, Building2, Mail, Calendar } from "lucide-react";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGrant, setShowCreateGrant] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [clientsRes, statsRes, grantsRes] = await Promise.all([
        api.get("/admin/clients"),
        api.get("/admin/stats"),
        api.get("/grants"),
      ]);
      setClients(clientsRes.data);
      setStats(statsRes.data);
      setGrants(grantsRes.data);
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") { navigate("/dashboard"); return; }
    fetchData();
  }, [user, navigate, fetchData]);

  const handleCreateGrant = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    const fd = new FormData(e.target);
    try {
      await api.post("/admin/grants", {
        name: fd.get("name"),
        description: fd.get("description"),
        max_amount: parseFloat(fd.get("max_amount")),
        category: fd.get("category"),
        eligibility: fd.get("eligibility"),
        provider: fd.get("provider"),
        grant_type: fd.get("grant_type") || "non_refundable",
      });
      toast.success("Grant created successfully!");
      setShowCreateGrant(false);
      fetchData();
    } catch {
      toast.error("Failed to create grant");
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="admin-panel">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-1 font-['Outfit']">Admin Panel</p>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Management Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Clients", value: stats?.total_clients || 0, color: "text-blue-500", bg: "bg-blue-50" },
            { icon: FileText, label: "Grants", value: stats?.total_grants || 0, color: "text-amber-500", bg: "bg-amber-50" },
            { icon: TrendingUp, label: "Applications", value: stats?.total_applications || 0, color: "text-purple-500", bg: "bg-purple-50" },
            { icon: CheckCircle, label: "Approved", value: stats?.total_approved || 0, color: "text-emerald-500", bg: "bg-emerald-50" },
          ].map((s, i) => (
            <Card key={i} className={`border-slate-200 bg-white shadow-sm animate-fade-in-up stagger-${i + 1}`}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                  <p className="font-['Outfit'] text-xl font-bold text-slate-900" data-testid={`admin-stat-${s.label.toLowerCase()}`}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clients */}
          <Card className="border-slate-200 bg-white shadow-sm animate-fade-in-up stagger-1">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="font-['Outfit'] text-lg font-semibold">Clients</CardTitle>
              <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">{clients.length} total</Badge>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No clients yet</p>
              ) : (
                <div className="space-y-3">
                  {clients.map((c, i) => (
                    <div key={c.id || i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100" data-testid={`client-row-${i}`}>
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{c.business_name || c.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Mail className="w-3 h-3" /> {c.email}
                        </div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-0 text-xs shrink-0">{c.grant_count} grants</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grants */}
          <Card className="border-slate-200 bg-white shadow-sm animate-fade-in-up stagger-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="font-['Outfit'] text-lg font-semibold">Grant Programs</CardTitle>
              <Button data-testid="create-grant-btn" onClick={() => setShowCreateGrant(true)} size="sm" className="btn-emerald rounded-lg text-xs font-semibold">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Grant
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {grants.map((g, i) => (
                  <div key={g.id || i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100" data-testid={`grant-row-${i}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{g.name}</p>
                      <p className="text-xs text-slate-400">{g.provider}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-['Outfit'] text-sm font-bold text-slate-900">${(g.max_amount || 0).toLocaleString()}</p>
                      <div className="flex items-center gap-1.5 justify-end mt-1">
                        <Badge className="bg-slate-100 text-slate-600 border-0 text-[10px]">{g.category}</Badge>
                        <Badge className={`border-0 text-[10px] ${g.grant_type === 'non_refundable' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {g.grant_type === 'non_refundable' ? 'Non-Refund' : 'Refundable'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Grant Dialog */}
      <Dialog open={showCreateGrant} onOpenChange={setShowCreateGrant}>
        <DialogContent className="sm:max-w-md rounded-xl border-slate-200" data-testid="create-grant-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Outfit'] text-xl">Add New Grant Program</DialogTitle>
            <p className="text-sm text-slate-500">Fill in the details for a new grant opportunity</p>
          </DialogHeader>
          <form onSubmit={handleCreateGrant} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Grant Name</Label>
              <Input data-testid="grant-name-input" name="name" required placeholder="e.g., CanExport SME" className="h-9 rounded-lg border-slate-300" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Description</Label>
              <Input data-testid="grant-desc-input" name="description" required placeholder="Brief description" className="h-9 rounded-lg border-slate-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Max Amount ($)</Label>
                <Input data-testid="grant-amount-input" name="max_amount" type="number" required placeholder="50000" className="h-9 rounded-lg border-slate-300" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Category</Label>
                <Input data-testid="grant-category-input" name="category" required placeholder="Export" className="h-9 rounded-lg border-slate-300" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Eligibility</Label>
              <Input data-testid="grant-eligibility-input" name="eligibility" required placeholder="Who qualifies?" className="h-9 rounded-lg border-slate-300" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Provider</Label>
              <Input data-testid="grant-provider-input" name="provider" required placeholder="Government of Canada" className="h-9 rounded-lg border-slate-300" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Grant Type</Label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="grant_type" value="non_refundable" defaultChecked className="text-emerald-500" data-testid="grant-type-nonrefundable" />
                  <span className="text-slate-700">Non-Refundable</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="grant_type" value="refundable" className="text-amber-500" data-testid="grant-type-refundable" />
                  <span className="text-slate-700">Refundable</span>
                </label>
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateGrant(false)} className="rounded-lg border-slate-300">Cancel</Button>
              <Button data-testid="submit-grant-btn" type="submit" disabled={createLoading} className="btn-emerald rounded-lg font-semibold">
                {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Grant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
