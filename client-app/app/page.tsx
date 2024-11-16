"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
// import { uploadImage, getImageDisplayText } from "@/lib/util/api";
import useAuthenticateStore from "@/lib/store/authenticate.store";
import { toast } from "react-toastify";
import img2txtService from "@/lib/service/ai/img2txt.service";

export default function Home() {
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
    disabled: !!previewImage,
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
      if (droppedFiles.length > 0) {
        const result = await img2txtService.convertImageToText(droppedFiles[0]);
        console.log(result);
        if (!result) {
          setLinkError("Error uploading image");
          toast.error("Error uploading image");
        }
        if (result?.image) {
          setImageLink(result.image.image_url);
        }
        setDisplayText(" " + result?.content);
      } else if (imageLink) {
        setDisplayText("Image link set successfully!");
      }
      toast.success("Image processed successfully!");
      setProcessCompleted(true);
    } catch (error) {
      console.error("Error uploading image:", error);
      setLinkError("Error uploading image");
      toast.error("Error uploading image");
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
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="mb-8">
        <label htmlFor="imageLink" className="block text-sm font-medium">
          Image Link
        </label>
        <input
          type="text"
          id="imageLink"
          value={imageLink}
          onChange={handleImageLinkChange}
          className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
            previewImage ? "bg-gray-400 cursor-not-allowed" : ""
          }`}
          disabled={!!previewImage}
        />
        {linkError && <p className="mt-2 text-sm text-red-600">{linkError}</p>}
      </div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${
          previewImage ? "bg-gray-400 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <input {...getInputProps()} disabled={!!previewImage} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      {previewImage && (
        <div className="mt-4 flex flex-col items-center">
          <div className="relative w-full max-w-xs">
            <img
              src={previewImage}
              alt="Image Preview"
              className="object-contain w-full h-auto"
            />
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleCancelImage}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Cancel Image
            </button>
            {!processCompleted && (
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            )}
          </div>
        </div>
      )}
      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="loader"></div>
        </div>
      )}
      {displayText && (
        <div className="mt-8 p-4 border border-gray-300 rounded-lg">
          <p>{typedText}</p>
        </div>
      )}
    </div>
  );
}
