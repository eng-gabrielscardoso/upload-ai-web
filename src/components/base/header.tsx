import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github } from "lucide-react";

export function Header() {
  return (
    <header className="px-6 py-3 flex items-center justify-between border-b">
      <h1 className="text-xl font-bold">upload.ai</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Develop with 💚 by <a href="http://eng-gabrielscardoso.github.io" target="_blank" rel="noopener noreferrer">Gabriel Santos Cardoso</a></span>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="outline">
          <a className="flex items-center" href="http://github.com/eng-gabrielscardoso/upload-ai-web" target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4 mr-2" />
            Github
          </a>
        </Button>
      </div>
    </header>
  )
}