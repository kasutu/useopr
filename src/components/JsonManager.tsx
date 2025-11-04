import { useState } from "react";
import { OPRData } from "@/types/opr";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Download, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { geocodeAddress } from "@/utils/geocoding";

interface JsonManagerProps {
  data: OPRData;
  onImport: (data: OPRData) => void;
  apiKey: string;
}

export const JsonManager = ({ data, onImport, apiKey }: JsonManagerProps) => {
  const [importJson, setImportJson] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleImport = async () => {
    try {
      const parsed: OPRData = JSON.parse(importJson);
      setIsGeocoding(true);

      // Geocode waypoints with zero coordinates
      let geocodedCount = 0;
      for (const route of parsed.routes) {
        for (const waypoint of route.waypoints) {
          if ((waypoint.latitude === 0 || waypoint.longitude === 0) && apiKey) {
            // Build search query from street and destination
            const searchQuery = `${waypoint.street} ${waypoint.destination}`.trim();
            if (searchQuery) {
              const results = await geocodeAddress(apiKey, searchQuery, {
                lat: parsed.latitude,
                lng: parsed.longitude,
              });
              
              if (results.length > 0) {
                waypoint.longitude = results[0].center[0];
                waypoint.latitude = results[0].center[1];
                geocodedCount++;
              }
            }
          }
        }
      }

      setIsGeocoding(false);
      onImport(parsed);
      setImportOpen(false);
      setImportJson("");
      
      if (geocodedCount > 0) {
        toast.success(`JSON imported with ${geocodedCount} waypoint(s) geocoded`);
      } else {
        toast.success("JSON imported successfully");
      }
    } catch (error) {
      setIsGeocoding(false);
      toast.error("Invalid JSON format");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success("JSON copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy JSON");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `opr-${data.city.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON downloaded");
  };

  return (
    <div className="flex gap-2">
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import JSON
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import JSON</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your OPR JSON here..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="min-h-[300px] font-mono text-xs"
            />
            <Button onClick={handleImport} className="w-full" disabled={isGeocoding}>
              {isGeocoding ? "Geocoding waypoints..." : "Import"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export JSON</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              readOnly
              value={jsonString}
              className="min-h-[300px] font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button onClick={handleCopy} className="flex-1">
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
