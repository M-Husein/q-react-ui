import './style.css';
import { useState, useEffect, forwardRef } from 'react';
import { getInitials } from 'q-js-utils/getInitials';
import { str2Hex } from 'q-js-utils/str2Hex';
import { darkOrLight } from 'q-js-utils/darkOrLight';
import { isNumber } from 'q-js-utils/isNumber';
import { cn } from 'q-js-utils/cn';

type ImageEvent = React.SyntheticEvent<HTMLImageElement, Event>;

export type AvatarProps = {
  src?: string | any,
  alt?: string,
  size?: number | string,
  draggable?: boolean,
  className?: string,
  bg?: string,
  onError?: (e: ImageEvent) => void,
  onLoad?: (e: ImageEvent) => void,
} & React.ImgHTMLAttributes<HTMLImageElement>;

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  (
    {
      src,
      alt,
      size = 33,
      draggable = false,
      className,
      bg, // For define background-color
      onError,
      onLoad,
      ...etc
    },
    ref
  ) => {
    const [load, setLoad] = useState<boolean>(true);
    const [errorStyle, setErrorStyle] = useState<React.CSSProperties>({});
    const [initial, setInitial] = useState<string | undefined>();
    const [errorClass, setErrorClass] = useState<string>('');

    const fixSize = isNumber(size) ? size + 'px' : size;

    const parseView = () => {
      const color: any = bg ? bg.replace('#', '') : alt ? str2Hex(alt) : '5a6268';

      setInitial(alt ? getInitials(alt) : '?');

      setErrorClass(`ava-${darkOrLight(color) === 'dark' ? 'light' : 'dark'}`);
      
      setErrorStyle({
        '--fs': `calc(${fixSize} / 2.25)`,
        '--bg': '#' + color
      });
    }

    useEffect(() => {
      if(!src){
        parseView();
        setLoad(false);
      }
    }, [src, size, alt, bg]);

    const Load = (e: ImageEvent) => {
      setLoad(false);
      setInitial(undefined);
      setErrorClass('');
      setErrorStyle({});
      onLoad?.(e);
    }

    const Err = (e: ImageEvent) => {
      if(!initial){
        parseView();
      }
      
      setLoad(false);
      onError?.(e);
    }

    return (
      <img
        loading="lazy"
        decoding="async"
        {...etc} // Override props above
        ref={ref}
        width={fixSize}
        height={fixSize}
        alt={alt || '?'}
        src={src}
        aria-label={initial}
        draggable={draggable ? undefined : false}
        style={{
          ...errorStyle, 
          ...etc?.style,
        }}
        className={
          cn(
            'ava',
            load && 'ava-loader',
            errorClass,
            className
          )
        }
        onError={Err}
        onLoad={Load}
      />
    );
  }
);
