import './style.css';
import { Fragment } from 'react';
import { Avatar } from '../Avatar';
import type { AvatarProps } from '../Avatar';
import { isNumber } from 'q-js-utils/isNumber';
import { cn } from 'q-js-utils/cn';

export type AvatarItemProps = AvatarProps & {
  /**
   * Optional ID for keying, useful if src/alt are not unique
   */
  id?: string | number, 
  /**
   * Render prop for customizing an individual avatar element within the group.
   * Takes precedence over AvatarGroup's `renderItems` if both are provided.
   * Receives the default Avatar element, the current item, and its index.
   */
  render?: (avatarElement: React.ReactElement, item: AvatarItemProps, index: number) => React.ReactNode,
}

export type AvatarGroupProps = {
  items: AvatarItemProps[],
  className?: string,
  size?: number | string,
  max?: number,
  /**
   * Render prop for customizing each displayed avatar element within the group.
   * Receives the default Avatar element, the current item, and its index.
   */
  renderItems?: (avatarElement: React.ReactElement, item: AvatarItemProps, index: number) => React.ReactNode,

  /**
   * Render prop for customizing the 'remaining' avatars element.
   * Receives the default props for the remaining element, the count of remaining avatars, 
   * and the array of remaining avatar items.
   */
  renderRemaining?: (
    remaningProps: React.HTMLAttributes<HTMLElement>, 
    count: number,
    remainingItems: AvatarItemProps[]
  ) => React.ReactNode,

  /** ...etc will be captured by React.HTMLAttributes<HTMLDivElement> */
} & React.HTMLAttributes<HTMLElement>;

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  items,
  className,
  renderItems,
  renderRemaining,
  size = 33,
  max = 5,
  ...etc
}) => {
  const displayedAvatars = items.slice(0, max);
  /** @DevOptions : For the possibility of many items */
  // const displayedAvatars = useMemo(() => items.slice(0, max), [items, max]);
  
  const fixSize = isNumber(size) ? size + 'px' : size;

  const renderWrapRemaining = () => {
    const remaining = items.length - max;
    if(remaining){
      const remaningProps: React.HTMLAttributes<HTMLElement> = {
        className: "ava ava-rest",
        style: {
          width: fixSize,
          height: fixSize,
          fontSize: `calc(${fixSize} / 2.25)`,
        }
      };

      return renderRemaining ? renderRemaining(remaningProps, remaining, items.slice(max)) : <div {...remaningProps}>+{remaining}</div>;
    }

    /**
     * @DevOptions
     * Explicitly:
     * return null;
     */
  }

  const renderAvatarItem = (item: AvatarItemProps, index: number) => {
    const { size: avatarSize, render, ...restProps } = item;
    const avatarElement = <Avatar {...restProps} size={fixSize || avatarSize} />;

    return (
      <Fragment key={restProps.id ?? index}>
        {/* Prioritize group-level renderItems, then individual item's render, then default Avatar */}
        {renderItems
          ? renderItems(avatarElement, item, index)
          : render
            ? render(avatarElement, item, index)
            : avatarElement}
      </Fragment>
    );
  }

  return (
    <div 
      {...etc}
      role="group"
      className={cn('avatar-group', className)}
      style={{
        ...etc?.style,
        '--ml': `calc(-${fixSize} / 2.75)`
      }}
    >
      {displayedAvatars.map(renderAvatarItem)}
      {renderWrapRemaining()}
    </div>
  );
}
