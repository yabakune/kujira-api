import { Prisma } from "@prisma/client";

type DataResponse<Response> = {
  response: Response;
  success?: string;
};

export function generateDataResponse<Response>(
  response: Response,
  success?: string
): DataResponse<Response> {
  return { response, success };
}

export type TextResponse = {
  title?: string;
  body: string;
  caption?: string;
};

export function generateTextResponse(textResponse: TextResponse): TextResponse {
  return textResponse;
}

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

type ErrorResponse = {
  error: string;
  caption: string;
};

export function generateErrorResponse<Error>(
  error: Error,
  customErrorMessage?: string
): ErrorResponse {
  let errorMessage = "There was an unknown error.";

  if (customErrorMessage) {
    errorMessage = customErrorMessage;
  } else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code
  ) {
    errorMessage = handlePrismaError(error.code, error.meta?.target);
  } else {
    console.log("\n\n generateErrorResponse() Fallback:", error);
  }

  return {
    error: errorMessage,
    caption: "If the issue persists, please contact kujira.help@outlook.com.",
  };
}
