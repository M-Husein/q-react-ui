import { useState } from 'react';

type useRenderOnceReturn = [render: boolean, handleOnce: () => void 0]

export const useRenderOnce = (): useRenderOnceReturn => {
  const [render, setRender] = useState(false);

  const handleOnce = () => {
    if(!render) setRender(true);
  }

  return [render, handleOnce];
}

// USAGE:
/*
const MyComponent = () => {
  const [shouldRender, triggerRenderOnce] = useRenderOnce();
	
	 const handleClick = () => {
    triggerRenderOnce();
    // Other process
    // ...
  }

  return (
    <div>
      <button onClick={handleClick}>
        Activate Once
      </button>

      {shouldRender && (
        <div style={{ marginTop: '10px', color: 'green' }}>
          This content is now visible and will remain visible.
        </div>
      )}
    </div>
  );
}
*/
