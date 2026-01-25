import { useState, useEffect } from 'react';
import { heroConfig } from '../../config';

interface TypeWriterProps {
  text: string;
  delay?: number;
  speed?: number;
}

export default function TypeWriter({ text, delay = 0, speed }: TypeWriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const typingSpeed = speed || heroConfig.typingSpeed;

  useEffect(() => {
    setDisplayText('');
    setIsTyping(false);
    
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, typingSpeed);
      
      return () => clearInterval(typingInterval);
    }, delay);
    
    return () => clearTimeout(startTimeout);
  }, [text, delay, typingSpeed]);

  return (
    <span className="inline-block">
      {displayText}
      {isTyping && (
        <span className="inline-block w-[2px] h-[1em] bg-white ml-1 animate-blink align-middle" />
      )}
    </span>
  );
}

