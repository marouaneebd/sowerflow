import { useState } from 'react';
import { PulseLoader } from 'react-spinners';

interface BasicButtonProps {
  onClick: () => Promise<void>; // The function passed in as a prop should return a Promise
  buttonText: string;           // Text to display when not loading
}

const BasicButton: React.FC<BasicButtonProps> = ({ onClick, buttonText }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick(); // Await the function passed in as prop
    } finally {
      setLoading(false); // Ensure loading is reset whether function succeeds or fails
    }
  };

  return (
    <button
      onClick={handleClick}
      className="text-white font-bold py-2 px-4 flex items-center justify-center"
      disabled={loading}
      style={{
        width: '150px',
        height: '40px',
        backgroundColor: '#ff6b2b',
        borderTopLeftRadius: '15px',
        borderBottomRightRadius: '15px',
        borderTopRightRadius: '5px',
        borderBottomLeftRadius: '5px',
        boxShadow: '0px 0px 3px 0px #ff952b',
      }}
    >
      {loading ? <PulseLoader color="white" size={8} /> : buttonText}
    </button>
  );
};

export default BasicButton;
