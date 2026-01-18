import { ChangeEvent, useState } from "react";
import axios from "axios";
type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function FileUplodaer() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }

  async function handleFileUpload(file: File) {
    if (!file) return;

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setStatus("success");
      }
    } catch (error) {
      console.error("Upload failed", error);
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4">
      <input type="file" onChange={handleFileChange}></input>
      {file && (
        <div className="mb-4 text -sm">
          <p>File Name: {file.name}</p>
          <p>File Size: {(file.size / 1024).toFixed(2)} KB</p>
          <p>File Type: {file.type}</p>
        </div>
      )}
      {file && status !== "uploading" && (
        <button onClick={() => handleFileUpload(file)}>Upload</button>
      )}
      {status === "success" && (
        <p className="text-green-600">File uploaded successfully!</p>
      )}

      {status === "error" && (
        <p className="text-red-600">File upload failed. Please try again.</p>
      )}
    </div>
  );
}
