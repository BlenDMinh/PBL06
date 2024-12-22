"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import useAuthenticateStore from "@/lib/store/authenticate.store";
import { toast } from "react-toastify";
import { convertImageToText } from "./actions";
import Image from "next/image";
import { ApiError } from "@/lib/errors/ApiError";
import { useRouter } from "next/navigation";
import { Upload, X, Send } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [imageLink, setImageLink] = useState("");
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [displayText, setDisplayText] = useState<string>("");
  const [typedText, setTypedText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [processCompleted, setProcessCompleted] = useState<boolean>(false);

  const { ensuredInitialized, isAuthenticated, user } = useAuthenticateStore(
    (state) => ({
      ensuredInitialized: state.ensuredInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
    })
  );

  useEffect(() => {
    ensuredInitialized();
  }, [ensuredInitialized]);

  const onDrop = (acceptedFiles: File[]) => {
    setDroppedFiles(acceptedFiles);
    setProcessCompleted(false);

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setPreviewImage(reader.result as string);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".gif", ".png", ".webp", ".bmp", ".svg"],
    },
    disabled: !!previewImage || !isAuthenticated,
  });

  const handleImageLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setImageLink(link);

    if (!link) {
      setLinkError(null);
      return;
    }

    try {
      const url = new URL(link);
      const xhr = new XMLHttpRequest();
      xhr.open("HEAD", url.toString(), true);
      xhr.onload = () => {
        if (xhr.status === 200) {
          setLinkError(null);
          setPreviewImage(link);
        } else {
          setLinkError("Please enter a valid image URL.");
        }
      };
      xhr.onerror = () => {
        setLinkError("Please enter a valid image URL.");
      };
      xhr.send();
    } catch {
      setLinkError("Please enter a valid URL.");
    }
  };

  const handleCancelImage = () => {
    setImageLink("");
    setDroppedFiles([]);
    setPreviewImage(null);
    setLinkError(null);
    setDisplayText("");
    setTypedText("");
    setProcessCompleted(false);
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      let fileToSend: File | null = null;

      if (droppedFiles.length > 0) {
        fileToSend = droppedFiles[0];
      } else if (imageLink) {
        const response = await fetch(imageLink);
        const blob = await response.blob();
        fileToSend = new File([blob], "image.jpg", { type: blob.type });
      }

      if (!fileToSend) {
        toast.error("No image to process");
        return;
      }

      const access_token = localStorage.getItem("access_token");
      if (!access_token) {
        toast.error("Authentication required");
        return;
      }

      const formData = new FormData();
      formData.append("upload_image", fileToSend);

      try {
        const queryResult = await convertImageToText(
          formData,
          access_token,
          user!.id
        );
        if (queryResult) {
          setDisplayText(" " + queryResult.content);
          toast.success("Image processed successfully!");
          setProcessCompleted(true);
          router.push("/history");
        }
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error(
            "An unexpected error occurred while processing the image"
          );
        }
        console.error("Processing error:", error);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let index = 0;
    let typingInterval: NodeJS.Timeout;

    if (displayText) {
      typingInterval = setInterval(() => {
        setTypedText((prev) => prev + displayText.charAt(index));
        index++;
        if (index >= displayText.length) {
          clearInterval(typingInterval);
        }
      }, 100);
    }

    return () => clearInterval(typingInterval);
  }, [displayText]);

  return (
    <div className="min-h-screen p-8 bg-base-200">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-base-content">
          Dashboard
        </h1>
        {!isAuthenticated ? (
          <div className="alert alert-error mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Please login to use the image classification feature</span>
          </div>
        ) : (
          <div className="mb-8">
            <label htmlFor="imageLink" className="label">
              <span className="label-text">Image Link</span>
            </label>
            <input
              type="text"
              id="imageLink"
              value={imageLink}
              onChange={handleImageLinkChange}
              className={`input input-bordered w-full ${
                previewImage || !isAuthenticated ? "input-disabled" : ""
              }`}
              disabled={!!previewImage || !isAuthenticated}
            />
            {linkError && (
              <label className="label">
                <span className="label-text-alt text-error">{linkError}</span>
              </label>
            )}
          </div>
        )}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            previewImage || !isAuthenticated
              ? "bg-base-300 cursor-not-allowed"
              : "bg-base-100 hover:bg-base-200 cursor-pointer transition-colors duration-200"
          }`}
        >
          <input
            {...getInputProps()}
            disabled={!!previewImage || !isAuthenticated}
          />
          <Upload className="mx-auto h-12 w-12 text-base-content" />
          <p className="mt-2 text-base-content">
            {!isAuthenticated
              ? "Please login to upload images"
              : "Drag 'n' drop some files here, or click to select files"}
          </p>
        </div>
        {previewImage && (
          <div className="mt-8 flex flex-col items-center">
            <div className="relative w-full max-w-xs h-64">
              <Image
                src={previewImage}
                alt="Image Preview"
                fill
                style={{ objectFit: "contain" }}
                className="rounded-lg"
              />
            </div>
            <div className="mt-4 flex space-x-4">
              <button onClick={handleCancelImage} className="btn btn-error">
                <X className="mr-2 h-4 w-4" /> Cancel Image
              </button>
              {!processCompleted && (
                <button
                  onClick={handleSend}
                  className={`btn btn-primary ${loading ? "loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Sending..." : "Send"}
                </button>
              )}
            </div>
          </div>
        )}
        {displayText && (
          <div className="mt-8 p-4 bg-base-100 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-2 text-base-content">
              Result:
            </h2>
            <p className="text-base-content">{typedText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
