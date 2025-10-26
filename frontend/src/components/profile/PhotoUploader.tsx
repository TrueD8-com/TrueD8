"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Loader2, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { userApi, type UserResponse } from "@/lib/api";

interface PhotoUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  onPhotosUpdated: () => void;
}

export function PhotoUploader({
  open,
  onOpenChange,
  user,
  onPhotosUpdated,
}: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxPhotos = 6;
  const currentPhotoCount = user?.photos?.length || 0;
  const canUploadMore = currentPhotoCount < maxPhotos;

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Validate and preview file
  const handleFileSelect = (file: File) => {
    // Validate file type
    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      toast.error("Please upload a JPEG, PNG, or WebP image");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Step 1: Upload to temp storage
      const uploadResponse = await userApi.uploadPhoto(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(95);

      // Step 2: Commit to profile
      await userApi.addPhoto(uploadResponse.imagePath, uploadResponse.imageExt);

      setUploadProgress(100);
      toast.success("Photo uploaded successfully!");

      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);

      // Refresh profile
      onPhotosUpdated();

      // Close modal if max photos reached
      if (currentPhotoCount + 1 >= maxPhotos) {
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload photo"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = async (photoUrl: string) => {
    try {
      await userApi.setPrimaryPhoto(photoUrl);
      toast.success("Primary photo updated!");
      onPhotosUpdated();
    } catch (error) {
      toast.error("Failed to set primary photo");
    }
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    try {
      await userApi.removePhoto(photoUrl);
      toast.success("Photo removed!");
      onPhotosUpdated();
    } catch (error) {
      toast.error("Failed to remove photo");
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Photos</DialogTitle>
          <DialogDescription>
            Upload up to {maxPhotos} photos ({currentPhotoCount}/{maxPhotos}{" "}
            used)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Photos Grid */}
          {user?.photos && user.photos.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium">Your Photos</h3>
              <div className="grid grid-cols-3 gap-3">
                {user.photos.map((photo, index) => (
                  <div
                    key={photo.url}
                    className="group relative aspect-square overflow-hidden rounded-lg border"
                  >
                    <Image
                      src={process.env.NEXT_PUBLIC_API_IMAGE_URL + photo.url}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {photo.isPrimary && (
                      <div className="absolute left-2 top-2 rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                        <Star className="inline h-3 w-3" /> Primary
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      {!photo.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimary(photo.url)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemovePhoto(photo.url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Section */}
          {canUploadMore && (
            <div>
              <h3 className="mb-3 text-sm font-medium">Add New Photo</h3>

              {!selectedFile ? (
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-medium">
                    {isDragging ? "Drop image here" : "Upload a photo"}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Drag & drop or click to select
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Image
                  </Button>
                  <p className="mt-4 text-xs text-muted-foreground">
                    JPEG, PNG, or WebP • Max 5MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="relative aspect-video overflow-hidden rounded-lg border">
                    {previewUrl && (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute right-2 top-2"
                      onClick={handleClearSelection}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-center text-sm text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={handleClearSelection}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading}>
                      {isUploading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Upload Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!canUploadMore && (
            <p className="text-center text-sm text-muted-foreground">
              You&apos;ve reached the maximum of {maxPhotos} photos. Remove a
              photo to upload a new one.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
