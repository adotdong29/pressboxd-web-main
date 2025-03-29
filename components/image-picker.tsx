"use client";
import { useState, useRef } from "react";
import upload from "@/assets/upload.svg";
import Image from "next/image";

export default function ImagePicker({
  name,
  className,
  ...props
}: {
  name: string;
  className?: string;
  [key: string]: any;
}) {
  const [value, setValue] = useState<string | null>(null);
  const inputFile = useRef<HTMLInputElement | null>(null);

  return (
    <div className={`flex flex-col gap-2 ${className} w-full items-center`}>
      <input
        name={name}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setValue(e.target?.result as string);
            };
            reader.readAsDataURL(file);
          }
        }}
        className="hidden"
        ref={inputFile}
        {...props}
      />
      {value ? (
        <img
          src={value}
          alt="Preview"
          className="w-36 h-36 object-cover rounded-full"
        />
      ) : (
        <button
          className="w-36 h-36 bg-none rounded-full flex items-center justify-center"
          onClick={() => inputFile.current?.click()}
        >
          <Image
            src={upload}
            alt="Add Image"
            width={230}
            className="max-w-sm"
          />
        </button>
      )}
      <p
        className="cursor-pointer pb-5"
        onClick={() => inputFile.current?.click()}
      >
        Upload Profile Photo
      </p>
    </div>
  );
}
