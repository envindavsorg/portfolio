import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";

// Seuls les messages levés via ActionError sont renvoyés au client,
// le reste est masqué pour ne pas fuiter de détails serveur.
export class ActionError extends Error {
  override name = "ActionError";
}

export const actionClient = createSafeActionClient({
  handleServerError: (error) =>
    error instanceof ActionError
      ? error.message
      : DEFAULT_SERVER_ERROR_MESSAGE,
});
