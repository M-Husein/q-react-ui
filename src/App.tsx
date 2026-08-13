import { useState, useRef, forwardRef } from 'react';
import { Avatar } from "@/components/Avatar";
import { AvatarGroup } from "@/components/AvatarGroup";
// import { Img } from '@/components/Img';
import { A } from '@/components/A';
import { Button } from '@/components/Button';
import { Form } from '@/components/Form';
import { Placeholder } from '@/components/Placeholder';
import { Editor } from '@/components/MonacoEditor';
// import { Editor } from '@/components/MonacoEditor/import';
import { Resizable } from '@/components/Resizable';
import { NewWindow, type NewWindowHandle } from '@/components/NewWindow';
// import { AdaptiveItems } from '@/components/AdaptiveItems';
import { useNetwork } from '@/hooks/useNetwork';
import { useTextareaEditor } from '@/hooks/useTextareaEditor';
import { useMediaQuery } from './hooks/useMediaQuery';
// import { useScrollTo } from './hooks/useScrollTo';
// import { useNewWindow, UseNewWindowProps } from "@/hooks/useNewWindow";
import { cn } from "q-js-utils/cn";

// const NewWindow: React.FC<NewWindowProps> = (props) => {
//   const { portal } = useNewWindow(props);

//   if (!portal) return null;
//   return <>{portal(props.children)}</>;
// };

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

const Div = forwardRef<HTMLDivElement, any>((
  props,
  ref
) => (
  <div
    {...props}
    ref={ref}
  />
));
Div.displayName = "Div";

