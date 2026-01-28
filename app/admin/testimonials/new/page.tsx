'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TestimonialForm } from '@/components/admin/TestimonialForm';
import { CreateTestimonialData } from '@/lib/api/testimonials';
import * as testimonialApi from '@/lib/api/testimonials';
import { showSuccess, showError } from '@/lib/utils/toast';

export default function NewTestimonialPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateTestimonialData) => {
    try {
      await testimonialApi.createTestimonial(data);
      showSuccess('Testimonial created successfully!');
      router.push('/admin/testimonials');
    } catch (error) {
      console.error('Error creating testimonial:', error);
      showError(Object(error).message || 'Failed to create testimonial');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/admin/testimonials');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Create New Testimonial</h1>
        <p className="text-[var(--muted-foreground)] mt-2">Add a new student testimonial or review</p>
      </div>

      <TestimonialForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
