"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/primitives/Button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/Dialog";
import {
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/primitives/Drawer";
import { PanelFooter } from "@/components/primitives/Panel";
import GLOBAL_DATA from "@/data/global";
import type { EmailFormData } from "@/hooks/useEmailForm";
import useEmailForm from "@/hooks/useEmailForm";
import useMediaQuery from "@/hooks/useMediaQuery";

import { CvError } from "./CvError";
import { CvForm } from "./CvForm";
import { CvModal } from "./CvModal";
import { CvSuccess } from "./CvSuccess";

export const CvFooter = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<
    "form" | "success" | "error"
  >("form");

  const { form, isLoading, sendEmail } = useEmailForm();
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) {
      resetTimeoutRef.current = setTimeout(() => {
        setFormState("form");
        form.reset();
      }, 600);
    }

    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [open, form]);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleSubmit = useCallback(
    async (data: EmailFormData) => {
      const success = await sendEmail(data);
      setFormState(success ? "success" : "error");
    },
    [sendEmail, isDesktop]
  );

  const renderContent = () => {
    if (formState === "success" || formState === "error") {
      const isSuccess = formState === "success";
      const FeedbackComponent = isSuccess ? CvSuccess : CvError;
      const title = isSuccess
        ? "le mail est en route !"
        : "une erreur est survenue !";
      const buttonText = isSuccess ? "d'accord !" : "je comprends !";
      const HeaderComp = isDesktop ? DialogTitle : DrawerTitle;

      return (
        <>
          <VisuallyHidden asChild>
            <HeaderComp>{title}</HeaderComp>
          </VisuallyHidden>

          <FeedbackComponent dateCreated={new Date().toISOString()}>
            <Button className="mt-4" onClick={handleClose}>
              {buttonText}
            </Button>
          </FeedbackComponent>
        </>
      );
    }

    const Header = isDesktop ? DialogHeader : DrawerHeader;
    const Title = isDesktop ? DialogTitle : DrawerTitle;
    const Description = isDesktop
      ? DialogDescription
      : DrawerDescription;

    return (
      <div className="p-5">
        <Header className="mb-6">
          <Title className="font-semibold text-lg text-theme leading-normal sm:text-xl">
            recevez maintenant mon CV !
          </Title>
          <Description className="text-foreground text-sm leading-normal">
            entrez votre prénom et votre adresse e-mail pour recevoir
            immédiatement mon CV.
          </Description>
        </Header>

        <CvForm
          form={form}
          isLoading={isLoading}
          onCancel={handleClose}
          onSubmit={handleSubmit}
        />
      </div>
    );
  };

  return (
    <PanelFooter className="flex max-sm:flex-col max-sm:gap-y-2">
      <Button asChild variant="outline">
        <Link
          aria-label={GLOBAL_DATA.CV.name}
          href={GLOBAL_DATA.CV.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          voir et télécharger
        </Link>
      </Button>

      <CvModal isDesktop={isDesktop} open={open} setOpen={setOpen}>
        {renderContent()}
      </CvModal>
    </PanelFooter>
  );
};
