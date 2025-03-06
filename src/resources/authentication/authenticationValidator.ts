import Joi from "joi";

const authenticationValidator = {
  login: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export default authenticationValidator;
