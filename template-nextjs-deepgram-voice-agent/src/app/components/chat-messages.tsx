import { useState,useEffect } from "react";
import { MessageWithId } from "../types/messages";
const AnimatedMessage = ({
  text,
  isLatest,
  isDark,
}: {
  text: string;
  isLatest: boolean;
  isDark: boolean;
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const words = text.split(" ");

  useEffect(() => {
    if (!isLatest) {
      setHighlightedIndex(words.length);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      setHighlightedIndex(currentIndex);
      currentIndex++;
      if (currentIndex >= words.length) clearInterval(interval);
    }, 180);

    return () => clearInterval(interval);
  }, [isLatest, words.length]);

  return (
    <div className="text-[1.7rem] leading-relaxed md:text-[1.7rem]">
      {words.map((word, i) => (
        <span
          key={i}
          className={`transition-all duration-300 ${
            isDark
              ? i <= highlightedIndex
                ? "text-white"
                : "text-white/50"
              : i <= highlightedIndex
              ? "text-gray-900"
              : "text-gray-400"
          }`}
        >
          {word}{" "}
        </span>
      ))}
    </div>
  );
};

export const ChatMessages = ({
  msg,
  isLatest,
  isDark,
}: {
  msg: MessageWithId;
  isLatest: boolean;
  isDark: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, []);



  const displayLabel = msg.role === "user" ? "You" : "Agent";

  return (
    <div
      className={`space-y-2 w-full transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className={`text-base  font-medium tracking-wide md:text-base ${isDark ? "opacity-60" : "opacity-70"}`}>
        {displayLabel}
      </div>
      <AnimatedMessage text={msg.content} isLatest={isLatest} isDark={isDark} />
    </div>
  );
};
