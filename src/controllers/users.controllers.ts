import { HttpStatusCodes } from "@/utils/http-status-codes";
import { Request, Response } from "express";

// ========================================================================================= //
// [ GET USERS ] =========================================================================== //
// ========================================================================================= //

export async function getUsers(request: Request, response: Response) {
  try {
    return response
      .status(HttpStatusCodes.OK)
      .json({ response: "Fetched Users!" });
  } catch (error) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "There was an error fetching users. Please refresh the page.",
      caption: "If the problem persists, please email kujira.help@outlook.com",
    });
  }
}
