"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Video,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import {
  sendInterviewInvitation,
  scheduleHumanInterview,
  selectCandidate,
  rejectCandidate,
} from "@/actions/recruiter";

const ActionBar = ({ candidateId, interviewCall }) => {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  // Form states
  const [inviteForm, setInviteForm] = useState({
    jobTitle: "",
    jobDescription: "",
    recruiterMessage: "",
  });
  const [scheduleForm, setScheduleForm] = useState({
    googleMeetLink: "",
    scheduledAt: "",
    humanMessage: "",
  });
  const [rejectFeedback, setRejectFeedback] = useState("");

  const {
    fn: fnSendInvitation,
    loading: sendingInvitation,
  } = useFetch(sendInterviewInvitation);

  const {
    fn: fnSchedule,
    loading: scheduling,
  } = useFetch(scheduleHumanInterview);

  const {
    fn: fnSelect,
    loading: selecting,
  } = useFetch(selectCandidate);

  const {
    fn: fnReject,
    loading: rejecting,
  } = useFetch(rejectCandidate);

  const handleSendInvitation = async () => {
    if (!inviteForm.jobTitle || !inviteForm.jobDescription) {
      toast.error("Please fill in Job Title and Job Description.");
      return;
    }
    const res = await fnSendInvitation({ candidateId, ...inviteForm });
    if (res) {
      toast.success("Interview invitation sent successfully!");
      setInviteOpen(false);
      setInviteForm({ jobTitle: "", jobDescription: "", recruiterMessage: "" });
      router.refresh();
    }
  };

  const handleSchedule = async () => {
    if (!interviewCall?.id) {
      toast.error("No active interview call to schedule.");
      return;
    }
    if (!scheduleForm.googleMeetLink || !scheduleForm.scheduledAt) {
      toast.error("Please provide Google Meet link and date/time.");
      return;
    }
    const res = await fnSchedule({ callId: interviewCall.id, ...scheduleForm });
    if (res) {
      toast.success("Human interview scheduled successfully!");
      setScheduleOpen(false);
      setScheduleForm({ googleMeetLink: "", scheduledAt: "", humanMessage: "" });
      router.refresh();
    }
  };

  const handleSelect = async () => {
    if (!interviewCall?.id) {
      toast.error("No active interview call.");
      return;
    }
    const res = await fnSelect({ callId: interviewCall.id });
    if (res) {
      toast.success("Candidate selected! 🎉");
      router.refresh();
    }
  };

  const handleReject = async () => {
    if (!interviewCall?.id) {
      toast.error("No active interview call.");
      return;
    }
    const res = await fnReject({ callId: interviewCall.id, feedback: rejectFeedback });
    if (res) {
      toast.success("Candidate rejected with feedback.");
      setRejectOpen(false);
      setRejectFeedback("");
      router.refresh();
    }
  };

  // State calculations for edge cases
  const isInvitationActive = interviewCall &&
    interviewCall.candidateDecision !== "declined" &&
    interviewCall.status !== "rejected";

  const isScheduleDisabled = !interviewCall ||
    interviewCall.candidateDecision !== "accepted" ||
    interviewCall.status === "scheduled" ||
    interviewCall.status === "selected" ||
    interviewCall.status === "rejected";

  const getScheduleButtonText = () => {
    if (!interviewCall) return "Schedule Human Interview";
    if (interviewCall.candidateDecision === "pending") return "Awaiting Candidate Acceptance";
    if (interviewCall.candidateDecision === "declined") return "Candidate Declined Invite";
    if (interviewCall.status === "scheduled") return "Human Interview Scheduled";
    if (interviewCall.status === "selected") return "Interview Locked (Selected)";
    if (interviewCall.status === "rejected") return "Interview Locked (Rejected)";
    return "Schedule Human Interview";
  };

  const isSelectDisabled = !interviewCall ||
    interviewCall.candidateDecision !== "accepted" ||
    interviewCall.status === "selected" ||
    interviewCall.status === "rejected";

  const getSelectButtonText = () => {
    if (!interviewCall) return "Select Candidate";
    if (interviewCall.candidateDecision !== "accepted") return "Awaiting Interview Completion";
    if (interviewCall.status === "selected") return "Candidate Selected 🎉";
    if (interviewCall.status === "rejected") return "Selection Disabled (Rejected)";
    return "Select Candidate";
  };

  const isRejectDisabled = !interviewCall ||
    interviewCall.candidateDecision !== "accepted" ||
    interviewCall.status === "selected" ||
    interviewCall.status === "rejected";

  const getRejectButtonText = () => {
    if (!interviewCall) return "Reject Candidate";
    if (interviewCall.candidateDecision !== "accepted") return "Rejection Disabled";
    if (interviewCall.status === "rejected") return "Candidate Rejected ❌";
    if (interviewCall.status === "selected") return "Rejection Disabled (Selected)";
    return "Reject with Feedback";
  };

  return (
    <div className="glass-strong rounded-2xl p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Send Interview Invitation */}
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={isInvitationActive}>
              <Send className="h-4 w-4" />
              {isInvitationActive ? "Interview Invitation Sent" : "Send Interview Invitation"}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-white/[0.08] sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="font-display tracking-tight">
                Send Interview Invitation
              </DialogTitle>
              <DialogDescription>
                Invite this candidate for an AI-powered virtual interview.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Job Title
                </label>
                <Input
                  placeholder="e.g., Senior Frontend Developer"
                  value={inviteForm.jobTitle}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, jobTitle: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Job Description
                </label>
                <Textarea
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={4}
                  className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm focus-visible:ring-primary/50"
                  value={inviteForm.jobDescription}
                  onChange={(e) =>
                    setInviteForm({
                      ...inviteForm,
                      jobDescription: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Message to Candidate (Optional)
                </label>
                <Textarea
                  placeholder="Add a personal message..."
                  rows={2}
                  className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm focus-visible:ring-primary/50"
                  value={inviteForm.recruiterMessage}
                  onChange={(e) =>
                    setInviteForm({
                      ...inviteForm,
                      recruiterMessage: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendInvitation}
                disabled={sendingInvitation}
              >
                {sendingInvitation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sendingInvitation ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Human Interview */}
        {interviewCall && (
          <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={isScheduleDisabled}>
                <Video className="h-4 w-4" />
                {getScheduleButtonText()}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-white/[0.08] sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle className="font-display tracking-tight">
                  Schedule Human Interview
                </DialogTitle>
                <DialogDescription>
                  Set up a live interview with this candidate via Google Meet.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Google Meet Link
                  </label>
                  <Input
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={scheduleForm.googleMeetLink}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        googleMeetLink: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={scheduleForm.scheduledAt}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        scheduledAt: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Message (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any instructions for the candidate..."
                    rows={2}
                    className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm focus-visible:ring-primary/50"
                    value={scheduleForm.humanMessage}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        humanMessage: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setScheduleOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSchedule} disabled={scheduling}>
                  {scheduling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarDays className="h-4 w-4" />
                  )}
                  {scheduling ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Select Candidate */}
        {interviewCall && (
          <Button
            onClick={handleSelect}
            disabled={selecting || isSelectDisabled}
            className="gap-2 bg-[hsl(var(--success))] hover:bg-[hsl(142,71%,38%)] text-white shadow-[0_0_20px_-5px_hsl(var(--success)/0.4)]"
          >
            {selecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {selecting ? "Selecting..." : getSelectButtonText()}
          </Button>
        )}

        {/* Reject with Feedback */}
        {interviewCall && (
          <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2" disabled={isRejectDisabled}>
                <XCircle className="h-4 w-4" />
                {getRejectButtonText()}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-white/[0.08] sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle className="font-display tracking-tight">
                  Reject Candidate
                </DialogTitle>
                <DialogDescription>
                  Provide constructive feedback to help the candidate improve.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Feedback & Improvement Suggestions
                  </label>
                  <Textarea
                    placeholder="Share constructive feedback on areas for improvement..."
                    rows={5}
                    className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm focus-visible:ring-primary/50"
                    value={rejectFeedback}
                    onChange={(e) => setRejectFeedback(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRejectOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejecting}
                >
                  {rejecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {rejecting ? "Rejecting..." : "Reject Candidate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ActionBar;
