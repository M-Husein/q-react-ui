// import { useState } from 'react';
import { Avatar } from "@/components/Avatar";
import { AvatarGroup } from "@/components/AvatarGroup";
// import { AdaptiveItems } from '@/components/AdaptiveItems';
import { useNetwork } from '@/hooks/useNetwork';
import { cn } from "q-js-utils/cn";

const users = [
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

function App() {
  // const [count, setCount] = useState(0);

  const isOnline = useNetwork({
    onOnline: () => alert('ONLINE'),
    onOffline: () => alert('OFFLINE'),
  });

  return (
    <div className="p-4">
      <div className="space-x-4">
        <h4 className={cn("text-2xl font-bold", isOnline ? "text-blue-600" : "text-red-600")}>
          {isOnline ? "Online" : "Offline"}
        </h4>

        <hr className="my-4" />

        <Avatar 
          size={55}
          alt="Muhamad Husein" 
          src="https://avatars.githubusercontent.com/u/19644272?v=4"
          // draggable
        />

        <Avatar 
          size={55}
          // alt="?" 
        />

        <Avatar 
          alt="Steve Roger" 
          size={55}
          loading={undefined}
        />
      </div>

      <h2>AvatarGroup</h2>
      <AvatarGroup
        // style={{
        //   '--ava-border': '#111827'
        // }}
        // className="dark" // -space-x-4
        size={57}
        items={users.map((item: any) => ({ ...item, className: "rounded-full" }))}
        // renderRemaining={(El, remaining) => <div title={`Remaining (${remaining})`}>{El}</div>}
        renderRemaining={(remaningProps, remaining, remainingItems) => (
          <div 
            // style={{
            //   backgroundColor: 'purple',
            //   color: 'white',
            //   borderRadius: '50%',
            //   // width: '33px',
            //   // height: '33px',
            //   display: 'flex',
            //   alignItems: 'center',
            //   justifyContent: 'center',
            //   fontSize: '14px',
            // }}
            {...remaningProps}
            // className={remaningProps.className + " bg-red-400"}
            className={"bg-red-400 " + remaningProps.className + " text-red-100"}
            title={remainingItems.map(item => item.alt).join('\n')}
          >
            +{remaining}
          </div>
        )}
      />

      <hr />

      <AvatarGroup
        // size={57}
        items={users.map((item: any) => ({ ...item, className: "rounded-full" }))}
      />

      {/* <AdaptiveItems
        // 
      /> */}
    </div>
  )
}

export default App
