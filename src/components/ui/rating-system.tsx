"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import {
  Star,
  StarIcon,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Rating {
  id: string;
  task_id: string;
  rater_id: string;
  rated_id: string;
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
  rated: {
    name: string;
    avatar: string | null;
  };
}

interface RatingSystemProps {
  taskId: string;
  userId?: string;
  canRate?: boolean;
  showReviews?: boolean;
}

export function RatingSystem({
  taskId,
  userId,
  canRate = false,
  showReviews = true,
}: RatingSystemProps) {
  const { user } = useAppStore();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [ratingData, setRatingData] = useState({
    overall_rating: 0,
    communication_rating: 0,
    quality_rating: 0,
    timeliness_rating: 0,
    review: "",
  });

  const targetUserId = userId || user?.id;

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from("ratings")
        .select(
          `
          *,
          rater:rater_id(name, avatar),
          rated:rated_id(name, avatar)
        `
        )
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching ratings:", error);
        return;
      }

      setRatings(data || []);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchRatings();
    }
  }, [taskId, fetchRatings]);

  const handleSubmitRating = async () => {
    if (!user || !targetUserId) {
      toast.error("Потрібно увійти в систему");
      return;
    }

    if (ratingData.overall_rating === 0) {
      toast.error("Будь ласка, поставте загальну оцінку");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("ratings").insert({
        task_id: taskId,
        rater_id: user.id,
        rated_id: targetUserId,
        rating: ratingData.overall_rating,
        review: ratingData.review.trim() || null,
        communication_rating: ratingData.communication_rating || null,
        quality_rating: ratingData.quality_rating || null,
        timeliness_rating: ratingData.timeliness_rating || null,
      });

      if (error) {
        console.error("Error submitting rating:", error);
        toast.error("Помилка при відправці відгуку");
        return;
      }

      toast.success("Відгук відправлено успішно");
      setIsDialogOpen(false);
      setRatingData({
        overall_rating: 0,
        communication_rating: 0,
        quality_rating: 0,
        timeliness_rating: 0,
        review: "",
      });
      fetchRatings();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Помилка при відправці відгуку");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((rating) => {
      distribution[rating.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const StarRating = ({
    rating,
    onRatingChange,
    readonly = false,
    size = "md",
  }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange?.(star)}
            disabled={readonly}
            className={`${sizeClasses[size]} ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } transition-transform`}
          >
            <StarIcon
              className={`${
                star <= rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Завантаження відгуків...</div>
      </div>
    );
  }

  const averageRating = getAverageRating();
  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Відгуки та оцінки
              </CardTitle>
              <CardDescription>{ratings.length} відгуків</CardDescription>
            </div>
            {canRate && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Star className="h-4 w-4 mr-2" />
                Залишити відгук
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {averageRating.toFixed(1)}
              </div>
              <StarRating
                rating={Math.round(averageRating)}
                readonly
                size="lg"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Середня оцінка з {ratings.length} відгуків
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm w-8">{stars}</span>
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${
                          ratings.length > 0
                            ? (ratingDistribution[
                                stars as keyof typeof ratingDistribution
                              ] /
                                ratings.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {
                      ratingDistribution[
                        stars as keyof typeof ratingDistribution
                      ]
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {showReviews && ratings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Відгуки</h3>
          {ratings.map((rating) => (
            <Card key={rating.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={rating.rater.avatar || ""} />
                      <AvatarFallback>
                        {rating.rater.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{rating.rater.name}</h4>
                        <StarRating rating={rating.rating} readonly size="sm" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(rating.created_at)}
                        </span>
                      </div>

                      {/* Detailed Ratings */}
                      {(rating.communication_rating ||
                        rating.quality_rating ||
                        rating.timeliness_rating) && (
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                          {rating.communication_rating && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>
                                Комунікація: {rating.communication_rating}/5
                              </span>
                            </div>
                          )}
                          {rating.quality_rating && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Якість: {rating.quality_rating}/5</span>
                            </div>
                          )}
                          {rating.timeliness_rating && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                Терміновість: {rating.timeliness_rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review Text */}
                  {rating.review && (
                    <div className="pl-13">
                      <p className="text-sm text-muted-foreground">
                        {rating.review}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Reviews */}
      {ratings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Немає відгуків</h3>
              <p className="text-muted-foreground mb-6">
                Поки що немає відгуків про цю роботу
              </p>
              {canRate && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Star className="h-4 w-4 mr-2" />
                  Залишити перший відгук
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Залишити відгук</DialogTitle>
            <DialogDescription>
              Оцініть якість виконаної роботи та залишіть відгук
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Overall Rating */}
            <div className="space-y-2">
              <Label>Загальна оцінка *</Label>
              <StarRating
                rating={ratingData.overall_rating}
                onRatingChange={(rating) =>
                  setRatingData((prev) => ({ ...prev, overall_rating: rating }))
                }
              />
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Комунікація</Label>
                <StarRating
                  rating={ratingData.communication_rating}
                  onRatingChange={(rating) =>
                    setRatingData((prev) => ({
                      ...prev,
                      communication_rating: rating,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Якість роботи</Label>
                <StarRating
                  rating={ratingData.quality_rating}
                  onRatingChange={(rating) =>
                    setRatingData((prev) => ({
                      ...prev,
                      quality_rating: rating,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Терміновість</Label>
                <StarRating
                  rating={ratingData.timeliness_rating}
                  onRatingChange={(rating) =>
                    setRatingData((prev) => ({
                      ...prev,
                      timeliness_rating: rating,
                    }))
                  }
                />
              </div>
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <Label htmlFor="review">Відгук</Label>
              <Textarea
                id="review"
                value={ratingData.review}
                onChange={(e) =>
                  setRatingData((prev) => ({ ...prev, review: e.target.value }))
                }
                placeholder="Розкажіть про свої враження від роботи..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleSubmitRating} disabled={isSubmitting}>
              {isSubmitting ? "Відправка..." : "Відправити відгук"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
