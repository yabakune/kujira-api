export function generateUpdateError(model: string): string {
  return `Failed to update ${model}. The ${model} either doesn't exist or you didn't provide the correct details. Please refresh the page and try again.`;
}

export enum Errors {
  AUTH_SECRET_KEY_DOES_NOT_EXIST = "AUTH_SECRET_KEY environment variable does not exist.",
  VERIFICATION_CODE_SECRET_KEY_DOES_NOT_EXIST = "VERIFICATION_CODE_SECRET_KEY environment variable does not exist.",
  CONTACT_EMAIL = "If the issue persists, please contact kujira.help@outlook.com.",

  ACCOUNT_ALREADY_EXISTS = "Account already exists.",
  ACCOUNT_DOES_NOT_EXIST = "Account does not exist.",

  OVERVIEW_DOES_NOT_EXIST = "Overview does not exist.",

  LOGBOOK_DOES_NOT_EXIST = "Logbook does not exist.",

  ENTRY_DOES_NOT_EXIST = "Entry does not exist.",

  PURCHASE_DOES_NOT_EXIST = "Purchase does not exist.",

  CREATE_ERROR = "Please make sure that you've properly filled in all required fields and try again.",
}
