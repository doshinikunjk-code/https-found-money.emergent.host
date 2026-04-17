import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Upload, ArrowRight, Clock, CheckCircle, XCircle, Eye, CreditCard, Send } from "lucide-react";

const STATUS_CONFIG = {
  identified: { label: "Identified", color: "bg-slate-100 text-slate-700", cta: "Apply Now", ctaClass: "btn-emerald", ctaIcon: ArrowRight, action: "apply" },
  draft_ready: { label: "Draft Ready", color: "bg-amber-50 text-amber-700", cta: "Review Draft", ctaClass: "btn-amber", ctaIcon: Eye, action: "review" },
  documents_required: { label: "Docs Required", color: "bg-blue-50 text-blue-700", cta: "Upload Documents", ctaClass: "bg-blue-500 hover:bg-blue-600 text-white", ctaIcon: Upload, action: "upload_document" },
  under_review: { label: "Under Review", color: "bg-purple-50 text-purple-700", cta: "Under Review", ctaClass: "", ctaIcon: Clock, action: null },
  applied: { label: "Submitted", color: "bg-emerald-50 text-emerald-700", cta: "Submitted to Agency", ctaClass: "", ctaIcon: Send, action: null },
  submitted: { label: "Submitted", color: "bg-emerald-50 text-emerald-700", cta: "Submitted to Agency", ctaClass: "", ctaIcon: Send, action: null },
  documents_submitted: { label: "Docs Submitted", color: "bg-blue-50 text-blue-700", cta: "Processing...", ctaClass: "", ctaIcon: Clock, action: null },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-800", cta: "Pay Commission", ctaClass: "btn-emerald", ctaIcon: CreditCard, action: "pay" },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-700", cta: "Rejected", ctaClass: "", ctaIcon: XCircle, action: null },
};

const formatMoney = (val) => {
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
  return `$${val.toLocaleString()}`;
};

const GRANT_TYPE_BADGE = {
  non_refundable: { label: "Non-Refundable", className: "bg-emerald-100 text-emerald-700" },
  refundable: { label: "Refundable", className: "bg-slate-100 text-slate-600" },
};

const AGENCY_LEVEL = {
  "Government of Canada": "Federal",
  "NRCan": "Federal",
  "ISED Canada": "Federal",
  "NRC-IRAP": "Federal",
  "Health Canada / PHAC": "Federal",
  "Ontario Government": "Provincial",
};

export default function GrantCard({ clientGrant, onAction, index = 0 }) {
  const grant = clientGrant.grant || {};
  const status = STATUS_CONFIG[clientGrant.status] || STATUS_CONFIG.identified;
  const Icon = status.ctaIcon;
  const grantType = GRANT_TYPE_BADGE[grant.grant_type] || GRANT_TYPE_BADGE.non_refundable;
  const agencyLevel = AGENCY_LEVEL[grant.provider] || "Government";

  return (
    <Card
      className={`border-slate-200 bg-white shadow-sm card-hover animate-fade-in-up stagger-${index + 1}`}
      data-testid={`grant-card-${grant.name?.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="font-['Outfit'] text-xl font-semibold text-slate-900 truncate">{grant.name}</h3>
              <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-0 ${grantType.className}`}>
                {grantType.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-400 font-medium">{grant.provider}</p>
              <Badge className="text-[9px] font-semibold px-1.5 py-0 rounded border-0 bg-slate-50 text-slate-500">{agencyLevel}</Badge>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 ml-3 shrink-0">
            {clientGrant.match_score >= 70 && (
              <Badge
                className={`text-xs font-bold px-3 py-1 rounded-full border-0 ${
                  clientGrant.match_score >= 90 ? "bg-emerald-100 text-emerald-700 match-badge" : "bg-amber-100 text-amber-700"
                }`}
                data-testid={`match-score-${grant.name?.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {clientGrant.match_score}% AI Match
              </Badge>
            )}
          </div>
        </div>

        <p className="text-base text-slate-500 leading-relaxed mb-3 line-clamp-2">{grant.description}</p>
        {clientGrant.ai_reasoning && (
          <p className="text-sm text-emerald-600 italic mb-3 line-clamp-1">AI: {clientGrant.ai_reasoning}</p>
        )}

        {/* Submission target info for applied/submitted */}
        {(clientGrant.status === "applied" || clientGrant.status === "submitted") && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 mb-3">
            <Send className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-700">
              Application submitted to <strong>{grant.provider}</strong> ({agencyLevel})
            </p>
          </div>
        )}

        {/* Agency details */}
        {grant.agency_details && (
          <div className="mb-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Portal: {grant.agency_details.portal_name}</span>
              {grant.agency_details.deadline && (
                <span className="text-[10px] font-bold text-amber-600">Deadline: {grant.agency_details.deadline.substring(0, 30)}</span>
              )}
            </div>
            <a href={grant.agency_details.portal_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:text-emerald-700 underline font-medium block truncate"
              data-testid={`portal-link-${grant.name?.replace(/\s+/g, '-').toLowerCase()}`}
            >{grant.agency_details.portal_url}</a>
            {grant.agency_details.contact_phone && (
              <p className="text-[11px] text-slate-400">Phone: {grant.agency_details.contact_phone} | Email: {grant.agency_details.contact_email}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-['Outfit'] text-2xl font-bold text-slate-900">{formatMoney(grant.max_amount || 0)}</span>
            <Badge className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border-0 ${status.color}`}>{status.label}</Badge>
          </div>
          {status.action ? (
            <Button
              data-testid={`grant-action-${grant.name?.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => onAction(clientGrant, status.action)}
              className={`rounded-lg px-5 h-10 text-sm font-semibold ${status.ctaClass} transition-all active:scale-[0.98]`}
            >
              <Icon className="w-4 h-4 mr-2" />{status.cta}
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
              <Icon className="w-4 h-4" />{status.cta}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
