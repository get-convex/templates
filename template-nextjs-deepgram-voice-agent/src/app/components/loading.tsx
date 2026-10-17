
import { Loader2 } from "lucide-react"

export const LoadingPage = ()=>{
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
}