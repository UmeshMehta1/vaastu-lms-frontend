import axios from 'axios';
import { apiClient, handleApiResponse, handleApiError } from './axios';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import { PaginatedResponse, ApiResponse, Pagination } from '@/lib/types/api';

export interface Testimonial {
  id: string;
  name: string;
  image?: string | null;
  designation?: string | null;
  company?: string | null;
  rating: number;
  comment: string;
  courseId?: string | null;
  course?: {
    id: string;
    title: string;
    instructor?: {
      id: string;
      name: string;
    };
  } | null;
  isPublished: boolean;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonialData {
  name: string;
  image?: string;
  imageFile?: File;
  designation?: string;
  company?: string;
  rating?: number;
  comment: string;
  courseId?: string;
  isPublished?: boolean;
  featured?: boolean;
  order?: number;
}

export interface UpdateTestimonialData extends Partial<CreateTestimonialData> {}

// Public: Get all published testimonials
export const getTestimonials = async (params?: {
  page?: number;
  limit?: number;
  featured?: boolean;
  courseId?: string;
}): Promise<PaginatedResponse<Testimonial>> => {
  try {
    const response = await apiClient.get<ApiResponse<Testimonial[]> & { pagination: Pagination }>(API_ENDPOINTS.TESTIMONIALS.LIST, {
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
    throw new Error('Failed to fetch testimonials');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Public: Get testimonial by ID
export const getTestimonialById = async (id: string): Promise<Testimonial> => {
  try {
    const response = await apiClient.get<ApiResponse<Testimonial>>(API_ENDPOINTS.TESTIMONIALS.BY_ID(id));
    return handleApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin: Get all testimonials (including unpublished)
export const getAllTestimonials = async (params?: {
  page?: number;
  limit?: number;
  featured?: boolean;
  courseId?: string;
  isPublished?: boolean;
}): Promise<PaginatedResponse<Testimonial>> => {
  try {
    const response = await apiClient.get<ApiResponse<Testimonial[]> & { pagination: Pagination }>(API_ENDPOINTS.TESTIMONIALS.LIST, {
      params: {
        ...params,
        // Remove isPublished filter for admin - backend should return all
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
    throw new Error('Failed to fetch testimonials');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin: Create testimonial
export const createTestimonial = async (data: CreateTestimonialData): Promise<Testimonial> => {
  try {
    const formData = new FormData();

    formData.append('name', data.name.trim());
    if (data.comment) formData.append('comment', data.comment);
    if (data.designation) formData.append('designation', data.designation.trim());
    if (data.company) formData.append('company', data.company.trim());
    if (data.rating !== undefined) formData.append('rating', data.rating.toString());
    if (data.courseId) formData.append('courseId', data.courseId);
    if (data.isPublished !== undefined) formData.append('isPublished', data.isPublished.toString());
    if (data.featured !== undefined) formData.append('featured', data.featured.toString());
    if (data.order !== undefined) formData.append('order', data.order.toString());
    if (data.image && !data.imageFile) formData.append('image', data.image);
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    const response = await apiClient.post<ApiResponse<Testimonial>>(API_ENDPOINTS.TESTIMONIALS.LIST, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return handleApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin: Update testimonial
export const updateTestimonial = async (id: string, data: UpdateTestimonialData): Promise<Testimonial> => {
  try {
    const formData = new FormData();

    if (data.name) formData.append('name', data.name.trim());
    if (data.comment !== undefined) formData.append('comment', data.comment);
    if (data.designation !== undefined) formData.append('designation', data.designation?.trim() || '');
    if (data.company !== undefined) formData.append('company', data.company?.trim() || '');
    if (data.rating !== undefined) formData.append('rating', data.rating.toString());
    if (data.courseId !== undefined) formData.append('courseId', data.courseId || '');
    if (data.isPublished !== undefined) formData.append('isPublished', data.isPublished.toString());
    if (data.featured !== undefined) formData.append('featured', data.featured.toString());
    if (data.order !== undefined) formData.append('order', data.order.toString());
    if (data.image && !data.imageFile) formData.append('image', data.image);
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    const response = await apiClient.put<ApiResponse<Testimonial>>(API_ENDPOINTS.TESTIMONIALS.BY_ID(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return handleApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin: Delete testimonial
export const deleteTestimonial = async (id: string): Promise<void> => {
  try {
    await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.TESTIMONIALS.BY_ID(id));
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

