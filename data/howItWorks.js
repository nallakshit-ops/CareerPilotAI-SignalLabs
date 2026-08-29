import { UserPlus, FileEdit, Users, LineChart } from "lucide-react";

export const howItWorks = [
  {
    title: "Choose Your Path",
    description: "Onboard as a recruiter or a candidate with tailored workflows",
    icon: <UserPlus className="w-8 h-8 text-primary" />,
  },
  {
    title: "Post or Apply",
    description: "Recruiters publish jobs; candidates build profiles and apply",
    icon: <FileEdit className="w-8 h-8 text-primary" />,
  },
  {
    title: "Screen with Confidence",
    description:
      "Deterministic scoring filters candidates before optional AI enrichment",
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    title: "Interview and Decide",
    description: "Run AI interviews, schedule human rounds, and close hires",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
];
