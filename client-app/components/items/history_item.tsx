import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Query } from "../../lib/schema/data/query.schema";
import Image from "next/image";
interface HistoryItemProps {
  item: Query;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (imageRef.current && !imageRef.current.contains(event.target as Node)) {
      setIsImageExpanded(false);
    }
  };

  useEffect(() => {
    if (isImageExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isImageExpanded]);

  return (
    <div
      className="flex items-center p-4 bg-base-100 shadow-md rounded-lg"
      style={{ height: "150px", maxWidth: "600px" }}
    >
      <img
        src={
          item.image?.image_url ||
          "https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg"
        }
        alt="History Image"
        className="w-24 h-24 object-cover rounded-md mr-4 cursor-pointer"
        onClick={toggleImageExpand}
        loading="lazy"
      />
      <div className="flex flex-col flex-1">
        <p
          className={`text-base text-base-content cursor-pointer ${
            isExpanded ? "max-h-full" : "max-h-16 overflow-hidden"
          }`}
          onClick={toggleExpand}
        >
          {item.content}
        </p>
        <p className="text-sm text-base-content mt-2">
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </p>
      </div>
      {isImageExpanded && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative" ref={imageRef}>
            <div
              className="w-[800px] h-[800px] overflow-hidden"
              style={{ width: "800px", height: "800px" }} // Explicit dimensions for expanded image
            >
              <img
                src={
                  item.image?.image_url ||
                  "https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg"
                }
                alt="Expanded History Image"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={toggleImageExpand}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryItem;
