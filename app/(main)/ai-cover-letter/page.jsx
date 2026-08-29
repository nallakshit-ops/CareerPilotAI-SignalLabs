import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Cover Letters
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Generate and manage tailored cover letters for specific job opportunities.
          </p>
        </div>
        <Link href="/ai-cover-letter/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Cover Letter
          </Button>
        </Link>
      </div>

      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
}
