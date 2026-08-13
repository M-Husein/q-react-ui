import { cn } from 'q-js-utils/cn';

type AriaCurrent = boolean | "page" | "step" | "location" | "date" | "time" | "true" | "false";

export interface AProps extends React.ComponentPropsWithRef<'a'> {
  As?: React.ElementType,
  disabled?: boolean,
  active?: AriaCurrent,
}

/**
 * Link component with enhanced features.
 * - Adds disabled state (prevents clicks, adds .disabled class, sets inert)
 * - Adds active state (sets aria-current="page")
 * - Handles inert gracefully with fallback tabIndex
 * 
 * @prop disabled – disables the link (adds CSS class, prevents clicks, sets inert if supported)
 * @prop active – marks as active (sets aria-current, adds active class if you add one)
 * @props other link props/attribute.
 */
export const A = ({
  As = "a",
  "aria-current": ariaCurrent,
  active,
  className,
  disabled,
  draggable,
  href,
  inert,
  tabIndex,
  onClick,
  ...etc
}: AProps) => {
  const handleClick = (evt: React.MouseEvent<HTMLAnchorElement>) => {
    if(disabled || inert){
      evt.preventDefault();
      return;
    }
    onClick?.(evt);
  };

  return (
    <As
      {...etc}
      href={disabled ? void 0 : href} // Remove href when disabled
      aria-current={ariaCurrent ?? active}
      aria-disabled={disabled}
      className={
        cn(className, disabled && "disabled")
      }
      disabled={disabled}
      draggable={disabled ? false : draggable}
      tabIndex={disabled ? -1 : tabIndex}
      inert={inert ?? disabled}
      onClick={handleClick}
    />
  );
};

// A.displayName = "A";
