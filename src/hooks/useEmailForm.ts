import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { getLocale } from "@/paraglide/runtime";

import { sendCvAction } from "../actions/send-cv.action";
import type { EmailFormData } from "../schemas/emailSchema";
import { emailSchema } from "../schemas/emailSchema";

export type { EmailFormData };

/** raison d'échec renvoyée par l'action, pour afficher un message adapté */
export type SendCvFailureReason =
  | "rate_limited"
  | "send_failed"
  | "unavailable"
  | null;

export interface SendCvOutcome {
  sent: boolean;
  reason: SendCvFailureReason;
}

const useEmailForm = () => {
  const form = useForm<EmailFormData>({
    defaultValues: {
      firstName: "",
      recipientEmail: "",
    },
    resolver: zodResolver(emailSchema),
  });

  const sendEmail = useCallback(
    async (data: EmailFormData): Promise<SendCvOutcome> => {
      try {
        const result = await sendCvAction({
          ...data,
          locale: getLocale() === "en" ? "en" : "fr",
        });

        if (!result?.data?.sent) {
          return {
            reason: result?.data?.reason ?? null,
            sent: false,
          };
        }

        form.reset();
        return { reason: null, sent: true };
      } catch {
        return { reason: null, sent: false };
      }
    },
    [form]
  );

  return {
    form,
    isLoading: form.formState.isSubmitting,
    sendEmail,
  };
};

export default useEmailForm;
