// const apiLogServices = require('../resources/apiLog/apiLogServices');
import { Response } from "express";
const sendResponse = async (
  res: Response,
  statusCode: number,
  message: string,
  data: object | string | null,
  logId: string | null
) => {
  if (data) {
    // await apiLogServices.updateResponse(logId, message, data, statusCode);
    res.status(statusCode || 200).send({ message, data });
  } else {
    res.status(statusCode || 200).send({ message });
  }
};

export default sendResponse;
