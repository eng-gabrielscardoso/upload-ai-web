import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import isNull from "lodash/isNull";
import { FileVideo, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";

type TVideoUploadStatus =
  | "awaiting"
  | "converting"
  | "uploading"
  | "generating"
  | "success";

const statusMessages: Record<TVideoUploadStatus, string> = {
  awaiting: "Upload file",
  converting: "Converting...",
  uploading: "Uploading...",
  generating: "Generating...",
  success: "Success upload file",
};

export function VideoInputForm() {
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<TVideoUploadStatus>("awaiting");
  const [video, setVideo] = useState<File | null>(null);

  async function convertVideoToAudio(video: File) {
    const ffmpeg = await getFFmpeg();

    await ffmpeg.writeFile("input.mp4", await fetchFile(video));

    ffmpeg.on("progress", (progress) => {
      console.log(`Convert progress ${Math.round(progress.progress * 100)}`);
    });

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3",
    ]);

    const data = await ffmpeg.readFile("output.mp3");

    const audioBlob = new Blob([data], { type: "audio/mpeg" });

    const audio = new File([audioBlob], "audio.mp3", {
      type: "audio/mpeg",
    });

    return audio;
  }

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;

    if (isNull(files)) {
      return;
    }

    const selectedFile = files.item(0);

    setVideo(selectedFile);
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = promptInputRef.current?.value;

    if (isNull(video)) {
      return;
    }

    await setStatus("converting");

    const audio = await convertVideoToAudio(video);

    await setStatus("uploading");

    const data = new FormData();

    data.append("file", audio);

    const response = await api.post("/videos", data);

    const videoId = response.data.id;

    await setStatus("generating");

    await api.post(`/transcriptions/${videoId}`, {
      prompt,
    });

    await setStatus("success");
  }

  const previewURL = useMemo(() => {
    if (isNull(video)) {
      return null;
    }

    return URL.createObjectURL(video);
  }, [video]);

  return (
    <form className="space-y-4" onSubmit={handleUploadVideo}>
      <label
        htmlFor="video"
        className="border flex items-center justify-center rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 text-muted-foreground hover:bg-primary/10"
      >
        {video ? (
          <video src={`${previewURL}`} controls={true} className="" />
        ) : (
          <>
            Upload video
            <FileVideo className="w-4 h-4" />
          </>
        )}
      </label>
      <input
        type="file"
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelected}
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Transcription prompt</Label>
        <Textarea
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="Include keywords presents in video separated by commas (,)"
          ref={promptInputRef}
          disabled={status !== "awaiting"}
        ></Textarea>
      </div>

      <Button type="submit" className="w-full" disabled={status !== "awaiting"}>
        {status === "awaiting" ? (
          <>
            {statusMessages[status]}
            <Upload className="w-4 h-4 ml-2" />
          </>
        ) : (
          <>statusMessages[status]</>
        )}
      </Button>
    </form>
  );
}
