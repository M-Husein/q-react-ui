import { useImperativeHandle, forwardRef } from 'react';
import { createPortal } from "react-dom";
import { useNewWindow, UseNewWindowProps } from "@/hooks/useNewWindow";

export interface NewWindowHandle {
  close: () => void;
  open: () => void;
}

export interface NewWindowProps extends UseNewWindowProps {
  children?: React.ReactNode;
}

export const NewWindow = forwardRef<NewWindowHandle, React.PropsWithChildren<UseNewWindowProps>>(
  ({ children, ...props }, ref) => {
    const { open, close, isOpen, windowRef } = useNewWindow(props);

    useImperativeHandle(ref, () => ({ close, open }), [close, open]);

    if (!isOpen || !windowRef.current) return null;

    return createPortal(children, windowRef.current.document.body);
  }
);
