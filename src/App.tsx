import { useState, useRef } from 'react';
import { Avatar } from "@/components/Avatar";
import { AvatarGroup } from "@/components/AvatarGroup";
// import { Img } from '@/components/Img';
import { Form } from '@/components/Form';
import { Editor } from '@/components/MonacoEditor';
// import { Editor } from '@/components/MonacoEditor/cdn';
// import { Editor } from '@/components/MonacoEditor/import';
import { Resizable } from '@/components/Resizable';
// import { AdaptiveItems } from '@/components/AdaptiveItems';
import { useNetwork } from '@/hooks/useNetwork';
import { useTextareaEditor } from '@/hooks/useTextareaEditor';
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
  const [readOnlyMonaco, setReadOnlyMonaco] = useState(false);
  const monacoRef = useRef<any>(null);
  // const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tabSize = 8;
  const {
    ref: textareaRef,
    value,
    onChange,
  } = useTextareaEditor({
    initialValue: '',
    autoSize: true,
    enableTabIndentation: true,
  }); // '', tabSize

  const isOnline = useNetwork({
    onOnline: () => alert('ONLINE'),
    onOffline: () => alert('OFFLINE'),
  });

  // const handleIndent = useTextareaIndentation({ tab: '  ' }); // 2 spaces

  // const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
  //   // Check if the pressed key is Tab
  //   if (event.key === 'Tab') {
  //     event.preventDefault(); // Prevent the default tab behavior (moving focus)

  //     const textarea = textareaRef.current as HTMLTextAreaElement;
  //     // Get the current cursor position (selection start and end)
  //     const { selectionStart, selectionEnd, value } = textarea;

  //     // Construct the new value of the textarea:
  //     // 1. Part of the string before the cursor
  //     // 2. The tab character ('\t')
  //     // 3. Part of the string after the cursor
  //     textarea.value = value.substring(0, selectionStart) + '\t' + value.substring(selectionEnd);

  //     // Move the cursor to the position right after the inserted tab
  //     // This ensures the cursor is correctly placed and no text is selected.
  //     textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
  //   }
  // };

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
        renderRemaining={(remaining, remaningProps, remainingItems) => (
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

      <hr className="my-4" />

      <AvatarGroup
        // size={57}
        items={users.map((item: any) => ({ ...item, className: "rounded-full" }))}
      />

      <hr className="my-4" />

      <h2>Form</h2>
      <Form
        // disabled
        fieldsetProps={{
          className: "border border-gray-300 p-4"
        }}
      >
        <legend>Login:</legend>
        <input />
        <button>Submit</button>
      </Form>

      <hr className="my-4" />

      <textarea
        rows={3}
        // cols={5}
        // onKeyDown={handleIndent}
        // onKeyDown={handleKeyDown}
        ref={textareaRef}
        value={value}
        onChange={onChange}
        // whitespace-pre-wrap break-words
        //  whitespace-pre
        className="border rounded p-3 w-full text-lg"
        style={{ tabSize }}
        // style={{ width: '100%' }} // fontFamily: 'monospace', 
      />

      <hr className="my-4" />

      <h2>MonacoEditor</h2>
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={readOnlyMonaco} 
            onChange={(e) => setReadOnlyMonaco(e.target.checked)}
          />
          {' '}
          Read Only: {readOnlyMonaco + ''}
        </label>

        <button
          type="button"
          className="p-2 bg-gray-100 border-gray-500 ml-4"
          onClick={() => {
            console.log('monacoRef.current: ', monacoRef.current)
          }}
        >
          Monaco Ref
        </button>
      </div>

      <Resizable
        initialHeight={400} 
        minHeight={100} 
        maxHeight={800}
        resizer={(handleMouseDown, isResizing) => (
          <div
            // data-resize={isResizing}
            onMouseDown={handleMouseDown}
            className={isResizing ? "bg-blue-400" : "bg-gray-400"}
            style={{
              height: 7,
              cursor: 'ns-resize',
              // background: '#777',
            }}
          />
        )}
      >
        <Editor
          ref={monacoRef}
          // src={window.location.origin + "/js/monaco-editor/min/vs/loader.js"}
          // src="https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js"
          // src="https://unpkg.com/monaco-editor@0.52.2/min/vs/loader.js"
          src={[
            window.location.origin + "/js/monaco-editor/min/vs/loader.js",
            "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js",
            "https://unpkg.com/monaco-editor@0.52.2/min/vs/loader.js"
          ]}
          // scriptAttrs={{
          //   id: "monacoSrc"
          // }}
          language="typescript" // javascript
          theme="vs-dark"
          readOnly={readOnlyMonaco}
          // originalValue="const request = fetch('https://api.com/users');"
          options={{
            // minimap: {
            //   enabled: false,
            // },
            scrollBeyondLastLine: false,
            scrollbar: {
              alwaysConsumeMouseWheel: false,
            },
          }}
          loader={
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
                zIndex: 9,
                fontSize: 14,
                fontWeight: 700,
                color: "#666",
              }}
            >
              Loading...
            </div>
          }
          className="w-full h-full" // absolute inset-0 | h-96
          // style={{
          //   height: 375,
          //   overflowY: 'auto',
          //   resize: 'vertical',
          // }}
        />
      </Resizable>

      <hr className="my-4" />

      {Array.from({ length: 27 }).map((item: any, idx: number) => <p key={idx}>P {idx + 1}</p>)}

      {/* <div
        className="relative"
        style={{
          height: 375,
          // overflowY: 'auto', // visible
          // resize: 'vertical',
        }}
      >
        
      </div> */}

      {/* 

      <h2>Img</h2>
      <Img
        alt="Muhamad Husein" 
        // src="https://avatars.githubusercontent.com/u/19644272?v=4"
        // src="/react.svg"
        src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg"
        width={300}
        height={111}
      /> */}

      {/* <AdaptiveItems
        // 
      /> */}
    </div>
  )
}

export default App
