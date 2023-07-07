import bcrypt from "bcrypt";

export async function encryptPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}
