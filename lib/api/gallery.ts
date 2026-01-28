import axios from 'axios';
import { apiClient, handleApiResponse, handleApiError } from './axios';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import { PaginatedResponse, ApiResponse, Pagination } from '@/lib/types/api';

export type GalleryType = 'IMAGE' | 'VIDEO';

export interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  videoUrl?: string | null;
  type: GalleryType;
  category?: string | null;
  isPublished: boolean;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryItemData {
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  type?: GalleryType;
  category?: string;
  isPublished?: boolean;
  featured?: boolean;
  order?: number;
  file?: File; // For file upload
}

export interface UpdateGalleryItemData extends Partial<CreateGalleryItemData> {}

// Public: Get all published gallery items
export const getGalleryItems = async (params?: {
  page?: number;
  limit?: number;
  type?: GalleryType;
  category?: string;
  featured?: boolean;
}): Promise<PaginatedResponse<GalleryItem>> => {
  try {
    const response = await apiClient.get<ApiResponse<GalleryItem[]> & { pagination: Pagination }>(API_ENDPOINTS.GALLERY.LIST, {
      params,
    });

    const payload = response.data;
    if (payload.success && payload.data) {
      return {
        data: payload.data,
        pagination: payload.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: payload.data.length,
          pages: 1,
        },
      };
    }
    throw new Error('Failed to fetch gallery items');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin: Get all gallery items (including unpublished)
export const getAllGalleryItems = async (params?: {
  page?: number;
  limit?: number;
  type?: GalleryType;
  category?: string;
  featured?: boolean;
  isPublished?: boolean;
}): Promise<PaginatedResponse<GalleryItem>> => {
  try {
    const response = await apiClient.get<ApiResponse<GalleryItem[]> & { pagination: Pagination }>(API_ENDPOINTS.GALLERY.LIST, {
      params: {
        ...params,
      },
    });

    const payload = response.data;
    if (payload.success && payload.data) {
      return {
        data: payload.data,
        pagination: payload.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: payload.data.length,
          pages: 1,
        },
      };
    }
    throw new Error('Failed to fetch gallery items');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Public: Get gallery item by ID
export const getGalleryItemById = async (id: string): Promise<GalleryItem> => {
  try {
    const response = await apiClient.get<ApiResponse<GalleryItem>>(API_ENDPOINTS.GALLERY.BY_ID(id));
    return handleApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin: Create gallery item
export const createGalleryItem = async (data: CreateGalleryItemData): Promise<GalleryItem> => {
  try {
    // Either file or URL must be provided
    if (!data.file && !data.imageUrl && !data.videoUrl) {
      throw new Error('Please upload a file or provide an image/video URL');
    }

    const formData = new FormData();

    formData.append('title', data.title.trim());
    if (data.description) formData.append('description', data.description);
    if (data.type) formData.append('type', data.type);
    if (data.category) formData.append('category', data.category.trim());
    if (data.isPublished !== undefined) formData.append('isPublished', data.isPublished.toString());
    if (data.featured !== undefined) formData.append('featured', data.featured.toString());
    if (data.order !== undefined) formData.append('order', data.order.toString());
    
    // Handle file upload (priority) or URL (optional alternative)
    if (data.file) {
      formData.append('file', data.file);
    } else {
      // URLs are optional - only use if no file is uploaded
      if (data.imageUrl) {
        formData.append('imageUrl', data.imageUrl);
      }
      if (data.videoUrl) {
        formData.append('videoUrl', data.videoUrl);
      }
    }

    const response = await apiClient.post<ApiResponse<GalleryItem>>(API_ENDPOINTS.GALLERY.LIST, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 180000, // 3 minutes timeout for gallery uploads (larger files)
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      },
    });

    return handleApiResponse(response);
  } catch (error: any) {
    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Upload timed out. Please try again with a smaller file or check your internet connection.');
    }
    // Handle 408 status code
    if (error.response?.status === 408) {
      throw new Error(error.response?.data?.message || 'Upload timed out. Please try again with a smaller file.');
    }
    throw new Error(handleApiError(error));
  }
};

// Admin: Update gallery item
export const updateGalleryItem = async (id: string, data: UpdateGalleryItemData): Promise<GalleryItem> => {
  try {
    const formData = new FormData();

    if (data.title) formData.append('title', data.title.trim());
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.type) formData.append('type', data.type);
    if (data.category !== undefined) formData.append('category', data.category?.trim() || '');
    if (data.isPublished !== undefined) formData.append('isPublished', data.isPublished.toString());
    if (data.featured !== undefined) formData.append('featured', data.featured.toString());
    if (data.order !== undefined) formData.append('order', data.order.toString());
    
    // Handle file upload or URL
    if (data.file) {
      formData.append('file', data.file);
    } else if (data.imageUrl !== undefined) {
      formData.append('imageUrl', data.imageUrl || '');
    } else if (data.videoUrl !== undefined) {
      formData.append('videoUrl', data.videoUrl || '');
    }

    const response = await apiClient.put<ApiResponse<GalleryItem>>(API_ENDPOINTS.GALLERY.BY_ID(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 180000, // 3 minutes timeout for gallery uploads
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      },
    });

    return handleApiResponse(response);
  } catch (error: any) {
    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Upload timed out. Please try again with a smaller file or check your internet connection.');
    }
    // Handle 408 status code
    if (error.response?.status === 408) {
      throw new Error(error.response?.data?.message || 'Upload timed out. Please try again with a smaller file.');
    }
    throw new Error(handleApiError(error));
  }
};

// Admin: Delete gallery item
export const deleteGalleryItem = async (id: string): Promise<void> => {
  try {
    await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.GALLERY.BY_ID(id));
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// For backward compatibility
export const galleryApi = {
  getAll: getAllGalleryItems,
  getById: getGalleryItemById,
  create: createGalleryItem,
  update: updateGalleryItem,
  delete: deleteGalleryItem,
};
