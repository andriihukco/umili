"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { StarIcon, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  review: string | null;
  communication_rating: number | null;
  quality_rating: number | null;
  timeliness_rating: number | null;
  created_at: string;
  rater: {
    name: string;
    avatar: string | null;
  };
  task: {
    title: string;
  };
}

interface ReviewData {
  id: string;
  rating: number;
  review: string | null;
  communication_rating: number | null;
  quality_rating: number | null;
  timeliness_rating: number | null;
  created_at: string;
  rater: {
    name: string;
    avatar: string | null;
  }[];
  task: {
    title: string;
  }[];
}

interface FreelancerReviewsProps {
  freelancerId: string;
}

export function FreelancerReviews({ freelancerId }: FreelancerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("ratings")
        .select(
          `
          id,
          rating,
          review,
          communication_rating,
          quality_rating,
          timeliness_rating,
          created_at,
          rater:rater_id(name, avatar),
          task:tasks(title)
        `
        )
        .eq("rated_id", freelancerId)
        .not("review", "is", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        return;
      }

      // Transform the data to match our interface
      const transformedReviews: Review[] = (data || []).map(
        (item: ReviewData) => ({
          id: item.id,
          rating: item.rating,
          review: item.review,
          communication_rating: item.communication_rating,
          quality_rating: item.quality_rating,
          timeliness_rating: item.timeliness_rating,
          created_at: item.created_at,
          rater: item.rater[0] || { name: "Unknown", avatar: null },
          task: item.task[0] || { title: "Unknown Task" },
        })
      );

      setReviews(transformedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [freelancerId]);

  useEffect(() => {
    if (freelancerId) {
      fetchReviews();
    }
  }, [freelancerId, fetchReviews]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const StarRating = ({
    rating,
    size = "sm",
  }: {
    rating: number;
    size?: "sm" | "md";
  }) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Відгуки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              Завантаження відгуків...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Відгуки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Поки що немає відгуків</p>
            <p className="text-sm text-muted-foreground mt-2">
              Відгуки з&apos;являться після завершення проєктів
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Відгуки ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.rater.avatar || ""} />
                <AvatarFallback>{review.rater.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{review.rater.name}</h4>
                  <StarRating rating={review.rating} />
                  <span className="text-sm text-muted-foreground">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Проєкт: {review.task.title}
                </p>
              </div>
            </div>

            {/* Detailed Ratings */}
            {(review.communication_rating ||
              review.quality_rating ||
              review.timeliness_rating) && (
              <div className="flex flex-wrap gap-4 text-sm">
                {review.communication_rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Комунікація:</span>
                    <StarRating rating={review.communication_rating} />
                  </div>
                )}
                {review.quality_rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Якість:</span>
                    <StarRating rating={review.quality_rating} />
                  </div>
                )}
                {review.timeliness_rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Терміновість:</span>
                    <StarRating rating={review.timeliness_rating} />
                  </div>
                )}
              </div>
            )}

            {/* Review Text */}
            {review.review && (
              <div className="bg-muted/50 rounded-md p-3">
                <p className="text-sm whitespace-pre-wrap">{review.review}</p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
