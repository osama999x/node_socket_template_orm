import { Request, Response, NextFunction } from "express";
import { Buffer } from "buffer"; // Ensure you have @types/node installed for Buffer
import { createLogger, transports, format } from "winston";
import { v4 as uuidv4 } from "uuid";
import catchAsync from "../utils/catchAsync";
import moment from "moment";

// Define the log format

// Middleware to log HTTP requests and responses
// Parse JSON request bodies
const loggingMiddleware = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logFormat = format.combine(format.timestamp(), format.json());
    // Create a logger with a file transport
    const logger = createLogger({
      level: "info",
      format: logFormat,
      transports: [
        new transports.File({
          filename: `public/logs/${moment().format("DD-MM-YYYY")} http.log`,
          level: "info",
        }),
      ],
    });
    const id = uuidv4();
    const start = Date.now();
    const { method, url, headers, body, params, query } = req;

    // Log request information including request body
    logger.info({
      id,
      type: "request",
      method,
      url,
      headers,
      body,
      params,
      query,
      time: moment().format("DD-MM-YYYY hh:mm:ss"),
    });

    const oldWrite = (res as any).write;
    const oldEnd = (res as any).end;
    let responseBody = {};

    const chunks: Buffer[] = [];

    (res as any).write = function (...restArgs: any[]) {
      chunks.push(Buffer.from(restArgs[0]));
      oldWrite.apply(res, restArgs);
    };

    (res as any).end = function (...restArgs: any[]) {
      if (restArgs[0]) {
        chunks.push(Buffer.from(restArgs[0]));
      }
      try {
        responseBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch (err) {
        console.log(err);
      }
      // console.log(body);
      oldEnd.apply(res, restArgs);
    };

    // Log response information including response body
    res.on("finish", () => {
      const duration = Date.now() - start;
      const { statusCode, statusMessage } = res;
      //   const responseBody = (res as any).locals.body; // Assuming the response body is stored in res.locals.body

      logger.info({
        id,
        type: "response",
        method,
        url,
        duration,
        statusCode,
        statusMessage,
        body: responseBody,
      });
    });

    next();
  }
);

export default loggingMiddleware;
// Your routes go here
