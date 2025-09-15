"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { StarIcon } from "lucide-react";

interface FreelancerRatingDisplayProps {
  freelancerId: string;
  size?: "sm" | "md";
  showCount?: boolean;
}

export function FreelancerRatingDisplay({
  freelancerId,
  size = "sm",
  showCount = true,
}: FreelancerRatingDisplayProps) {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (freelancerId) {
      fetchFreelancerRating();
    }
  }, [freelancerId]);

  const fetchFreelancerRating = async () => {
    try {
      // Get ratings where the freelancer was rated (as rated_id)
      const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("rated_id", freelancerId);

      if (error) {
        console.error("Error fetching freelancer rating:", error);
        return;
      }

      if (data && data.length > 0) {
        const sum = data.reduce((acc, rating) => acc + rating.rating, 0);
        const average = sum / data.length;
        setAverageRating(average);
        setRatingCount(data.length);
      }
    } catch (error) {
      console.error("Error fetching freelancer rating:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
  };

  return (
    <div className="flex items-center gap-1">
      <StarIcon
        className={`${sizeClasses[size]} ${
          ratingCount > 0 ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
      {ratingCount > 0 && (
        <span
          className={`text-muted-foreground ${
            size === "sm" ? "text-xs" : "text-sm"
          }`}
        >
          {averageRating.toFixed(1)}
        </span>
      )}
      {showCount && ratingCount > 0 && (
        <span
          className={`text-muted-foreground ${
            size === "sm" ? "text-xs" : "text-sm"
          }`}
        >
          ({ratingCount})
        </span>
      )}
    </div>
  );
}
