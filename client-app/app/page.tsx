"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const [imageLink, setImageLink] = useState("");
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    setDroppedFiles(acceptedFiles);

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setPreviewImage(reader.result as string);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.gif', '.png', '.webp', '.bmp', '.svg'] },
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
  };

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
          className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${previewImage ? 'bg-gray-400 cursor-not-allowed' : ''}`}
          disabled={!!previewImage}
        />
        {linkError && (
          <p className="mt-2 text-sm text-red-600">{linkError}</p>
        )}
      </div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${previewImage ? 'bg-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} disabled={!!previewImage} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      {previewImage && (
        <div className="mt-4 flex flex-col items-center">
          <div className="relative w-full max-w-xs">
            <img src={previewImage} alt="Image Preview" className="object-contain w-full h-auto" />
          </div>
          <button
            onClick={handleCancelImage}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Cancel Image
          </button>
        </div>
      )}
    </div>
  );
}