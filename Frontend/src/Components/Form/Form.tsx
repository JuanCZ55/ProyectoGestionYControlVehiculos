import type { ReactNode } from "react";
import { onSubmit } from "../Functions/FormFunctions";

interface FormProps {
  children?: ReactNode;
  name: string;
  method: string;
  action: string;
  target?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  validateForm: () => boolean;
}

export default function Form({
  children,
  name,
  method,
  action,
  target,
  onSuccess,
  onError,
  validateForm,
}: FormProps) {
  return (
    <form
      name={name}
      method={method}
      action={action}
      target={target}
      onSubmit={onSubmit(onSuccess!, onError!, validateForm, action, method)}>
      {children}
    </form>
  );
}
