import * as Constants from "@/constants";

type Message<Response> = {
  title?: string;
  body?: string;
  caption?: string;
  response?: Response;
};

export function generateResponse<Response>(
  response: Message<Response>
): Message<Response> {
  return response;
}

export function generateErrorResponse<Response>(
  response: Message<Response>
): Message<Response> {
  return { ...response, caption: Constants.Errors.CONTACT_EMAIL };
}
