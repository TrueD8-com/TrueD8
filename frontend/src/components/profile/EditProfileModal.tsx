"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InterestsSelector } from "./InterestsSelector";
import {
  fullProfileSchema,
  type FullProfileFormData,
  GENDER_OPTIONS,
  SHOW_ME_OPTIONS,
} from "@/lib/validations/profile";
import { userApi, type UserResponse } from "@/lib/api";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  onProfileUpdated: () => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  user,
  onProfileUpdated,
}: EditProfileModalProps) {
  const form = useForm<FullProfileFormData>({
    resolver: zodResolver(fullProfileSchema),
    defaultValues: {
      profileName: user?.name || "",
      profileLastName: user?.lastName || "",
      profileUsername: user?.username || "",
      profileBio: user?.bio || "",
      profileGender: (user?.gender as "male" | "female" | "non-binary" | "other") || "male",
      profileShowMe: user?.showMe || [],
      profileInterests: user?.interests || [],
      discoveryDistanceKm: user?.discovery?.distanceKm || 50,
      discoveryAgeMin: user?.discovery?.ageMin || 18,
      discoveryAgeMax: user?.discovery?.ageMax || 99,
      discoveryVisible: user?.discovery?.visible ?? true,
      discoveryGlobal: user?.discovery?.global ?? false,
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        profileName: user.name || "",
        profileLastName: user.lastName || "",
        profileUsername: user.username || "",
        profileBio: user.bio || "",
        profileGender: (user.gender as "male" | "female" | "non-binary" | "other") || "male",
        profileShowMe: user.showMe || [],
        profileInterests: user.interests || [],
        discoveryDistanceKm: user.discovery?.distanceKm || 50,
        discoveryAgeMin: user.discovery?.ageMin || 18,
        discoveryAgeMax: user.discovery?.ageMax || 99,
        discoveryVisible: user.discovery?.visible ?? true,
        discoveryGlobal: user.discovery?.global ?? false,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: FullProfileFormData) => {
    try {
      await userApi.editProfile(data);
      toast.success("Profile updated successfully!");
      onProfileUpdated();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  };

  const bioLength = form.watch("profileBio")?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and discovery preferences
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="profileName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="profileUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Letters, numbers, and underscores only
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profileBio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {bioLength}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profileGender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Looking For Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Looking For</h3>

              <FormField
                control={form.control}
                name="profileShowMe"
                render={() => (
                  <FormItem>
                    <FormLabel>Show me *</FormLabel>
                    <div className="space-y-2">
                      {SHOW_ME_OPTIONS.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="profileShowMe"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(
                                      option.value
                                    )}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            option.value,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== option.value
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Interests Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Interests</h3>

              <FormField
                control={form.control}
                name="profileInterests"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InterestsSelector
                        selectedInterests={field.value || []}
                        onChange={field.onChange}
                        maxSelections={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Discovery Preferences Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Discovery Preferences</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="discoveryDistanceKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Distance (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>1-100 km</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discoveryAgeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={18}
                          max={99}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
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
                      <FormLabel>Max Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={18}
                          max={99}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="discoveryVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Make my profile visible</FormLabel>
                      <FormDescription>
                        Allow others to discover your profile
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discoveryGlobal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable global discovery</FormLabel>
                      <FormDescription>
                        Show profiles from anywhere, not just nearby
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
