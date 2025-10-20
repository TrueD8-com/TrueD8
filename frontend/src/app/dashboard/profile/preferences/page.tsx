"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  preferencesSchema,
  type PreferencesFormData,
  SHOW_ME_OPTIONS,
} from "@/lib/validations/profile";
import { authApi, userApi, type UserResponse } from "@/lib/api";

export default function PreferencesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMe, setShowMe] = useState<string[]>([]);

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      discoveryDistanceKm: 50,
      discoveryAgeMin: 18,
      discoveryAgeMax: 99,
      discoveryVisible: true,
      discoveryGlobal: false,
    },
  });

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
        setShowMe(userData.showMe || []);
        form.reset({
          discoveryDistanceKm: userData.discovery?.distanceKm || 50,
          discoveryAgeMin: userData.discovery?.ageMin || 18,
          discoveryAgeMax: userData.discovery?.ageMax || 99,
          discoveryVisible: userData.discovery?.visible ?? true,
          discoveryGlobal: userData.discovery?.global ?? false,
        });
      } catch (error) {
        toast.error("Failed to load preferences");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [form]);

  const onSubmit = async (data: PreferencesFormData) => {
    try {
      await userApi.editProfile({
        ...data,
        profileShowMe: showMe,
      });
      toast.success("Preferences updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update preferences"
      );
    }
  };

  const handleShowMeChange = (value: string, checked: boolean) => {
    if (checked) {
      setShowMe([...showMe, value]);
    } else {
      setShowMe(showMe.filter((v) => v !== value));
    }
  };

  const distanceValue = form.watch("discoveryDistanceKm");
  const ageMinValue = form.watch("discoveryAgeMin");
  const ageMaxValue = form.watch("discoveryAgeMax");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Discovery Preferences</h1>
        <p className="mt-2 text-muted-foreground">
          Customize who you see and who can see you
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Match Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estimated Matches
              </CardTitle>
              <CardDescription>
                Based on your current preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">~</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  People match your criteria
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Looking For Section */}
          <Card>
            <CardHeader>
              <CardTitle>Looking For</CardTitle>
              <CardDescription>
                Select who you want to see in your discovery feed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SHOW_ME_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      id={`showme-${option.value}`}
                      checked={showMe.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleShowMeChange(option.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`showme-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
                {showMe.length === 0 && (
                  <p className="text-sm text-destructive">
                    Please select at least one option
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Distance Preference */}
          <Card>
            <CardHeader>
              <CardTitle>Maximum Distance</CardTitle>
              <CardDescription>
                How far away should we look for matches?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="discoveryDistanceKm"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-4">
                        <Slider
                          min={1}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">1 km</span>
                          <span className="font-medium">
                            {distanceValue} km
                          </span>
                          <span className="text-muted-foreground">100 km</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Age Range Preference */}
          <Card>
            <CardHeader>
              <CardTitle>Age Range</CardTitle>
              <CardDescription>
                What age range are you interested in?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="discoveryAgeMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Age: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={18}
                        max={99}
                        step={1}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discoveryAgeMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Age: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={18}
                        max={99}
                        step={1}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between rounded-lg border p-4">
                <span className="text-sm text-muted-foreground">
                  Age Range:
                </span>
                <span className="text-sm font-medium">
                  {ageMinValue} - {ageMaxValue} years
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Visibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility Settings</CardTitle>
              <CardDescription>
                Control how your profile appears to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="discoveryVisible"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Make my profile visible
                      </FormLabel>
                      <FormDescription>
                        Allow others to discover your profile
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discoveryGlobal"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Global discovery
                      </FormLabel>
                      <FormDescription>
                        Show profiles from anywhere, not just nearby
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || showMe.length === 0}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Preferences
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
