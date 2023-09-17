import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/axios";
import isNull from "lodash/isNull";
import isUndefined from "lodash/isUndefined";
import { useEffect, useState } from "react";

interface IProps {
  onPromptSelected: (template: string) => void;
}

interface IPrompt {
  id: string;
  title: string;
  template: string;
}

export function PromptSelect(props: IProps) {
  const [prompts, setPrompts] = useState<IPrompt[] | null>(null);

  useEffect(() => {
    api.get("/prompts").then((response) => setPrompts(response.data));
  }, []);

  function handlePromptSelected(promptId: string) {
    const selectedPrompt = prompts?.find((prompt) => prompt.id === promptId);

    if (isNull(selectedPrompt) || isUndefined(selectedPrompt)) return;

    props.onPromptSelected(selectedPrompt.template);
  }

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger>
        <SelectValue placeholder="Select a prompt" />
      </SelectTrigger>
      <SelectContent>
        {prompts?.map((prompt) => {
          return (
            <SelectItem key={prompt.id} value={prompt.id}>
              {prompt.title}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
