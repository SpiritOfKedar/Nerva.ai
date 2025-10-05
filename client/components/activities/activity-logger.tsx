"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Loader2, Ghost } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const activityTypes = [
  { id: "meditation", name: "Meditation" },
  { id: "exercise", name: "Exercise" },
  { id: "walking", name: "Walking" },
  { id: "reading", name: "Reading" },
  { id: "journaling", name: "Journaling" },
  { id: "therapy", name: "Therapy Session" },
];
interface ActivityLoggerProps {
    open:boolean;
    onOpenChange :(open:boolean)=>void;
}
export function ActivityLogger({
  open,
  onOpenChange,
}:ActivityLoggerProps){
  const [type,setType]=useState("");
  const [name,setName]=useState("");
  const [duration,setDuration]=useState("");
  const [description, setDescription]=useState("");
  const [isLoading,setIsLoading]=useState(false);
  const handleSubmit =(e:React.FormEvent)=>{
    setTimeout(()=>{
      console.log(
        {
          type,
          name,
          duration,
          description
        }
      )
      setType("");
      setName("");
      setDuration("");
      setDescription("");
      setIsLoading(false);

    })
  }

  return(
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Log activity
          </DialogTitle>
          <DialogDescription>
            Record your wellness activity
          </DialogDescription>
        </DialogHeader>
        <form action={""} onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>
              activity type
            </Label>
            <Select value="type" onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="select activity type"/>
              </SelectTrigger>  
              <SelectContent>
                  {activityTypes.map((type)=>(
                    <SelectItem key={type.id} value={type.id} >
                      {type.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>
              Name
            </Label>
            <Input 
            value={name}
            onChange={(e)=>setName(e.target.value)}
            placeholder="Morning meditation, Evening walk etc"
            />
          </div>
          <div className="space-y-2">
            <Label>
              Number
            </Label>
            <Input 
            value={duration}
            onChange={(e)=>setName(e.target.value)}
            placeholder="15"
            />
          </div>
            <div className="space-y-2">
            <Label>
              Description (optional)
            </Label>
            <Input 
            value={description}
            onChange={(e)=>setName(e.target.value)}
            placeholder="how did it go?"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant={"ghost"}>
              Cancel
            </Button>
            <Button type="submit" disabled>
              save activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}