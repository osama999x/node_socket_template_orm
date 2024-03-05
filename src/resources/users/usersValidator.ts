import Joi from "joi";
const usersValidator = {
  create: Joi.object({
    name: Joi.string().required().error(new Error("Name must be a string")),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      //   .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    role: Joi.string().required().valid("admin", "user", "vender"),
  }),
};

export default usersValidator;
