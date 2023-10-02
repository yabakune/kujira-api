import { User } from "@prisma/client";

function excludeFieldFromUserObject<User, Field extends keyof User>(
  user: User,
  fields: Field[]
): Omit<User, Field> {
  for (let field of fields) delete user[field];
  return user;
}

export function generateSafeUser(user: User) {
  return excludeFieldFromUserObject(user, [
    "password",
    "accessToken",
    "verificationCode",
  ]);
}
