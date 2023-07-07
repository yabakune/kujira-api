import * as Constants from "@/constants";

type Foo<Response> = {
  title?: string;
  body?: string;
  caption?: string;
  response?: Response;
};

export function generateResponse<Response>(
  response: Foo<Response>
): Foo<Response> {
  return response;
}

export function generateErrorResponse<Response>(
  response: Foo<Response>
): Foo<Response> {
  return { ...response, caption: Constants.Errors.CONTACT_EMAIL };
}
