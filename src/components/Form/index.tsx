import { forwardRef } from 'react';

export type FormProps = {
  disabled?: boolean,
  fieldsetProps?: React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
} & React.FormHTMLAttributes<HTMLFormElement>;

/**
 * A reusable Form component that wraps its children inside a `<fieldset>` element.
 * 
 * This component is designed to simplify form handling by automatically applying
 * the `disabled` state to the entire fieldset, and allowing additional customization
 * via standard HTML form and fieldset attributes.
 * 
 * @param {FormProps} props - Props for the Form component.
 * @param {boolean} [props.disabled] - If true, disables all form controls within the fieldset.
 * @param {React.FieldsetHTMLAttributes<HTMLFieldSetElement>} [props.fielsetProps] - Additional props for the `<fieldset>` element.
 * @param {React.ReactNode} props.children - Form content to be rendered inside the fieldset.
 * @param {React.FormHTMLAttributes<HTMLFormElement>} [props.rest] - Additional props spread onto the `<form>` element.
 * 
 * @returns {JSX.Element} A form element with a nested fieldset.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>((
  {
    disabled,
    fieldsetProps,
    children,
    ...etc
  },
  ref
) => {
  return (
    <form
      {...etc}
      ref={ref}
    >
      <fieldset
        {...fieldsetProps}
        disabled={disabled}
      >
        {children}
      </fieldset>
    </form>
  );
});
