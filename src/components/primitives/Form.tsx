"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, ReactElement } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";

import { cn } from "@/lib/utils";

import { Label } from "../base/Label";

export const Form = FormProvider;

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
}

const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

interface FormItemContextValue {
  id: string;
  /** vrai quand une <FormDescription> est réellement rendue dans cet item */
  hasDescription: boolean;
  registerDescription: () => void;
}

const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

export const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id, hasDescription, registerDescription } = itemContext;

  return {
    formDescriptionId: `${id}-form-item-description`,
    formItemId: `${id}-form-item`,
    formMessageId: `${id}-form-item-message`,
    hasDescription,
    id,
    name: fieldContext.name,
    registerDescription,
    ...fieldState,
  };
};

export const FormItem = ({
  className,
  ...props
}: ComponentProps<"div">) => {
  const id = useId();
  const [hasDescription, setHasDescription] = useState(false);

  const registerDescription = useCallback(
    () => setHasDescription(true),
    []
  );

  const value = useMemo(
    () => ({ hasDescription, id, registerDescription }),
    [hasDescription, id, registerDescription]
  );

  return (
    <FormItemContext.Provider value={value}>
      <div
        className={cn("grid gap-2", className)}
        data-slot="form-item"
        {...props}
      />
    </FormItemContext.Provider>
  );
};

export const FormLabel = ({
  className,
  ...props
}: ComponentProps<typeof Label>) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn(
        "font-medium text-xs data-[error=true]:text-destructive",
        className
      )}
      data-error={!!error}
      data-slot="form-label"
      htmlFor={formItemId}
      {...props}
    />
  );
};

export const FormControl = ({
  children,
  ...props
}: ComponentProps<"div"> & { children: ReactElement }) => {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId,
    hasDescription,
  } = useFormField();

  return useRender({
    props: {
      /**
       * `formDescriptionId` n'est référencé que si une <FormDescription> est
       * réellement rendue. Les deux champs du formulaire de CV pointaient vers un
       * id inexistant : axe classe un IDREF manquant en `incomplete`, et le scan
       * ne lit que `violations` — le défaut était donc invisible par
       * construction, en plus d'être inutile pour un lecteur d'écran.
       */
      "aria-describedby":
        [
          hasDescription ? formDescriptionId : null,
          error ? formMessageId : null,
        ]
          .filter(Boolean)
          .join(" ") || undefined,
      "aria-invalid": !!error,
      "data-slot": "form-control",
      id: formItemId,
      ...props,
    },
    render: children,
  });
};

export const FormDescription = ({
  className,
  ...props
}: ComponentProps<"p">) => {
  const { formDescriptionId, registerDescription } = useFormField();

  // la description s'annonce elle-même : sans cela, FormControl référence un id
  // qui n'existe pas dès qu'aucune description n'est rendue
  useEffect(() => {
    registerDescription();
  }, [registerDescription]);

  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="form-description"
      id={formDescriptionId}
      {...props}
    />
  );
};

export const FormMessage = ({
  className,
  ...props
}: ComponentProps<"p">) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    /**
     * `role="alert"` et `aria-live` : les huit outils /utils annoncent déjà leurs
     * messages, mais le SEUL formulaire qui envoie réellement quelque chose — la
     * demande de CV — ne disait rien. Une erreur de saisie apparaissait à l'écran
     * sans aucun retour pour qui n'y a pas les yeux.
     */
    <p
      aria-live="polite"
      className={cn("font-light text-destructive text-xs", className)}
      data-slot="form-message"
      id={formMessageId}
      role="alert"
      {...props}
    >
      {body}
    </p>
  );
};
