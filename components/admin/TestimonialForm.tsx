'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FileUpload } from '@/components/ui/FileUpload';
import { Testimonial, CreateTestimonialData } from '@/lib/api/testimonials';
import { Course } from '@/lib/types/course';
import * as courseApi from '@/lib/api/courses';

const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  designation: z.string().max(255, 'Designation must be less than 255 characters').optional().or(z.literal('')),
  company: z.string().max(255, 'Company must be less than 255 characters').optional().or(z.literal('')),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(1, 'Comment is required'),
  courseId: z.string().uuid().optional().or(z.literal('')),
  isPublished: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

type TestimonialFormData = z.infer<typeof testimonialSchema> & {
  imageFile?: File | null;
  image?: string;
};

interface TestimonialFormProps {
  testimonial?: Testimonial;
  onSubmit: (data: CreateTestimonialData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const TestimonialForm: React.FC<TestimonialFormProps> = React.memo(({
  testimonial,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    testimonial?.image || null
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: testimonial
      ? {
          name: testimonial.name,
          designation: testimonial.designation || '',
          company: testimonial.company || '',
          rating: testimonial.rating || 5,
          comment: testimonial.comment || '',
          courseId: testimonial.courseId || '',
          isPublished: testimonial.isPublished || false,
          featured: testimonial.featured || false,
          order: testimonial.order || 0,
        }
      : {
          name: '',
          designation: '',
          company: '',
          rating: 5,
          comment: '',
          courseId: '',
          isPublished: false,
          featured: false,
          order: 0,
        },
    mode: 'onBlur',
  });

  const rating = watch('rating');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await courseApi.getAllCourses({ limit: 100 });
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleFileChange = useCallback((file: File | null) => {
    setImageFile(file);
    if (file) {
      // Check file size (max 5MB for testimonial images)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        console.error('Error reading file');
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(testimonial?.image || null);
    }
  }, [testimonial?.image]);

  const handleFileRemove = () => {
    setImageFile(null);
    setImagePreview(testimonial?.image || null);
  };

  const onFormSubmit = useCallback(async (data: TestimonialFormData) => {
    const submitData: CreateTestimonialData = {
      name: data.name.trim(),
      designation: data.designation?.trim() || undefined,
      company: data.company?.trim() || undefined,
      rating: data.rating,
      comment: data.comment.trim(),
      courseId: data.courseId && data.courseId.trim() ? data.courseId.trim() : undefined,
      isPublished: data.isPublished || false,
      featured: data.featured || false,
      order: data.order || 0,
      imageFile: imageFile || undefined,
      image: imagePreview && !imageFile ? imagePreview : undefined,
    };

    await onSubmit(submitData);
  }, [imageFile, imagePreview, onSubmit]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue('rating', star)}
            className={`text-2xl transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-500`}
          >
            ★
          </button>
        ))}
        <span className="text-sm text-[var(--muted-foreground)] ml-2">
          {rating} / 5
        </span>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Basic Information</h2>
            
            <div className="space-y-4">
              <Input
                label="Name *"
                {...register('name')}
                error={errors.name?.message}
                placeholder="Enter person's name"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Designation"
                  {...register('designation')}
                  error={errors.designation?.message}
                  placeholder="e.g., Student, CEO, Manager"
                />

                <Input
                  label="Company"
                  {...register('company')}
                  error={errors.company?.message}
                  placeholder="Company name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Rating *
                </label>
                {renderStars(rating)}
                {errors.rating && (
                  <p className="mt-1 text-sm text-[var(--error)]">{errors.rating.message}</p>
                )}
                <input
                  type="hidden"
                  value={rating}
                  {...register('rating', { valueAsNumber: true })}
                />
              </div>

              <Textarea
                label="Testimonial/Comment *"
                {...register('comment')}
                error={errors.comment?.message}
                rows={6}
                placeholder="Enter the testimonial or review comment..."
              />

              <Select
                label="Related Course"
                {...register('courseId')}
                error={errors.courseId?.message}
                options={[
                  { value: '', label: 'No course (General testimonial)' },
                  ...courses.map((course) => ({
                    value: course.id,
                    label: course.title,
                  })),
                ]}
                disabled={loadingCourses}
              />

              <FileUpload
                label="Profile Image"
                accept="image/*"
                maxSize={5}
                value={imagePreview || imageFile}
                onChange={handleFileChange}
                onRemove={handleFileRemove}
                helperText="Upload profile image (max 5MB)"
              />
            </div>
          </Card>
        </div>

        {/* Right Column - Settings */}
        <div className="lg:col-span-1">
          <Card padding="lg">
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  {...register('featured')}
                  className="rounded-none"
                />
                <label htmlFor="featured" className="text-sm font-medium text-[var(--foreground)]">
                  Featured Testimonial
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register('isPublished')}
                  className="rounded-none"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-[var(--foreground)]">
                  Publish Testimonial
                </label>
              </div>

              <Input
                label="Display Order"
                type="number"
                min="0"
                {...register('order', { valueAsNumber: true })}
                error={errors.order?.message}
                helperText="Lower numbers appear first"
                placeholder="0"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isLoading} isLoading={isLoading}>
          {testimonial ? 'Update Testimonial' : 'Create Testimonial'}
        </Button>
      </div>
    </form>
  );
});
