# q-react-ui

A clean, minimal, tree-shakable, type-safe React UI components.

## Installation

You must install q-js-utils, unless you already have it installed.

```bash
npm install q-react-ui q-js-utils
```

**Or**

```bash
yarn add q-react-ui q-js-utils
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

Or single import for tree-shaking.

```tsx
import { Avatar } from 'q-react-ui/Avatar';
import { AvatarGroup } from 'q-react-ui/AvatarGroup';
```

About Tree-Shaking:
- [Tree Shaking - webpack](https://webpack.js.org/guides/tree-shaking)
- [Tree shaking - Glossary - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)
- [Tree-Shaking: A Reference Guide](https://www.smashingmagazine.com/2021/05/tree-shaking-reference-guide/)
