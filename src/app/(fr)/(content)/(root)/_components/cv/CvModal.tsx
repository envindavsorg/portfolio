import type React from "react";

import { Button } from "@/components/primitives/Button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/primitives/Dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/primitives/Drawer";
import { m } from "@/paraglide/messages";

interface CvModalProps {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  isDesktop: boolean;
}

export const CvModal = ({
  children,
  open,
  setOpen,
  isDesktop,
}: CvModalProps) => {
  if (isDesktop) {
    return (
      <Dialog
        dismissOnOutsideClick={false}
        onOpenChange={setOpen}
        open={open}
      >
        <DialogTrigger asChild>
          <Button>{m.home_cv_modal_trigger_button()}</Button>
        </DialogTrigger>
        <DialogContent
          aria-describedby="cv-modal-description"
          className="bg-background p-0"
        >
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button>{m.home_cv_modal_trigger_button()}</Button>
      </DrawerTrigger>
      <DrawerContent
        aria-describedby="cv-modal-description"
        className="bg-background p-0"
        onInteractOutside={(event) => event.preventDefault()}
      >
        {children}
      </DrawerContent>
    </Drawer>
  );
};
