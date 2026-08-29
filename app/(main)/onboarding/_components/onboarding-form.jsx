"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { onboardingSchema, recruiterOnboardingSchema } from "@/lib/validators/schema";
import { updateUser } from "@/actions/user";

const OnboardingForm = ({ industries }) => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("candidate"); // Default to candidate (student profile)
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const {
    loading: updateLoading,
    fn: updateUserFn,
    data: updateResult,
  } = useFetch(updateUser);

  // Candidate form
  const candidateForm = useForm({
    resolver: zodResolver(onboardingSchema),
  });

  // Recruiter form
  const recruiterForm = useForm({
    resolver: zodResolver(recruiterOnboardingSchema),
  });

  const onCandidateSubmit = async (values) => {
    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;

      await updateUserFn({
        ...values,
        industry: formattedIndustry,
        role: "candidate",
      });
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  const onRecruiterSubmit = async (values) => {
    try {
      await updateUserFn({
        ...values,
        role: "recruiter",
      });
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  useEffect(() => {
    if (updateResult?.success && !updateLoading) {
      toast.success("Profile completed successfully!");
      if (selectedRole === "recruiter") {
        router.push("/recruiter/dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    }
  }, [updateResult, updateLoading]);

  const watchIndustry = candidateForm.watch("industry");

  // Role Selection Screen
  if (!selectedRole) {
    return (
      <div className="flex items-center justify-center bg-background min-h-[60vh]">
        <div className="w-full max-w-2xl mx-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
              Welcome to Signal Labs
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Select how you would like to use the platform to personalize your experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Candidate Card */}
            <button
              onClick={() => setSelectedRole("candidate")}
              className="rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/50 hover:bg-muted/20 shadow-xs"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                I&apos;m a Job Seeker / Candidate
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Build ATS-ready resumes, practice technical interviews, analyze skill gaps, and explore opportunities.
              </p>
            </button>

            {/* Recruiter Card */}
            <button
              onClick={() => setSelectedRole("recruiter")}
              className="rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/50 hover:bg-muted/20 shadow-xs"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                <Building2 className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                I&apos;m a Recruiter / Employer
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Discover qualified talent, evaluate applicant profiles, schedule interviews, and manage hiring pipelines.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Recruiter Onboarding Form
  if (selectedRole === "recruiter") {
    return (
      <div className="flex items-center justify-center bg-background py-8">
        <Card className="w-full max-w-lg mx-4 border-border bg-card shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setSelectedRole(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Set Up Your Recruiter Profile
            </CardTitle>
            <CardDescription className="text-xs">
              Tell us about your organization to start discovering candidates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={recruiterForm.handleSubmit(onRecruiterSubmit)}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-xs">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google, TCS, Infosys"
                  {...recruiterForm.register("companyName")}
                />
                {recruiterForm.formState.errors.companyName && (
                  <p className="text-xs text-destructive">
                    {recruiterForm.formState.errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companyRole" className="text-xs">Your Role in Organization</Label>
                <Input
                  id="companyRole"
                  placeholder="e.g., HR Manager, Technical Lead, CTO"
                  {...recruiterForm.register("companyRole")}
                />
                {recruiterForm.formState.errors.companyRole && (
                  <p className="text-xs text-destructive">
                    {recruiterForm.formState.errors.companyRole.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companySize" className="text-xs">Company Size</Label>
                <Select
                  onValueChange={(val) => recruiterForm.setValue("companySize", val)}
                  defaultValue={recruiterForm.getValues("companySize")}
                >
                  <SelectTrigger id="companySize">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-1000">201-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
                {recruiterForm.formState.errors.companySize && (
                  <p className="text-xs text-destructive">
                    {recruiterForm.formState.errors.companySize.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companyWebsite" className="text-xs">Company Website (Optional)</Label>
                <Input
                  id="companyWebsite"
                  placeholder="https://company.com"
                  {...recruiterForm.register("companyWebsite")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-xs">About Company / Hiring Focus (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell candidates what makes your company a great place to work..."
                  className="h-20 text-xs"
                  {...recruiterForm.register("bio")}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-9 font-medium"
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Complete Recruiter Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Candidate Onboarding Form — PRESERVED with additions
  return (
    <div className="flex items-center justify-center bg-background py-8">
      <Card className="w-full max-w-lg mx-4 border-border bg-card shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-xs">
            Select your industry to receive personalized career insights and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={candidateForm.handleSubmit(onCandidateSubmit)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                onValueChange={(value) => {
                  candidateForm.setValue("industry", value);
                  setSelectedIndustry(
                    industries.find((ind) => ind.id === value)
                  );
                  candidateForm.setValue("subIndustry", "");
                }}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Industries</SelectLabel>
                    {industries.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {candidateForm.formState.errors.industry && (
                <p className="text-sm text-red-500">
                  {candidateForm.formState.errors.industry.message}
                </p>
              )}
            </div>

            {watchIndustry && (
              <div className="space-y-2">
                <Label htmlFor="subIndustry">Specialization</Label>
                <Select
                  onValueChange={(value) =>
                    candidateForm.setValue("subIndustry", value)
                  }
                >
                  <SelectTrigger id="subIndustry">
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Specializations</SelectLabel>
                      {selectedIndustry?.subIndustries.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {candidateForm.formState.errors.subIndustry && (
                  <p className="text-sm text-red-500">
                    {candidateForm.formState.errors.subIndustry.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                {...candidateForm.register("experience")}
              />
              {candidateForm.formState.errors.experience && (
                <p className="text-sm text-red-500">
                  {candidateForm.formState.errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., Python, JavaScript, Project Management"
                {...candidateForm.register("skills")}
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple skills with commas
              </p>
              {candidateForm.formState.errors.skills && (
                <p className="text-sm text-red-500">
                  {candidateForm.formState.errors.skills.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your professional background..."
                className="h-32"
                {...candidateForm.register("bio")}
              />
              {candidateForm.formState.errors.bio && (
                <p className="text-sm text-red-500">
                  {candidateForm.formState.errors.bio.message}
                </p>
              )}
            </div>

            {/* NEW: Google Drive links for candidate */}
            <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Optional — Help recruiters discover you
              </p>
              <div className="space-y-2">
                <Label htmlFor="resumeDriveUrl">Resume (Google Drive Link)</Label>
                <Input
                  id="resumeDriveUrl"
                  placeholder="https://drive.google.com/file/d/..."
                  {...candidateForm.register("resumeDriveUrl")}
                />
                <p className="text-xs text-muted-foreground">
                  Share your resume as &quot;Anyone with the link can view&quot;
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoResumeUrl">
                  Video Introduction (Google Drive Link)
                </Label>
                <Input
                  id="videoResumeUrl"
                  placeholder="https://drive.google.com/file/d/..."
                  {...candidateForm.register("videoResumeUrl")}
                />
                <p className="text-xs text-muted-foreground">
                  Record a 1-2 min video intro showcasing your communication
                  skills
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
