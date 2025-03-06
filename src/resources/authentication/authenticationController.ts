import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import authenticationValidator from "./authenticationValidator";
import sendResponse from "../../utils/sendResponse";
import responseCodes from "../../utils/responseCodes";
import usersServices from "../users/usersServices";
import passwordHash from "../../utils/passwordHash";
import jwtServices from "../../utils/jwtServices";

const authenticationController = {
  login: catchAsync(async (req: Request, res: Response) => {
    const { error } = authenticationValidator.login.validate(req.body);
    if (error) {
      return await sendResponse(
        res,
        responseCodes.BAD,
        error.details[0].message.replace(/"/g, ""),
        null,
        null
      );
    }
    const { email, password } = req.body;
    const user = await usersServices.getByEmail(email);
    if (!user) {
      return await sendResponse(
        res,
        responseCodes.NOT_AUTHORIZED,
        "Authentication failed",
        null,
        null
      );
    }
    const isValidPassword = await passwordHash.validatePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      return await sendResponse(
        res,
        responseCodes.NOT_AUTHORIZED,
        "Authentication failed",
        null,
        null
      );
    }

    const accessToken = await jwtServices.create({ userId: user.id });
    const userData = JSON.parse(JSON.stringify(user));
    delete userData.password;
    userData.accessToken = accessToken;
    return await sendResponse(
      res,
      responseCodes.OK,
      "Logged in",
      userData,
      null
    );
  }),
};

export default authenticationController;
