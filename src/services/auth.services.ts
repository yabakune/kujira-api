import jwt from "jsonwebtoken";

export function generateVerificationCode(secretKey: string): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += Math.floor(Math.random() * 10);
  }
  const verificationCode = jwt.sign({ code }, secretKey, {
    expiresIn: "5m",
  });
  return verificationCode;
}

type Decoded = { code: string } & jwt.JwtPayload;
export function decodeVerificationCode(
  verificationCode: string,
  secretKey: string
): string {
  const { code } = jwt.verify(verificationCode, secretKey) as Decoded;
  return code;
}

// function checkJWTExpired(jsonWebToken: string, secretKey: string): boolean {
//   let isExpired = false;
//   jwt.verify(jsonWebToken, secretKey, function <Error>(error: Error) {
//     if (error) isExpired = true;
//   });
//   return isExpired;
// }

export function generateVerificationCodes() {
  const secretKey = process.env.VERIFICATION_CODE_SECRET_KEY;
  if (secretKey) {
    const verificationCode = generateVerificationCode(secretKey);
    const userCode = decodeVerificationCode(verificationCode, secretKey);
    return { verificationCode, userCode };
  } else {
    console.log(
      "VERIFICATION_CODE_SECRET_KEY environment variable does not exist."
    );
    throw new Error(
      "There was an error creating your account. Please try again. If the issue persists, please contact kujira.help@outlook.com."
    );
  }
}