export const App = () => {
  const [openNewWindow, setOpenNewWindow] = useState(false);
  const newWindowRef = useRef<NewWindowHandle>(null);

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
    tab: true, // old name enableTabIndentation
    tabSize,
    autoSize: true,
    // historyDelay: 600,
  });

  const isOnline = useNetwork({
    onOnline: () => alert('ONLINE'),
    onOffline: () => alert('OFFLINE'),
  });

  const [isMobile, isTablet, isDesktop] = useMediaQuery(
    [
      "(max-width: 640px)",
      "(min-width: 641px) and (max-width: 1024px)",
      "(min-width: 1025px)",
    ],
    (matches) => console.log("Active query:", matches) // [true, false, false]
  );

  // const {
  //   scrollToTop,
  //   // scrollToBottom,
  //   // isAtTop,
  //   isButtonVisible,
  //   // scrollPosition,
  // } = useScrollTo(); // 400

  // Determine if the scroll-to-bottom button should be shown
  // A simple heuristic: show it if the scrollable height is large AND we're not at the bottom
  // const isScrollToBottomVisible = 
  //   document.documentElement.scrollHeight > window.innerHeight && 
  //   scrollPosition < (document.documentElement.scrollHeight - window.innerHeight - 50); // -50px margin

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

  // const toggleNewWindow = () => setOpenNewWindow(!openNewWindow);
  const toggleNewWindow = () => {
    // if (openNewWindow) {
    //   // 👇 explicitly close popup
    //   newWindowRef.current?.close();
    //   setOpenNewWindow(false);
    // } else {
    //   // newWindowRef.current?.open();
    //   setOpenNewWindow(true);
    // }
    setOpenNewWindow(!openNewWindow);
  };

  return (
    <div className="p-4">
      <section>
        <h4 className={cn("text-2xl font-bold", isOnline ? "text-blue-600" : "text-red-600")}>
          {isOnline ? "Online" : "Offline"}
        </h4>

        <hr />

        <div>
          {isMobile && "📱 Mobile"}
          {isTablet && "💻 Tablet"}
          {isDesktop && "🖥 Desktop"}
        </div>
      </section>

      <hr />

      <section>
        <h4>Link</h4>
        <div className="space-x-2">
          <A
            href="https://github.com/M-Husein/q-react-ui"
          >
            Link repo
          </A>

          <A
            href="https://www.npmjs.com/package/q-react-ui"
            disabled
          >
            Link disabled
          </A>

          <A
            href="https://www.npmjs.com/package/q-react-ui"
            inert
          >
            Link inert
          </A>

          <A
            href="https://www.npmjs.com/package/q-react-ui"
            As="button"
          >
            Link As button
          </A>

          <A
            href="https://www.npmjs.com/package/q-react-ui"
            As="span"
          >
            Link As span
          </A>
        </div>
      </section>

      <hr />

      <section>
        <h4>{'<Placeholder />'}</h4>
        <Placeholder
          text="VK"
          title={import.meta.env.VITE_APP_NAME}
          className="rounded"
          // dy=".1em"
          style={{
            width: 33,
            height: 33,
            fontSize: 15,
          }}
        />
      </section>

      <hr />

      <section>
        <h4>{'<NewWindow />'}</h4>
        <Button
          // disabled
          outline
          // kind="main"
          size="lg"
          onClick={toggleNewWindow}
        >
          {openNewWindow ? "Close" : "Open"} New Window
        </Button>

        <NewWindow
          ref={newWindowRef}
          open={openNewWindow}
          // url="about:blank"
          name="_blank" // Popup
          title="My New Window"
          // center="parent" // screen | parent
          // closeOnUnmount={false}
          // onOpen={(w) => console.log("Opened w: ", w)}
          // onUnload={() => {
          //   setOpenNewWindow(false);
          //   console.log("Closed");
          // }}
          copyStyles
          onClose={() => {
            setOpenNewWindow(false);
            console.log("Closed");
          }}
        >
          <h1 className="text-xl text-blue-500 font-bold">Hello from popup!</h1>
        </NewWindow>

        {/* {openNewWindow && (
          <NewWindow
            ref={newWindowRef}
            // url="about:blank"
            title="Popup"
            center="parent" // screen | parent
            // closeOnUnmount={false}
            onOpen={(w) => console.log("Opened w: ", w)}
            onUnload={() => {
              setOpenNewWindow(false);
              console.log("Closed");
            }}
          >
            <h1>Hello from popup!</h1>
          </NewWindow>
        )} */}
      </section>

      <hr />

      <section>
        <h4>Avatar</h4>
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

        <h4>AvatarGroup</h4>
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
      </section>

      <hr className="my-4" />

      <section>
        <h4>Form</h4>
        <Form
          // disabled
          fieldsetProps={{
            className: "border border-gray-300 p-4"
          }}
        >
          <legend>Login:</legend>
          <input />
          <Button type="submit">Submit</Button>
        </Form>
      </section>
      
      <section>
        <h4>Button</h4>
        <div className="space-x-1">
          <Button
            As="input"
            value="As input"
            kind="danger"
            size="sm"
            disabled
          />

          <Button
            As="a"
            href="#"
            // kind="error"
            size="xs"
            disabled
          >
            As link
          </Button>

          <Button
            As="span"
            kind="info"
          >
            As span
          </Button>

          <Button
            As={Div}
            disabled
            kind="info"
            // tabIndex={0}
            // not work, Bootstrap has pointer-event: none in .disabled class
            // className="cursor-progress"
          >
            <b 
              className="spinner-border spinner-border-sm" 
              aria-hidden="true" 
              aria-label="Loading…"
            />{' '}
            As div
          </Button>
        </div>
      </section>

      <hr className="my-4" />

      <h2>useTextareaEditor</h2>
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
        className="form-control" // border rounded p-3 w-full text-lg
        style={{ tabSize }}
        // style={{ width: '100%' }} // fontFamily: 'monospace', 
      />

      <hr className="my-4" />

      <section>
        <h4>MonacoEditor</h4>
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

          <Button
            className="ml-4"
            onClick={() => {
              console.log('monacoRef.current: ', monacoRef.current)
            }}
          >
            Monaco Ref
          </Button>
        </div>

        <Resizable
          className="relative"
          initialHeight={400} 
          minHeight={100} 
          maxHeight={900}
          // renderResizer={(props, isResizing) => (
          //   <div
          //     // onMouseDown={handleMouseDown}
          //     // tabIndex={-1}
          //     {...props}
          //     className={isResizing ? "bg-blue-200 isResizing" : "bg-gray-200"}
          //     style={{
          //       height: 5,
          //       cursor: 'ns-resize',
          //     }}
          //   />
          // )}
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
                // Subtle shadows to the left & top. Defaults to true.
                // useShadows: false,

                // // Render vertical arrows. Defaults to false.
                // verticalHasArrows: true,
                // // Render horizontal arrows. Defaults to false.
                // horizontalHasArrows: true,

                // // Render vertical scrollbar.
                // // Accepted values: 'auto', 'visible', 'hidden'.
                // // Defaults to 'auto'
                // vertical: "visible",
                // // Render horizontal scrollbar.
                // // Accepted values: 'auto', 'visible', 'hidden'.
                // // Defaults to 'auto'
                // horizontal: "visible",

                // verticalScrollbarSize: 15,
                // horizontalScrollbarSize: 15,
                // arrowSize: 28,
              },
              placeholder: "Insert code here...",
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
                Loading…
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
      </section>

      <hr className="my-4" />

      {/* @ts-ignore */}
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

      {/* 1. Scroll-to-Top Button */}
      {/* {isButtonVisible && (
        <Button
          onClick={scrollToTop}
          // style={{  }}
          title="Scroll to Top"
          className="fixed bottom-3 right-3 z-50" // sticky
        >
          ⬆️
        </Button>
      )} */}

      {/* 2. Scroll-to-Bottom Button */}
      {/* {!isAtTop && isScrollToBottomVisible && (
        <Button
          onClick={scrollToBottom}
          style={{  }}
          title="Scroll to Bottom"
        >
          ⬇️
        </Button>
      )} */}
    </div>
  )
}
