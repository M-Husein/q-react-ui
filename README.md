# q-react-ui

A clean, minimal, tree-shakable React UI components & hooks.

## Installation

⚠ You must install [`q-js-utils`](https://github.com/M-Husein/q-js-utils), unless you already have it installed.

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

const App = () => {
  const users: AvatarItemProps = [
    {
      alt: "Muhamad Husein",
    },
    {
      alt: "Tony Start"
    },
    {
      alt: "Peter Parker"
    },
    {
      alt: "Clark Kent"
    },
    {
      alt: "Diana Prince"
    },
    {
      alt: "Bruce Wayne"
    },
    {
      alt: "John Doe"
    }
  ];

  return (
    <>
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
        renderRemaining={(remaningProps, remaining, remainingItems) => (
          <div 
            {...remaningProps}
            className={"bg-red-400 " + remaningProps.className + " text-red-100"}
            title={remainingItems.map(item => item.alt).join('\n')}
          >
            +{remaining}
          </div>
        )}
      />

      <hr />

      <AvatarGroup
        items={users.map((item: any) => ({ ...item, className: "rounded-full" }))}
      />
    </>
  );
}
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

---

## Hooks

A React Hook to detect and monitor the browser's online/offline network status.
It provides the current network status as a boolean and allows optional callbacks for when the network status changes.

### useNetwork
```ts
import { useNetwork } from 'q-react-ui/useNetwork';
import { cn } from 'q-js-utils/cn';

const App = () => {
  const isOnline = useNetwork({
    onOnline: () => alert('ONLINE'),
    onOffline: () => alert('OFFLINE'),
  });

  return (
    <div>
      <h4 
        className={
          cn(
            "text-2xl font-bold", 
            isOnline ? "text-blue-600" : "text-red-600"
          )
        }
      >
          {isOnline ? "Online" : "Offline"}
        </h4>
    </div>
  );
}
```
