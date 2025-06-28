# q-react-ui

A clean, minimal, tree-shakable, type-safe React UI components.

## Install

```bash
npm install q-react-ui
```

## Usage

```tsx
import { Avatar, AvatarGroup, AvatarItemProps } from 'q-react-ui';

const users: AvatarItemProps = [
  {
    alt: "Tony Start",
  },
  {
    alt: "Peter Parker"
  },
  {
    alt: "Elizabeth Olsen"
  },
  {
    alt: "Clark Kent"
  },
  {
    alt: "Diana Prince"
  },
  {
    alt: "Angelina Jolie"
  },
  {
    alt: "Brad Pitt"
  }
];

<Avatar 
  alt="Muhamad Husein"
  src="https://avatars.githubusercontent.com/u/19644272?v=4"
/>

<Avatar 
  size={55}
/>

<Avatar 
  alt="Steve Roger" 
  size={55}
/>

<h2>AvatarGroup</h2>
<AvatarGroup
  size={57}
  items={users.map((item: any) => ({ ...item, className: "rounded-full" }))}
  renderRemaining={(remaningProps, remaining) => (
    <div 
      {...remaningProps}
      className={"bg-red-400 " + remaningProps.className + " text-red-100"}
    >
      +{remaining}
    </div>
  )}
/>

<hr />

<AvatarGroup
  items={users.map((item: any) => ({ ...item, className: "rounded-full" }))}
/>
```

Or single import for tree-shaking

```tsx
import { Avatar } from 'q-react-ui/Avatar';
import { AvatarGroup } from 'q-react-ui/AvatarGroup';
```
