export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly errors?: unknown[];

  constructor(
    message: string,
    status: number,
    code?: string,
    errors?: unknown[]
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code || this.getDefaultCode(status);
    this.errors = errors;
  }

  private getDefaultCode(status: number): string {
    const codes: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      422: "VALIDATION_ERROR",
      429: "RATE_LIMIT_EXCEEDED",
      500: "INTERNAL_SERVER_ERROR",
    };
    return codes[status] || "UNKNOWN_ERROR";
  }

  static fromResponse(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    const axiosError = error as any;
    if (axiosError?.response) {
      const { status, data } = axiosError.response;
      return new ApiError(
        data?.message || "Request failed",
        status,
        data?.code,
        data?.errors
      );
    }

    if (axiosError?.message === "Network Error") {
      return new ApiError("Network error - server unreachable", 0, "NETWORK_ERROR");
    }

    return new ApiError(
      axiosError?.message || "An unexpected error occurred",
      500,
      "UNKNOWN_ERROR"
    );
  }
}
