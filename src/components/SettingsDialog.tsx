import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface SettingsDialogProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const SettingsDialog = ({ apiKey, onApiKeyChange }: SettingsDialogProps) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onApiKeyChange(tempKey);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Mapbox API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="pk.eyJ1..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
          <Button onClick={handleSave} className="w-full">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
