import React, { useState, useEffect, useRef } from "react";
import { api } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageIcon, Upload, Check, Loader2 } from "lucide-react";

export default function LogoUpload() {
  const [branding, setBranding] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data } = await api.get("/client/branding");
        setBranding(data);
        if (data.has_logo) {
          const resp = await api.get("/client/logo", { responseType: "blob" });
          setLogoUrl(URL.createObjectURL(resp.data));
        }
      } catch { /* ignore */ }
    };
    fetchBranding();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2MB"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/client/upload-logo", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Logo uploaded! It will appear on your PDFs and PPTs.");
      const resp = await api.get("/client/logo", { responseType: "blob" });
      setLogoUrl(URL.createObjectURL(resp.data));
      setBranding((prev) => ({ ...prev, has_logo: true }));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200" data-testid="logo-upload-section">
      <input ref={fileRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleUpload} data-testid="logo-file-input" />
      {logoUrl ? (
        <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center shrink-0">
          <ImageIcon className="w-4 h-4 text-slate-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">
          {branding?.has_logo ? "Logo uploaded" : "Upload your logo"}
        </p>
        <p className="text-xs text-slate-400">Appears on generated PDFs & PPTs</p>
      </div>
      <Button
        data-testid="upload-logo-btn"
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="rounded-lg text-xs h-7 px-3 border-slate-300 shrink-0"
      >
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : branding?.has_logo ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Upload className="w-3 h-3 mr-1" />}
        {branding?.has_logo ? "Change" : "Upload"}
      </Button>
    </div>
  );
}
