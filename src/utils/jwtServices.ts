import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const jwtServices = {
  create: async (data: object, expiresIn?: string) => {
    const jwtKey = process.env.JWT_SECRET;
    if (!jwtKey) {
      throw new Error("JWT secret key not found in environment variables");
    }
    if (process.env.NODE_ENV === "development") {
      expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN;
    }
    const expiredIn = "365d";

    const token = jwt.sign(data, jwtKey, { expiresIn: expiredIn });
    return token;
  },
  authenticate: async (token: string) => {
    try {
      const jwtKey = process.env.JWT_SECRET;
      if (!jwtKey) {
        throw new Error("JWT secret key not found in environment variables");
      }
      const verifyToken = jwt.verify(token, jwtKey);
      return verifyToken;
    } catch (error) {
      console.log("error: ", error);
    }
  },
};
export default jwtServices;
