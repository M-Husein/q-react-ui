import { Fragment, useState, useEffect, useRef, useCallback } from 'react';

interface Item {
  id: string;
  label: string;
}

interface OverflowListProps {
  items: Item[];
  renderItem: (item: Item) => React.ReactNode;
  renderOverflow: (overflowItems: Item[]) => React.ReactNode;
}

interface OverflowMenuProps {
  items: Item[];
}

export const AdaptiveItems: React.FC = () => {
  // Sample items for the OverflowList
  const [items, setItems] = useState<Item[]>([
    { id: '1', label: 'Dashboard' },
    { id: '2', label: 'Settings' },
    { id: '3', label: 'Profile' },
    { id: '4', label: 'Notifications' },
    { id: '5', label: 'Messages' },
    { id: '6', label: 'Analytics' },
    { id: '7', label: 'Reports' },
    { id: '8', label: 'Support' },
    { id: '9', label: 'About Us' },
    { id: '10', label: 'Contact' },
  ]);

  const [newItemLabel, setNewItemLabel] = useState<string>('');

  const handleAddItem = (): void => {
    if (newItemLabel.trim() !== '') {
      setItems((prevItems: Item[]) => [
        ...prevItems,
        { id: String(Date.now()), label: newItemLabel.trim() } // Use Date.now() for more unique IDs
      ]);
      setNewItemLabel('');
    }
  };

  const handleRemoveLastItem = (): void => {
    setItems((prevItems: Item[]) => prevItems.slice(0, -1));
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        React Overflow List Example
      </h1>

      {/* Control panel for adding/removing items */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <input
          type="text"
          value={newItemLabel}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemLabel(e.target.value)}
          placeholder="New item label"
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Add Item
        </button>
        <button
          onClick={handleRemoveLastItem}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Remove Last Item
        </button>
      </div>

      {/* Container for the OverflowList with a defined width for demonstration */}
      <div className="max-w-4xl mx-auto border border-gray-300 rounded-lg shadow-xl bg-white p-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Navigation Menu (Resize window to see overflow)</h2>
        <OverflowList
          items={items}
          // Render function for each visible item
          renderItem={(item: Item) => (
            <button
              key={item.id}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-150"
            >
              {item.label}
            </button>
          )}
          // Render function for the overflow indicator/menu button
          renderOverflow={(overflowItems: Item[]) => (
            <OverflowMenu items={overflowItems} />
          )}
        />
      </div>
    </div>
  );
};

