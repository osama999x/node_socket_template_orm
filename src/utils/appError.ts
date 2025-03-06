class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public status: string;
  public path?: string;
  public value?: string;
  public code?: number;
  public response?: any;
  public errors?: Array<{ message: string }>;

  constructor(
    message: string,
    statusCode: number,
    isOperational = false,
    stack?: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = statusCode.toString().startsWith("4") ? "fail" : "error";

    // Capture the stack trace for debugging (Node.js only)
    if (stack) {
      this.stack = stack;
    } else {
      if (typeof (Error as any).captureStackTrace === "function") {
        (Error as any).captureStackTrace(this, this.constructor);
      }
    }
  }

  /**
   * Serializes error details for API responses.
   */
  public serializeErrors() {
    return {
      status: this.status,
      message: this.message,
      errors: this.errors || [],
      code: this.code,
      path: this.path,
      value: this.value
    };
  }
}

export default AppError;
