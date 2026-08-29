"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Plus, X, Loader2, Sparkles, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createJob } from "@/actions/job";

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [location, setLocation] = useState("");
  const [minExperience, setMinExperience] = useState("0");
  const [qualificationThreshold, setQualificationThreshold] = useState(75);

  // Skills tag handling
  const [skillInput, setSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]);

  const addSkill = (e) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !requiredSkills.includes(clean)) {
      setRequiredSkills([...requiredSkills, clean]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || requiredSkills.length === 0 || !location) {
      toast.error("Please fill in all required fields and add at least one required skill.");
      return;
    }

    setLoading(true);
    try {
      const res = await createJob({
        title,
        companyName,
        description,
        requiredSkills,
        minExperience: parseInt(minExperience) || 0,
        employmentType,
        location,
        qualificationThreshold: parseFloat(qualificationThreshold),
      });

      if (res.success) {
        toast.success("Job posting successfully published!");
        router.push("/recruiter/jobs");
        router.refresh();
      }
    } catch (err) {
      toast.error(err.message || "Failed to publish job opening.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors group">
          <Link href="/recruiter/jobs">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Jobs
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
            Publish a New Job Opening
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter position details, required skills, and establish your screening benchmark for incoming applicants.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="glass border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-emerald-500" />
            <CardHeader className="border-b border-white/[0.04] pb-5">
              <CardTitle className="text-xl font-display flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-tight text-foreground/90">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Senior Frontend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-white/[0.02] border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-tight text-foreground/90">
                    Company Name
                  </label>
                  <Input
                    placeholder="Leave empty to use your default recruiter company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-white/[0.02] border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-tight text-foreground/90">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <Select value={employmentType} onValueChange={setEmploymentType}>
                    <SelectTrigger className="bg-white/[0.02] border-white/[0.08] rounded-xl focus:ring-primary/20">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/[0.08]">
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-tight text-foreground/90">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Remote, Bangalore, IN"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="bg-white/[0.02] border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-tight text-foreground/90">
                    Min Experience (Years) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 3"
                    value={minExperience}
                    onChange={(e) => setMinExperience(e.target.value)}
                    required
                    className="bg-white/[0.02] border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-tight text-foreground/90">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Provide complete job details, responsibilities, role expectations, and daily tasks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  required
                  className="bg-white/[0.02] border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 rounded-xl leading-relaxed text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Screening Benchmark Details */}
          <Card className="glass border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-purple-500" />
            <CardHeader className="border-b border-white/[0.04] pb-5">
              <CardTitle className="text-xl font-display flex items-center gap-2">
                <Sliders className="w-5 h-5 text-accent" /> Screening & Skill Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Skill Tags Maker */}
              <div className="space-y-3">
                <label className="text-sm font-semibold tracking-tight text-foreground/90">
                  Required Core Skills <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter a skill (e.g. React, Docker, Python)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="bg-white/[0.02] border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 rounded-xl flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(e);
                      }
                    }}
                  />
                  <Button onClick={addSkill} variant="secondary" className="rounded-xl flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {requiredSkills.map((skill, index) => (
                    <Badge key={index} className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/30 flex items-center gap-1.5 px-3 py-1 text-sm rounded-xl">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </Badge>
                  ))}
                  {requiredSkills.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No required skills added yet. Add at least 1 core skill tag.</span>
                  )}
                </div>
              </div>

              {/* Slider for qualification threshold */}
              <div className="space-y-4 pt-4 border-t border-white/[0.04]">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold tracking-tight text-foreground/90 flex items-center gap-1.5">
                      Qualification Threshold Score <Sparkles className="w-4 h-4 text-purple-400" />
                    </label>
                    <span className="text-xs text-muted-foreground block">
                      Candidates scoring below this benchmark will be automatically rejected with deterministic feedback.
                    </span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-primary bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
                    {qualificationThreshold}%
                  </div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={qualificationThreshold}
                  onChange={(e) => setQualificationThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/[0.06] rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-semibold px-1">
                  <span>50% (Standard)</span>
                  <span>75% (Highly Recommended)</span>
                  <span>95% (Top Talents Only)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button asChild variant="ghost" size="lg" className="rounded-xl">
              <Link href="/recruiter/jobs">Cancel</Link>
            </Button>
            <Button type="submit" size="lg" disabled={loading} className="shadow-[0_0_40px_-5px_rgba(var(--primary),0.4)] hover-lift rounded-xl min-w-[160px] h-12">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Publishing...</>
              ) : (
                "Publish Opening"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
