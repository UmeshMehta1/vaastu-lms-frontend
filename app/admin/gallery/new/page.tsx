'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GalleryForm } from '@/components/admin/GalleryForm';
import { CreateGalleryItemData } from '@/lib/api/gallery';
import * as galleryApi from '@/lib/api/gallery';
import { showSuccess, showError } from '@/lib/utils/toast';

export default function NewGalleryPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateGalleryItemData) => {
    try {
      console.log('Creating gallery item with data:', {
        title: data.title,
        type: data.type,
        hasFile: !!data.file,
        fileSize: data.file ? `${(data.file.size / (1024 * 1024)).toFixed(2)}MB` : 'N/A',
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
      });
      
      await galleryApi.createGalleryItem(data);
      showSuccess('Gallery item created successfully!');
      router.push('/admin/gallery');
    } catch (error: any) {
      console.error('Error creating gallery item:', error);
      let errorMessage = 'Failed to create gallery item';
      
      if (error?.message?.includes('timeout') || error?.message?.includes('timed out')) {
        errorMessage = 'Upload timed out. Please try again with a smaller file or check your internet connection.';
      } else if (error?.response?.status === 408) {
        errorMessage = error?.response?.data?.message || 'Upload timed out. Please try again with a smaller file.';
      } else {
        errorMessage = error?.message || error?.response?.data?.message || errorMessage;
      }
      
      showError(errorMessage);
      // Don't throw error to prevent form from resetting
    }
  };

  const handleCancel = () => {
    router.push('/admin/gallery');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Create New Gallery Item</h1>
        <p className="text-[var(--muted-foreground)] mt-2">Add a new image or video to the gallery</p>
      </div>

      <GalleryForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
