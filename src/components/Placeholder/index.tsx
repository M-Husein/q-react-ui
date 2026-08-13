const SIZE = {
  width: '100%', 
  height: '100%'
};

export interface PlaceholderProps
  extends Omit<
    React.SVGProps<SVGSVGElement>,
    "children" | "width" | "height" | "fill" | "title"
  > {
  text?: string;
  title?: string;
  bg?: string;
  color?: string;
  textProps?: Record<string, any>,
}

/**
 * Component for placeholder image.
 * 
 * @props text?: string - Text displayed in the center of the placeholder (default: "?")
 * @props title?: string - Optional title for the SVG (also used as fallback for aria-label)
 * @props bg?: string - Background color (default: "#868e96")
 * @props color?: string - Text color (default: "#eee")
 * @props textProps?: Record<string, any> - <text /> props
 * @returns <svg />
 */
export const Placeholder = ({ 
  text = "?", 
  title, 
  bg = "#868e96", 
  color = "#eee", // "#dee2e6"
  "aria-label": ariaLabel,
  textProps,
  ...etc
}: PlaceholderProps) => {
  return (
    <svg 
      {...SIZE}
      role="img" 

      {...etc}

      preserveAspectRatio="xMidYMid slice" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel ?? title ?? text}
    >
      {!!title && <title>{title}</title>}

      <rect 
        {...SIZE}
        fill={bg}
      />
      
      <text 
        x="50%" 
        y="50%" 
        // dy=".3em"
        textAnchor="middle"
        dominantBaseline="central"

        {...textProps}

        fill={color} 
      >
        {text}
      </text>
    </svg>
  );
};

// Placeholder.displayName = "Placeholder";
