type Foo<Response> = {
  title?: string;
  body?: string;
  caption?: string;
  response?: Response;
};

export function generateResponse<Response>(response: Foo<Response>): Foo<Response> {
  return response;
}
