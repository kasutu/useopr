import { Waypoint, SubLocalityType } from "@/types/opr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface WaypointManagerProps {
  waypoints: Waypoint[];
  selectedWaypointIndex: number | null;
  onWaypointsChange: (waypoints: Waypoint[]) => void;
  onSelectWaypoint: (index: number | null) => void;
  centerLat: number;
  centerLng: number;
}

export const WaypointManager = ({
  waypoints,
  selectedWaypointIndex,
  onWaypointsChange,
  onSelectWaypoint,
  centerLat,
  centerLng,
}: WaypointManagerProps) => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll selected waypoint card into view
  useEffect(() => {
    if (selectedWaypointIndex !== null && cardRefs.current[selectedWaypointIndex]) {
      cardRefs.current[selectedWaypointIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedWaypointIndex]);

  const addWaypoint = () => {
    const newWaypoint: Waypoint = {
      sequence: waypoints.length + 1,
      sub_locality: "Barangay TBD",
      sub_locality_type: "barangay",
      street: "Main St",
      destination: "Terminal",
      latitude: centerLat,
      longitude: centerLng,
    };
    onWaypointsChange([...waypoints, newWaypoint]);
    onSelectWaypoint(waypoints.length);
  };

  const deleteWaypoint = (index: number) => {
    const newWaypoints = waypoints
      .filter((_, i) => i !== index)
      .map((wp, i) => ({ ...wp, sequence: i + 1 }));
    onWaypointsChange(newWaypoints);
    if (selectedWaypointIndex === index) {
      onSelectWaypoint(null);
    }
  };

  const updateWaypoint = (index: number, field: keyof Waypoint, value: any) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = { ...newWaypoints[index], [field]: value };
    onWaypointsChange(newWaypoints);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Waypoints</h3>
        <Button size="sm" onClick={addWaypoint} disabled={waypoints.length >= 50}>
          <Plus className="h-4 w-4 mr-2" />
          Add Waypoint
        </Button>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {waypoints.map((waypoint, index) => (
          <Card
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            className={`p-3 cursor-pointer transition-colors ${
              selectedWaypointIndex === index ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => onSelectWaypoint(index)}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {waypoint.sequence}
                  </div>
                  <Label className="text-xs">Waypoint {waypoint.sequence}</Label>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Sub-locality</Label>
                    <Input
                      value={waypoint.sub_locality}
                      onChange={(e) => updateWaypoint(index, "sub_locality", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={waypoint.sub_locality_type}
                      onValueChange={(v) => updateWaypoint(index, "sub_locality_type", v as SubLocalityType)}
                    >
                      <SelectTrigger className="h-8" onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barangay">Barangay</SelectItem>
                        <SelectItem value="district">District</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Street</Label>
                    <Input
                      value={waypoint.street}
                      onChange={(e) => updateWaypoint(index, "street", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Destination</Label>
                    <Input
                      value={waypoint.destination}
                      onChange={(e) => updateWaypoint(index, "destination", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-8"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Lat
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        value={waypoint.latitude}
                        onChange={(e) =>
                          updateWaypoint(index, "latitude", parseFloat(e.target.value) || 0)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Lng
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        value={waypoint.longitude}
                        onChange={(e) =>
                          updateWaypoint(index, "longitude", parseFloat(e.target.value) || 0)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteWaypoint(index);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {waypoints.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No waypoints yet. Click "Add Waypoint" to get started.
          </p>
        )}
      </div>
    </div>
  );
};
