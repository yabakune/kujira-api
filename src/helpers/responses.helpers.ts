import * as Constants from "@/constants";

type Foo<Response> = {
  title?: string;
  body?: string;
  caption?: string;
  response?: Response;
};

export function generateResponse<Response>(
  response: Foo<Response>,
  isError: boolean = false
): Foo<Response> {
  if (isError) {
    return { ...response, caption: Constants.Errors.CONTACT_EMAIL };
  } else {
    return response;
  }
}
