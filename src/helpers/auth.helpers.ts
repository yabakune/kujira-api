import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function encryptPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export function checkJWTExpired(
  jsonWebToken: string,
  secretKey: string
): boolean {
  let isExpired = false;
  jwt.verify(jsonWebToken, secretKey, function <Error>(error: Error) {
    if (error) isExpired = true;
  });
  return isExpired;
}
