import { apiClient, handleApiResponse, handleApiError } from './axios';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import { ApiResponse, PaginatedResponse } from '@/lib/types/api';

export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  venue?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  price: number;
  isFree: boolean;
  maxAttendees?: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  isRegistered?: boolean;
  _count?: {
    registrations: number;
  };
}

export interface CreateEventRequest {
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  venue?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  price?: number;
  isFree?: boolean;
  maxAttendees?: number;
  featured?: boolean;
}

export interface UpdateEventRequest {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  venue?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
  isFree?: boolean;
  maxAttendees?: number;
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  featured?: boolean;
}

/**
 * Get all events
 */
export const getAllEvents = async (params?: {
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  featured?: boolean;
  upcoming?: boolean;
  past?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Event>> => {
  try {
    const response = await apiClient.get<ApiResponse<Event[]>>(API_ENDPOINTS.EVENTS.LIST, {
      params,
    });
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return {
        data: responseData.data,
        pagination: (responseData as any).pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: responseData.data.length,
          pages: 1,
        },
      };
    }
    throw new Error(responseData.message || 'Failed to fetch events');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get featured events
 */
export const getFeaturedEvents = async (): Promise<Event[]> => {
  try {
    const response = await getAllEvents({ featured: true, limit: 100 });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (): Promise<Event[]> => {
  try {
    const response = await getAllEvents({ upcoming: true, limit: 100 });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get event by ID or slug
 */
export const getEventById = async (id: string): Promise<Event> => {
  try {
    const response = await apiClient.get<ApiResponse<Event>>(API_ENDPOINTS.EVENTS.BY_ID(id));
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    throw new Error(responseData.message || 'Event not found');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Create new event (admin only)
 */
export const createEvent = async (data: CreateEventRequest): Promise<Event> => {
  try {
    const response = await apiClient.post<ApiResponse<Event>>(API_ENDPOINTS.EVENTS.LIST, data);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    throw new Error(responseData.message || 'Failed to create event');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update event (admin only)
 */
export const updateEvent = async (id: string, data: UpdateEventRequest): Promise<Event> => {
  try {
    const response = await apiClient.put<ApiResponse<Event>>(API_ENDPOINTS.EVENTS.BY_ID(id), data);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    throw new Error(responseData.message || 'Failed to update event');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete event (admin only)
 */
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.EVENTS.BY_ID(id));
    handleApiResponse<void>(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Register for event
 */
export const registerForEvent = async (
  id: string,
  data?: {
    name?: string;
    email?: string;
    phone?: string;
  }
): Promise<void> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>(`${API_ENDPOINTS.EVENTS.BY_ID(id)}/register`, data || {});
    const responseData = response.data;
    if (responseData.success) {
      return;
    }
    throw new Error(responseData.message || 'Failed to register for event');
  } catch (error: any) {
    // Handle axios errors
    if (error.response) {
      const responseData = error.response.data;
      
      // Handle validation errors from backend
      if (responseData.errors && Array.isArray(responseData.errors)) {
        const errorMessages = responseData.errors
          .map((e: any) => e.msg || e.message || JSON.stringify(e))
          .filter(Boolean)
          .join(', ');
        throw new Error(errorMessages || responseData.message || 'Validation failed');
      }
      
      // Handle other error messages
      if (responseData.message) {
        throw new Error(responseData.message);
      }
    }
    
    // Handle network errors or other issues
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error(handleApiError(error));
  }
};

/**
 * Unregister from event
 */
export const unregisterFromEvent = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.post<ApiResponse<void>>(`${API_ENDPOINTS.EVENTS.BY_ID(id)}/unregister`);
    handleApiResponse<void>(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// For backward compatibility
export const eventsApi = {
  getAllEvents,
  getFeaturedEvents,
  getUpcomingEvents,
  getById: getEventById,
  create: createEvent,
  update: updateEvent,
  delete: deleteEvent,
  register: registerForEvent,
  unregister: unregisterFromEvent,
};
