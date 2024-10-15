import { useState, createElement, SVGProps, ComponentType } from 'react';
import { PulseLoader } from 'react-spinners';
import * as LucideIcons from 'lucide-react';

interface BasicButtonProps {
  onClick: () => void | Promise<void>;  // Adjust return type as needed
  buttonText: string;
  type: 'general' | 'delete';
  iconName?: keyof typeof LucideIcons | null;
}



const BasicButton: React.FC<BasicButtonProps> = ({ onClick, buttonText, type, iconName }) => {
  const [loading, setLoading] = useState(false);

  const mapColors: Record<'general' | 'delete', string> = {
    general: "#ff6b2b",
    delete: "#f44336"
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = onClick();    // Handle both synchronous and asynchronous functions
      if (result instanceof Promise) {
        await result;              // Await the function if it returns a Promise
      }
    } finally {
      setLoading(false);           // Ensure loading is reset whether function succeeds or fails
    }
  };

  // Get the icon component based on the iconName string
  const IconComponent: ComponentType<SVGProps<SVGSVGElement>> | null = iconName
    ? (LucideIcons[iconName] as ComponentType<SVGProps<SVGSVGElement>>)
    : null;


  return (
    <button
      onClick={handleClick}
      className="text-white font-bold py-2 px-4 flex items-center justify-center space-x-2"
      disabled={loading}
      style={{
        width: '150px',
        height: '40px',
        backgroundColor: mapColors[type],  // TypeScript knows that `type` is either 'general' or 'delete'
        borderTopLeftRadius: '15px',
        borderBottomRightRadius: '15px',
        borderTopRightRadius: '5px',
        borderBottomLeftRadius: '5px',
        boxShadow: '0px 0px 3px 0px #ff952b',
      }}
    >
      {loading ? (
        <PulseLoader color="white" size={8} />
      ) : (
        <>
          {IconComponent && createElement(IconComponent, { className: 'w-5 h-5' })}
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
};

export default BasicButton;