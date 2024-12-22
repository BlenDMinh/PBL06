"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Query } from "../../lib/schema/data/query.schema";

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

  const localDate = new Date(item.created_at);

  return (
    <div className="card bg-base-100 shadow-xl border border-primary/20 hover:border-primary/40 transition-colors duration-300">
      <div className="card-body p-5">
        <div className="flex items-start">
          <figure className="mr-4 flex-shrink-0 bg-base-200 p-1 rounded-lg">
            <img
              src={
                item.image?.image_url ||
                "https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg"
              }
              alt="History Image"
              className="w-24 h-24 object-cover rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300"
              onClick={toggleImageExpand}
              loading="lazy"
            />
          </figure>
          <div className="flex flex-col flex-1 space-y-2 pr-2">
            <div
              className={`text-base cursor-pointer ${
                isExpanded ? "max-h-full" : "max-h-16 overflow-hidden"
              }`}
              onClick={toggleExpand}
            >
              <p className="text-base-content">{item.content}</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-base-content">
                  Status:
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.result === "PENDING"
                      ? "bg-warning/30 text-warning-content"
                      : item.result === "SUCCESS"
                      ? "bg-success/30 text-success-content"
                      : "bg-error/30 text-error-content"
                  }`}
                >
                  {item.result}
                </span>
              </div>
              {item.result !== "PENDING" && (
                <span className="text-sm text-base-content/70">
                  {formatDistanceToNow(localDate, { addSuffix: true })}
                </span>
              )}
            </div>

            <p className="text-xs text-base-content/50">
              {localDate.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {isImageExpanded && (
        <div className="fixed inset-0 flex items-center justify-center bg-base-300/75 z-50">
          <div
            className="relative bg-base-100 p-2 rounded-lg shadow-2xl"
            ref={imageRef}
          >
            <div className="w-[800px] h-[800px] overflow-hidden">
              <img
                src={
                  item.image?.image_url ||
                  "https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg"
                }
                alt="Expanded History Image"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              className="btn btn-circle btn-sm absolute -top-2 -right-2 bg-base-100 text-base-content hover:bg-base-200"
              onClick={toggleImageExpand}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryItem;
