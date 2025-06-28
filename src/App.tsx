// import { useState } from 'react';
import { Avatar } from "@/components/Avatar";
import { AvatarGroup } from "@/components/AvatarGroup";
// import { AdaptiveItems } from '@/components/AdaptiveItems';

const users = [
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

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div 
      className="p-4" //  bg-gray-900
    >
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

      <h2>AvatarGroup</h2>
      <AvatarGroup
        // style={{
        //   '--ava-border': '#111827'
        // }}
        // className="dark" // -space-x-4
        size={57}
        items={users.map((item: any) => ({ ...item, className: "rounded-full" }))}
        // renderRemaining={(El, remaining) => <div title={`Remaining (${remaining})`}>{El}</div>}
        renderRemaining={(remaningProps, remaining) => (
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
            //   marginLeft: '5px'
            // }}
            {...remaningProps}
            // className={remaningProps.className + " bg-red-400"}
            className={"bg-red-400 " + remaningProps.className + " text-red-100"}
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
