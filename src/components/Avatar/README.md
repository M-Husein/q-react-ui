# Avatar

## Options

### With `bg` props
```ts
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
      bg, // to define background-color
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

    let fixSize = isNumber(size) ? size + 'px' : size;

    const parseView = () => {
      let trimmed = alt?.trim();
      let color = bg ? bg.replace('#', '') : trimmed ? str2Hex(trimmed) : '5a6268';

      setInitial(
        trimmed ? getInitials(trimmed)?.toUpperCase() : '?'
      );

      setErrorClass(
        `ava-${trimmed ? (darkOrLight(color as string) === 'dark' ? 'light' : 'dark') : 'light'}`
      );
      
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
```
