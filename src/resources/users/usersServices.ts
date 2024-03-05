import AppDataSource from "../../db/index";
import Users from "../../entities/Users";

const usersRepo = AppDataSource.getRepository(Users);

const usersServices = {
  create: async (data: Partial<Users>) => {
    const user = usersRepo.create(data);
    return await usersRepo.save(user);
  },

  getByEmail: async (email: string) => {
    return await usersRepo.findOne({ where: { email } });
  },
};

export default usersServices;
