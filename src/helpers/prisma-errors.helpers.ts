import { Prisma } from "@prisma/client";

function handlePrismaError<ErrorCause>(
  errorCode: string,
  errorCause?: ErrorCause
): string {
  switch (errorCode) {
    case "P1000":
      return "Authentication failed. Please provide credentials to access.";
    case "P2002":
      return errorCause
        ? `Provided ${errorCause} not available.`
        : "The input you provided already exists.";
    case "P2025":
      return "Record not found";
    default:
      return `The specific cause of the error is unknown. Prisma Error Code: ${errorCode}. Try logging the error output to further triage the possible cause.`;
  }
}

export function generateErrorResponse<Error>(
  error: Error,
  customErrorMessage?: string
) {
  if (customErrorMessage) {
    return customErrorMessage;
  } else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code
  ) {
    return handlePrismaError(error.code, error.meta?.target);
  } else {
    console.log(error);
    return "There was an unknown error. If the issue persists, please contact kujira.help@outlook.com";
  }
}
