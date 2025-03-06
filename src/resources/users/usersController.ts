import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import usersValidator from "./usersValidator";
import sendResponse from "../../utils/sendResponse";
import responseCodes from "../../utils/responseCodes";
import passwordHash from "../../utils/passwordHash";
import usersServices from "./usersServices";

const usersController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const { error } = usersValidator.create.validate(req.body);
    if (error) {
      return await sendResponse(
        res,
        responseCodes.BAD,
        error.details[0].message.replace(/"/g, ""),
        null,
        null
      );
    }

    req.body.password = await passwordHash.hash(req.body.password);
    const user = await usersServices.create(req.body);
    if (user) {
      return await sendResponse(
        res,
        responseCodes.CREATED,
        "User created successfully",
        null,
        null
      );
    }
    return await sendResponse(
      res,
      responseCodes.BAD,
      "User not created",
      null,
      null
    );
  }),
};

export default usersController;
