// import type { ElementType, ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cn  } from "q-js-utils/cn";

export type ButtonProps = {
  As?: React.ElementType, // React.ReactNode | T
  disabled?: boolean,
  type?: "button" | "submit" | "reset",
  value?: string,
  href?: string,
  size?: string,
  kind?: string,
  outline?: boolean,
  prefixCn?: string,
  onClick?: (e: React.MouseEvent<HTMLElement>) => void,
} & React.HTMLAttributes<HTMLElement>;

const buttonText = "button";

export const Button = forwardRef<HTMLElement, ButtonProps>(
  (
    { 
      As = buttonText, 
      type = buttonText, 
      prefixCn = "btn",
      kind = "primary", // main
      size,
      outline,
      value,
      role, 
      disabled, 
      tabIndex,
      href,
      className,
      onClick, 
      ...etc
    },
    ref
  ) => {
    const asButton = As === buttonText || As === "input";

    const finalTabIndex = () => {
      let asLink = As === "a";
      if(asLink && disabled){
        return -1;
      }
      if(!asButton && !asLink && !disabled){
        return 0;
      }
      return tabIndex;
    }

    // const finalType: any = asButton || As?.displayName === "input" ? type : void 0;

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      // Strict disabled
      if(disabled){
        e.preventDefault();
        return;
      }
      onClick?.(e);
    }

    return (
      <As
        {...etc}
        ref={ref}
        className={
          cn(
            prefixCn, 
            size && prefixCn + "-" + size,
            kind && `${prefixCn}${outline ? '-outline' : ''}-${kind}`,
            !asButton && disabled && "disabled",
            className
          )
        }
        // Only add type if it's a <button> or <input>
        type={asButton ? type : void 0}
        role={asButton ? void 0 : role ?? buttonText}
        disabled={asButton ? disabled : void 0}
        aria-disabled={asButton ? void 0 : disabled}
        tabIndex={finalTabIndex()}
        href={asButton || disabled ? void 0 : href}
        // href={href}
        value={value}
        onClick={handleClick}
      />
    );
  }
);

Button.displayName = "Button";
