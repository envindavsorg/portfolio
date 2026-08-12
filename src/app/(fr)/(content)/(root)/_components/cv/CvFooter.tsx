"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { PanelFooter } from "@/components/base/Panel";
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
import GLOBAL_DATA from "@/data/global";
import type {
  EmailFormData,
  SendCvFailureReason,
} from "@/hooks/useEmailForm";
import useEmailForm from "@/hooks/useEmailForm";
import useMediaQuery from "@/hooks/useMediaQuery";
import { m } from "@/paraglide/messages";

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
  const [failureReason, setFailureReason] =
    useState<SendCvFailureReason>(null);

  const { form, isLoading, sendEmail } = useEmailForm();
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) {
      resetTimeoutRef.current = setTimeout(() => {
        setFormState("form");
        setFailureReason(null);
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
      const { sent, reason } = await sendEmail(data);
      setFailureReason(reason);
      setFormState(sent ? "success" : "error");
    },
    [sendEmail]
  );

  const renderContent = () => {
    if (formState === "success" || formState === "error") {
      const isSuccess = formState === "success";
      const title = isSuccess
        ? m.home_cv_success_title()
        : m.home_cv_error_title();
      const buttonText = isSuccess
        ? m.home_cv_success_button()
        : m.home_cv_error_button();
      const HeaderComp = isDesktop ? DialogTitle : DrawerTitle;
      const action = (
        <Button className="mt-4" onClick={handleClose}>
          {buttonText}
        </Button>
      );

      return (
        <>
          <HeaderComp className="sr-only">{title}</HeaderComp>

          {isSuccess ? (
            <CvSuccess dateCreated={new Date().toISOString()}>
              {action}
            </CvSuccess>
          ) : (
            <CvError
              dateCreated={new Date().toISOString()}
              reason={failureReason}
            >
              {action}
            </CvError>
          )}
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
            {m.home_cv_form_title()}
          </Title>
          <Description className="text-foreground text-sm leading-normal">
            {m.home_cv_form_description()}
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
          {m.home_cv_view_button()}
        </Link>
      </Button>

      <CvModal isDesktop={isDesktop} open={open} setOpen={setOpen}>
        {renderContent()}
      </CvModal>
    </PanelFooter>
  );
};
