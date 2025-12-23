'use client';

import type { Label as LabelPrimitive } from 'radix-ui';
import { Slot as SlotPrimitive } from 'radix-ui';
import React, {
	type ComponentProps,
	createContext,
	useContext,
	useId,
} from 'react';
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	FormProvider,
	useFormContext,
	useFormState,
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from './Label';

const Slot = SlotPrimitive.Slot;

const Form = FormProvider;

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue>(
	{} as FormFieldContextValue
);

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => (
	<FormFieldContext.Provider value={{ name: props.name }}>
		<Controller {...props} />
	</FormFieldContext.Provider>
);

const useFormField = () => {
	const fieldContext = useContext(FormFieldContext);
	const itemContext = useContext(FormItemContext);
	const { getFieldState } = useFormContext();
	const formState = useFormState({ name: fieldContext.name });
	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error('useFormField should be used within <FormField>');
	}

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	};
};

type FormItemContextValue = {
	id: string;
};

const FormItemContext = createContext<FormItemContextValue>(
	{} as FormItemContextValue
);

const FormItem = ({
	className,
	...props
}: ComponentProps<'div'>): React.JSX.Element => {
	const id = useId();

	return (
		<FormItemContext.Provider value={{ id }}>
			<div
				className={cn('grid gap-2', className)}
				data-slot="form-item"
				{...props}
			/>
		</FormItemContext.Provider>
	);
};

const FormLabel = ({
	className,
	...props
}: ComponentProps<typeof LabelPrimitive.Root>): React.JSX.Element => {
	const { error, formItemId } = useFormField();

	return (
		<Label
			className={cn(
				'font-medium text-xs data-[error=true]:text-destructive',
				className
			)}
			data-error={!!error}
			data-slot="form-label"
			htmlFor={formItemId}
			{...props}
		/>
	);
};

const FormControl = ({
	...props
}: ComponentProps<typeof Slot>): React.JSX.Element => {
	const { error, formItemId, formDescriptionId, formMessageId } =
		useFormField();

	return (
		<Slot
			aria-describedby={
				error ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`
			}
			aria-invalid={!!error}
			data-slot="form-control"
			id={formItemId}
			{...props}
		/>
	);
};

const FormDescription = ({
	className,
	...props
}: ComponentProps<'p'>): React.JSX.Element => {
	const { formDescriptionId } = useFormField();

	return (
		<p
			className={cn('text-muted-foreground text-sm', className)}
			data-slot="form-description"
			id={formDescriptionId}
			{...props}
		/>
	);
};

const FormMessage = ({
	className,
	...props
}: ComponentProps<'p'>): React.JSX.Element | null => {
	const { error, formMessageId } = useFormField();
	const body = error ? String(error?.message ?? '') : props.children;

	if (!body) {
		return null;
	}

	return (
		<p
			className={cn('font-light text-destructive text-xs', className)}
			data-slot="form-message"
			id={formMessageId}
			{...props}
		>
			{body}
		</p>
	);
};

export {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
};
