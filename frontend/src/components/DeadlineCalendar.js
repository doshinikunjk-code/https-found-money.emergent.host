import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/context/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarDays, Plus, Trash2, Bell, Clock, Loader2 } from "lucide-react";

export default function DeadlineCalendar({ grants = [] }) {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [checkingReminders, setCheckingReminders] = useState(false);

  const fetchDeadlines = useCallback(async () => {
    try {
      const { data } = await api.get("/deadlines");
      setDeadlines(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDeadlines(); }, [fetchDeadlines]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    const fd = new FormData(e.target);
    try {
      await api.post("/deadlines", {
        grant_id: fd.get("grant_id"),
        deadline_date: fd.get("deadline_date"),
        reminder_days_before: parseInt(fd.get("reminder_days") || "7"),
        notes: fd.get("notes") || "",
      });
      toast.success("Deadline added!");
      setShowAdd(false);
      fetchDeadlines();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add deadline");
    } finally { setAddLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/deadlines/${id}`);
      toast.success("Deadline removed");
      fetchDeadlines();
    } catch { toast.error("Failed to delete"); }
  };

  const handleCheckReminders = async () => {
    setCheckingReminders(true);
    try {
      const { data } = await api.post("/deadlines/check-reminders");
      if (data.reminders_sent > 0) {
        toast.success(`${data.reminders_sent} reminder email(s) sent!`);
      } else {
        toast.info("No upcoming deadlines need reminders right now.");
      }
      fetchDeadlines();
    } catch { toast.error("Failed to check reminders"); }
    finally { setCheckingReminders(false); }
  };

  // Highlight dates with deadlines on the calendar
  const deadlineDates = deadlines.map((d) => {
    const dt = new Date(d.deadline_date);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  });

  const now = new Date();
  const sortedDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.deadline_date) - new Date(b.deadline_date)
  );

  const getDaysUntil = (dateStr) => {
    const d = new Date(dateStr);
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getUrgencyColor = (days) => {
    if (days < 0) return "bg-red-100 text-red-700";
    if (days <= 7) return "bg-amber-100 text-amber-700";
    if (days <= 30) return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm" data-testid="deadline-calendar">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="font-['Outfit'] text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-emerald-500" /> Grant Deadlines
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            data-testid="check-reminders-btn"
            variant="outline"
            size="sm"
            onClick={handleCheckReminders}
            disabled={checkingReminders}
            className="rounded-lg text-xs h-7 px-2 border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            {checkingReminders ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Bell className="w-3 h-3 mr-1" />}
            Send Reminders
          </Button>
          <Button
            data-testid="add-deadline-btn"
            size="sm"
            onClick={() => setShowAdd(true)}
            className="btn-emerald rounded-lg text-xs h-7 px-2 font-semibold"
          >
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Calendar */}
        <div className="flex justify-center mb-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ deadline: deadlineDates }}
            modifiersStyles={{
              deadline: { backgroundColor: "#10B981", color: "white", borderRadius: "50%" },
            }}
            className="rounded-lg border border-slate-200"
          />
        </div>

        {/* Deadline List */}
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : sortedDeadlines.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No deadlines set. Click "Add" to track grant deadlines.</p>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {sortedDeadlines.map((dl) => {
              const days = getDaysUntil(dl.deadline_date);
              return (
                <div key={dl.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100" data-testid={`deadline-${dl.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{dl.grant_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {new Date(dl.deadline_date).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <Badge className={`text-[10px] font-bold border-0 px-1.5 py-0 ${getUrgencyColor(days)}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today!" : `${days}d left`}
                      </Badge>
                      {dl.reminder_sent && <Badge className="text-[9px] bg-emerald-50 text-emerald-600 border-0 px-1.5 py-0">Reminded</Badge>}
                    </div>
                    {dl.notes && <p className="text-xs text-slate-400 mt-1 truncate">{dl.notes}</p>}
                  </div>
                  <button
                    data-testid={`delete-deadline-${dl.id}`}
                    onClick={() => handleDelete(dl.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Add Deadline Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md rounded-xl border-slate-200" data-testid="add-deadline-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Outfit'] text-xl">Add Grant Deadline</DialogTitle>
            <DialogDescription>Set a deadline and get an email reminder before it's due.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Grant Program</Label>
              <select name="grant_id" required data-testid="deadline-grant-select" className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">Select a grant...</option>
                {grants.map((g) => (
                  <option key={g.grant?.id || g.grant_id} value={g.grant?.id || g.grant_id}>
                    {g.grant?.name || "Unknown Grant"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Deadline Date</Label>
              <Input data-testid="deadline-date-input" name="deadline_date" type="date" required className="h-9 rounded-lg border-slate-300" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Remind me (days before)</Label>
              <select name="reminder_days" data-testid="deadline-reminder-select" className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm">
                <option value="3">3 days before</option>
                <option value="7" selected>7 days before</option>
                <option value="14">14 days before</option>
                <option value="30">30 days before</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Notes (optional)</Label>
              <Input data-testid="deadline-notes-input" name="notes" placeholder="e.g., Need to submit financial statements" className="h-9 rounded-lg border-slate-300" />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="rounded-lg border-slate-300">Cancel</Button>
              <Button data-testid="save-deadline-btn" type="submit" disabled={addLoading} className="btn-emerald rounded-lg font-semibold">
                {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Deadline"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
