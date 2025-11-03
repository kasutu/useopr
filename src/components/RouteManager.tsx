import { Route } from "@/types/opr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RouteManagerProps {
  routes: Route[];
  selectedRouteIndex: number | null;
  onRoutesChange: (routes: Route[]) => void;
  onSelectRoute: (index: number | null) => void;
}

export const RouteManager = ({
  routes,
  selectedRouteIndex,
  onRoutesChange,
  onSelectRoute,
}: RouteManagerProps) => {
  const addRoute = () => {
    const newRoute: Route = {
      route_code: (routes.length + 1).toString().padStart(2, "0"),
      name: `Route ${routes.length + 1}`,
      waypoints: [],
    };
    onRoutesChange([...routes, newRoute]);
    onSelectRoute(routes.length);
  };

  const deleteRoute = (index: number) => {
    const newRoutes = routes.filter((_, i) => i !== index);
    onRoutesChange(newRoutes);
    if (selectedRouteIndex === index) {
      onSelectRoute(null);
    }
  };

  const updateRoute = (index: number, field: keyof Route, value: string) => {
    const newRoutes = [...routes];
    newRoutes[index] = { ...newRoutes[index], [field]: value };
    onRoutesChange(newRoutes);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Routes</h3>
        <Button size="sm" onClick={addRoute}>
          <Plus className="h-4 w-4 mr-2" />
          Add Route
        </Button>
      </div>

      <div className="space-y-2">
        {routes.map((route, index) => (
          <Card
            key={index}
            className={`p-3 cursor-pointer transition-colors ${
              selectedRouteIndex === index ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => onSelectRoute(index)}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <Label className="text-xs">Code</Label>
                    <Input
                      value={route.route_code}
                      onChange={(e) => updateRoute(index, "route_code", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-8"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={route.name}
                      onChange={(e) => updateRoute(index, "name", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {route.waypoints.length} waypoint(s)
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRoute(index);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {routes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No routes yet. Click "Add Route" to get started.
          </p>
        )}
      </div>
    </div>
  );
};
