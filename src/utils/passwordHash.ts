import bcryptjs from "bcryptjs";

const hash = async (password: string) => {
  return await bcryptjs.hash(password, 12);
};

const validatePassword = async (password: string, hash: string) => {
  const isValid = await bcryptjs.compare(password, hash);
  return isValid;
};

export default { hash, validatePassword };
