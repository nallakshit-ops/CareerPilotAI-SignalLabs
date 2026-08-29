"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Calendar, MapPin, Trophy, Users, Star, Loader2, GitBranch } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function HackathonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch("/api/explore/hackathons");
        const data = await res.json();
        
        if (data.success) {
          const found = data.hackathons.find(h => h.id === id);
          if (found) {
            setHackathon(found);
            fetchRelatedProjects(found.tags);
          } else {
            toast.error("Hackathon not found");
            router.push("/explore");
          }
        }
      } catch (error) {
        toast.error("Failed to load hackathon details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id, router]);

  const fetchRelatedProjects = async (tags) => {
    setLoadingRepos(true);
    try {
      // Extract the primary tag to ensure a reliable search. 
      // GitHub Search API boolean logic is extremely strict and often returns 0 
      // when combining OR with multi-word terms. A direct search is much safer.
      let primaryTag = "hackathon winner";
      if (tags && tags.length > 0) {
        // Take the first tag, split by slash (e.g. "Machine Learning/AI" -> "Machine Learning"), and clean it
        primaryTag = tags[0].split('/')[0].replace(/[^a-zA-Z0-9\s]/g, " ").trim();
      }
      
      const query = `${primaryTag} hackathon`;
      const res = await fetch(`/api/explore/github-repos?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data.success) {
        setRepos(data.repos.slice(0, 12)); // Show top 12
      }
    } catch (error) {
      console.error("Failed to fetch related projects:", error);
    } finally {
      setLoadingRepos(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl space-y-6">
        <Button variant="ghost" disabled><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!hackathon) return null;

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
          <Link href="/explore">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Explore
          </Link>
        </Button>
      </div>

      {/* Header Section */}
      <Card className="border-2 border-primary/20 bg-card overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6 border-b">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary uppercase tracking-wider text-xs font-semibold">
                  {hackathon.source}
                </Badge>
                {hackathon.type && (
                  <Badge variant="outline" className="px-3 py-1 uppercase tracking-wider text-xs">
                    {hackathon.type}
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">
                {hackathon.title}
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-foreground">{hackathon.prize}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {hackathon.deadline}
                </span>
                {hackathon.registrations > 0 && (
                  <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border">
                    <Users className="w-4 h-4 text-green-500" />
                    {hackathon.registrations.toLocaleString()} Participants
                  </span>
                )}
                {hackathon.organizer && (
                  <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    {hackathon.organizer}
                  </span>
                )}
              </div>
            </div>

            <Button size="lg" asChild className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all">
              <a href={hackathon.link} target="_blank" rel="noopener noreferrer">
                Register Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardHeader>

        {hackathon.tags && hackathon.tags.length > 0 && (
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Hackathon Themes</h3>
            <div className="flex flex-wrap gap-2">
              {hackathon.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1 bg-secondary/50 hover:bg-secondary transition-colors">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Winning Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GitBranch className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Winning & Related Projects</h2>
            <p className="text-muted-foreground text-sm">Discover top repositories from similar hackathon themes</p>
          </div>
        </div>

        {loadingRepos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : repos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between p-5 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                      {repo.name}
                    </h3>
                    <Badge variant="outline" className="shrink-0 flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {repo.stars}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {repo.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                    {repo.language}
                  </span>
                  <span className="flex items-center group-hover:text-primary transition-colors">
                    View Repository <ExternalLink className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-background rounded-full border mb-4 shadow-sm">
                <GitBranch className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground max-w-sm">
                We couldn't find any GitHub repositories matching this hackathon's specific themes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