// The core OverflowList component
const OverflowList: React.FC<OverflowListProps> = ({ items, renderItem, renderOverflow }) => {
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the visible container (where items are actually displayed)
  const measurementContainerRef = useRef<HTMLDivElement>(null); // Ref for the hidden container used to measure all items
  const [visibleItems, setVisibleItems] = useState<Item[]>([]);
  const [overflowItems, setOverflowItems] = useState<Item[]>([]);
  const [overflowButtonWidth, setOverflowButtonWidth] = useState<number>(0); // State to store overflow button width

  // Measure the width of the overflow button dynamically once on mount
  useEffect(() => {
    const dummyOverflowButton = document.createElement('div');
    dummyOverflowButton.style.position = 'absolute';
    dummyOverflowButton.style.visibility = 'hidden';
    dummyOverflowButton.style.whiteSpace = 'nowrap';
    // Render exactly what renderOverflow might render to get an accurate width
    dummyOverflowButton.innerHTML = `<span class="px-3 py-2 text-sm font-medium rounded-md">More...</span>`;
    document.body.appendChild(dummyOverflowButton);
    setOverflowButtonWidth(dummyOverflowButton.offsetWidth + 20); // Add some padding/margin for accuracy
    document.body.removeChild(dummyOverflowButton);
  }, []); // Run once on mount

  // Callback function to calculate visible and overflow items based on container width
  const calculateOverflow = useCallback((): void => {
    // Ensure all necessary refs and dimensions are available before calculating
    if (!containerRef.current || !measurementContainerRef.current || overflowButtonWidth === 0) {
      return;
    }

    const containerWidth: number = containerRef.current.offsetWidth; // Get the width of the visible container
    // Get all children from the hidden measurement container to measure their actual widths
    const allItemElements = Array.from(measurementContainerRef.current.children) as HTMLDivElement[];

    let currentWidth: number = 0;
    const newVisibleItems: Item[] = [];
    const newOverflowItems: Item[] = [];

    for (let i = 0; i < allItemElements.length; i++) {
      const itemElement = allItemElements[i];
      const item = items[i]; // Get the corresponding item data (assuming order is preserved)

      if (!itemElement || !item) {
        // Skip if element or data is unexpectedly missing
        continue;
      }

      const itemWidth: number = itemElement.offsetWidth; // Get the rendered width of the item

      // Determine if there will be items remaining after the current one, which would require an overflow button
      const willHaveRemainingItems: boolean = (items.length - (i + 1) > 0);

      // Calculate the total space needed if this item is added
      let spaceNeeded: number = currentWidth + itemWidth;

      // If there will be remaining items, account for the width of the overflow button
      if (willHaveRemainingItems) {
          spaceNeeded += overflowButtonWidth;
      }

      // If the current item (plus potential overflow button) fits within the container
      if (spaceNeeded <= containerWidth) {
        newVisibleItems.push(item);
        currentWidth += itemWidth;
      } else {
        // If it doesn't fit, this item and all subsequent items go into the overflow
        newOverflowItems.push(...items.slice(i));
        break; // Stop iterating as the rest are now overflow
      }
    }

    setVisibleItems(newVisibleItems);
    setOverflowItems(newOverflowItems);
  }, [items, overflowButtonWidth]); // Recalculate if items array or overflow button width changes

  // Effect to recalculate on container resize using ResizeObserver
  useEffect(() => {
    if (!containerRef.current || !measurementContainerRef.current) return;

    // Observe the visible container for size changes
    const containerObserver = new ResizeObserver(() => {
      calculateOverflow(); // Trigger calculation when the visible container's size changes
    });
    containerObserver.observe(containerRef.current);

    // Also observe the measurement container. While less common,
    // if the content of `renderItem` changes its intrinsic size,
    // this would trigger a re-measurement.
    const measurementObserver = new ResizeObserver(() => {
      calculateOverflow();
    });
    measurementObserver.observe(measurementContainerRef.current);

    // Initial calculation when observers are set up and DOM is ready.
    // Use a small timeout to ensure all elements have rendered and taken their final dimensions.
    const timeoutId = setTimeout(() => calculateOverflow(), 0);

    return () => {
      containerObserver.disconnect(); // Clean up observers on unmount
      measurementObserver.disconnect();
      clearTimeout(timeoutId); // Clear any pending timeout
    };
  }, [calculateOverflow]); // Dependency on calculateOverflow ensures it re-subscribes if the function identity changes

  return (
    <>
      {/*
        Hidden container for measuring all items.
        It must render all 'items' using 'renderItem' to get their accurate,
        rendered widths before deciding which are visible.
      */}
      <div
        ref={measurementContainerRef}
        className="absolute invisible h-0 overflow-hidden whitespace-nowrap flex" // flex to ensure correct inline spacing calculation
        aria-hidden="true" // Hide from accessibility tree
      >
        {items.map((item: Item) => (
          // Important: Wrap renderItem output in a div so its width can be measured consistently.
          // The 'inline-block' or 'flex-shrink-0' helps ensure correct width calculation
          // when items have margin/padding or are part of a flex container.
          <div key={item.id} className="inline-block flex-shrink-0">
            {renderItem(item)}
          </div>
        ))}
      </div>

      {/* Visible container for actual display */}
      <div
        ref={containerRef}
        // min-w-0 allows flex items to shrink; flex-nowrap prevents default browser wrapping,
        // as we handle overflow manually via state.
        className="flex items-center relative min-w-0 flex-nowrap"
      >
        {/* Render only the visible items */}
        {visibleItems.map((item: Item) => (
          // Use React.Fragment here to avoid adding an extra DOM node if renderItem already returns one.
          // The widths are already known from the measurementContainer.
          <Fragment key={item.id}>
            {renderItem(item)}
          </Fragment>
        ))}

        {/* Render overflow button if there are overflow items */}
        {overflowItems.length > 0 && (
          <Fragment>
            {renderOverflow(overflowItems)}
          </Fragment>
        )}
      </div>
    </>
  );
};

// Component for the dropdown overflow menu
const OverflowMenu: React.FC<OverflowMenuProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      // Check if the click occurred outside both the menu and the toggle button
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative ml-2">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 flex items-center"
      >
        More
        {/* Simple inline SVG for a chevron down icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1"
        >
          {items.map((item: Item) => (
            <button
              key={item.id}
              onClick={() => {
                console.log(`Clicked overflow item: ${item.label}`);
                setIsOpen(false); // Close menu on item click
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
