export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  payload: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown[];
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
