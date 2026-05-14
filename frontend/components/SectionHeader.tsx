"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllText?: string;
  badge?: string;
}

export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllText = "View All",
  badge,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-fuchsia-700 p-4 rounded-lg">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className=" me-8 text-3xl text-emerald-700 sm:text-2xl lg:text-4xl font-medium tracking-tight text-foreground">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-muted-foreground text-lg text-red-700">{subtitle}</p>
        )}
      </div>

      {viewAllHref && (
        <Button variant="outline" size="sm" asChild>
          <Link href={viewAllHref} className="inline-flex items-center">
            {viewAllText}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}
    </div>
  );
}
