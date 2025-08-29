import React, { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Avatar from "@mui/material/Avatar";
import getChadAnalysis from "@/libs/GetChadAnalysis";
import CircularProgress from "@mui/material/CircularProgress";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CHAD() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const chatBubbleRef = useRef<HTMLDivElement | null>(null);

  const callChad = async () => {
    setIsLoading(true);
    const response = await getChadAnalysis();

    setIsLoading(false);
    setAnalysis(response.data);
    setDisplayedText("");
    setCurrentIndex(0);
    setIsUserScrolling(false); // Reset on new analysis
  };

  useEffect(() => {
    if (analysis) {
      const interval = setInterval(() => {
        if (currentIndex < analysis.length) {
          setDisplayedText((prevText) => prevText + analysis[currentIndex]);
          setCurrentIndex((prevIndex) => prevIndex + 1);
        } else {
          clearInterval(interval);
        }
      }, 20);

      return () => clearInterval(interval);
    }
  }, [analysis, currentIndex]);

  useEffect(() => {
    if (!isUserScrolling && chatBubbleRef.current) {
      chatBubbleRef.current.scrollTop = chatBubbleRef.current.scrollHeight;
    }
  }, [displayedText, isUserScrolling]);

  useEffect(() => {
    const handleScroll = () => {
      if (chatBubbleRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatBubbleRef.current;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 10;

        setIsUserScrolling(!isAtBottom);
      }
    };

    const chatBubble = chatBubbleRef.current;
    chatBubble?.addEventListener("scroll", handleScroll);

    return () => chatBubble?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-100% h-[380px] flex flex-col justify-between shadow-md rounded-md p-4">
      <div className="flex flex-row justify-between">
        <span className="flex flex-col gap-2 p-4">
          <h1 className="text-4xl font-bold">ChadGPT</h1>
          <p>Free data analysis powered by AI</p>
        </span>
        <Avatar src="/chad_icon.jpg" sx={{ width: 48, height: 48, margin: "1rem" }} />
      </div>
      <div
        ref={chatBubbleRef}
        className="overflow-y-auto
      [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar-track]:rounded-full
      [&::-webkit-scrollbar-track]:bg-gray-100
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-gray-300
      "
      >
        <div className="chat-bubble">
          {analysis ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayedText}
            </ReactMarkdown>
          ) : (
            <p>Hello! How can I assist you today?</p>
          )}
        </div>
      </div>
      <div className="flex justify-end items-end p-4">
        {isLoading ? (
          <Button variant="contained" className="w-[200px]" disabled>
            <CircularProgress className="absolute" size={25} />
            <AutoAwesomeIcon />
            Get Analysis
          </Button>
        ) : (
          <Button
            variant="contained"
            className="w-[200px] m-2 ml-auto"
            onClick={callChad}
          >
            <AutoAwesomeIcon />
            Get Analysis
          </Button>
        )}
      </div>
    </div>
  );
}