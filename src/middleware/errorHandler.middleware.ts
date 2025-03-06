import { NextFunction, Request, Response } from "express";

import AppError from "../utils/appError";

import { QueryFailedError } from "typeorm";

import { AxiosError } from "axios";

import { EntityMetadataNotFoundError } from "typeorm/error/EntityMetadataNotFoundError";

import { ValidationError } from "class-validator";

class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}

export default async (
  err: any,

  req: Request,

  res: Response,

  next: NextFunction
) => {
  console.log("ERR CAUGHT IN GLOBAL MIDDLEWARE");

  console.error("ERROR =>", err);

  console.error("ERROR MESSAGE =>", err.message);

  console.error("ERROR NAME =>", err.name);

  console.error("ERROR CODE =>", err.code);

  console.error("ERROR STACK =>", err.stack);

  const handleDuplicateFieldsDB = (err: any): AppError => {
    if (err.detail) {
      const field = err.detail.match(/\((.*?)\)/)[1];

      const errorKey = field;

      return new AppError(`${errorKey} already exists`, 400, true);
    }

    return new AppError(err, 400, true);
  };

  const invalidForeignKey = (err: any): AppError => {
    if (err.detail) {
      const field = err.detail.match(/\((.*?)\)/)[1];

      const errorKey = field;

      return new AppError(`${errorKey} not found`, 400, true);
    }

    return new AppError(
      err,

      //'Invalid foreign key error',

      400,
      true
    );
  };

  const checkNull = (err: any): AppError => {
    if (err.detail) {
      const field = err.detail.match(/\((.*?)\)/)[1];

      const errorKey = field;

      return new AppError(`${errorKey} cannot be null`, 400, true);
    }

    return new AppError(
      err,

      //'Null value error',

      400,
      true
    );
  };

  class DatabaseError extends Error {
    constructor(message: string) {
      super(message);

      this.name = "DatabaseError";
    }
  }

  const invalidInput = (err: any): AppError => {
    const invalidValueMatch = err.message.match(
      /invalid input syntax for type (\w+): "(.*)"/
    );

    const invalidType = invalidValueMatch ? invalidValueMatch[1] : "unknown";

    const invalidValue = invalidValueMatch ? invalidValueMatch[2] : "unknown";

    let errorMessage: string;

    switch (invalidType.toLowerCase()) {
      case "uuid":
        errorMessage = `Invalid UUID provided: ${invalidValue}`;

        break;

      case "integer":

      case "int":

      case "number":
        errorMessage = `Invalid number provided: ${invalidValue}`;

        break;

      case "date":

      case "datetime":

      case "timestamp":
        errorMessage = `Invalid date provided: ${invalidValue}`;

        break;

      default:
        errorMessage = `Invalid ${invalidType} value provided: ${invalidValue}`;

        break;
    }

    return new AppError(errorMessage, 400, true);
  };

  const handleValidationError = (err: any): AppError => {
    const errors = Object.values(err.errors).map((val: any) => val.message);

    return new AppError(errors[0], 400, true);
  };

  // if (err instanceof ValidationError) {

  //     err = handleValidationError(err);

  //   }

  const handleError = (err: any): AppError => {
    return new AppError(err.message, 400, true);
  };

  // Default error object to return

  const errorResponse = {
    message: "Internal Server Error",
  };

  //  if (err.name === 'ValidationError') {

  //     // TypeORM validation error

  //     const validationErrors = Object.values(err.errors).map((val: any) => val.message);

  //     err=new AppError( validationErrors ,400,true);

  //   }else

  if (err instanceof EntityMetadataNotFoundError) {
    console.error("Metadata not found for entity:", err.message);

    err = new AppError("Entity metadata not found", 400, true);
  } else if (err instanceof QueryFailedError) {
    // if (err.message.includes('column')) {

    err = handleDuplicateFieldsDB(err);

    // } else {

    //   err = new AppError(`${errorKey} already exists`, 400, true);

    // }
  } else if (err.code === "23505") {
    err = handleDuplicateFieldsDB(err);
  } else if (err.code === "23503") {
    err = invalidForeignKey(err);
  } else if (err.code === "23502") {
    err = checkNull(err);
  } else if (err.code === "22P02") {
    err = invalidInput(err);
  } else if (err.name === "Error") {
    err = handleError(err);
  } else if (err.message === "Request failed with status code 401") {
    console.error("Request failed with status code 401");

    err = new AppError("Unauthorized", 401, true);
  } else if (err.message === "Request failed with status code 400") {
    console.error("Request failed with status code 400");

    err = new AppError("Request Failed", 400, true);
  } else if (err.message === "Request failed with status code 500") {
    console.error("Request failed with status code 500");

    err = new AppError("Internal Server Error", 500, true);
  } else if (err.name === "UpdateValuesMissingError") {
    console.error(
      "UpdateValuesMissingError: Cannot perform update query because update values are not defined"
    );

    err = new AppError(
      "Cannot perform update query because update values are not defined",
      400,
      true
    );
  } else if (err instanceof CustomError) {
    // Handle specific error types if needed

    errorResponse.message = err.message;

    err = new AppError(errorResponse.message, 500, true);

    // You can also set a specific status code for this type of error if needed

    // res.status(400);
  } else if (err instanceof DatabaseError) {
    // Handle database-specific errors

    console.error("Database error:", err);

    err = new AppError("Database operation failed.", 500, true);
  } else if (
    err.name === "QueryFailedError" ||
    err.name === "EntityNotFoundError"
  ) {
    // Handle TypeORM database errors (you can add more specific error checks if needed)

    errorResponse.message = "Database Error";

    err = new AppError(errorResponse.message, 500, true);

    // You can also set a specific status code for database errors if needed

    // res.status(500);
  } else if (err instanceof ApiError) {
    // Handle custom AppError (e.g., validation errors, business logic errors)

    err = new AppError(err.message, err.statusCode);
  } else if (err.isAxiosError) {
    // Handle AxiosError (e.g., HTTP request errors)

    const axiosError = err as AxiosError;

    err = new AppError("Request failed.", axiosError.response?.status || 500);
  } else if (err instanceof ValidationError) {
    err = handleValidationError(err);
  } else {
    err = new AppError(err.message, err.statusCode, false);
  }

  const responsePayload = {
    status: "error",

    message: err.message,
  };

  // if (process.env.NODE_ENV === 'development') {

  //   responsePayload['stack'] = err.stack;

  // }

  return res.status(err.statusCode).json(responsePayload);
};

export class CustomError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "CustomError";
  }
}
