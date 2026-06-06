import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { sendCvAction } from "../actions/send-cv.action";
import { emailSchema } from "../schemas/emailSchema";
import type { EmailFormData } from "../schemas/emailSchema";

export type { EmailFormData };

const useEmailForm = () => {
  const form = useForm<EmailFormData>({
    defaultValues: {
      firstName: "",
      recipientEmail: "",
    },
    resolver: zodResolver(emailSchema),
  });

  const sendEmail = useCallback(
    async (data: EmailFormData) => {
      try {
        const result = await sendCvAction(data);

        if (!result?.data?.sent) {
          return false;
        }

        form.reset();
        return true;
      } catch {
        return false;
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
