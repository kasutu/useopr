import { useState, useEffect } from "react";
import { OPRData, DEFAULT_OPR_DATA } from "@/types/opr";
import { MapView } from "@/components/MapView";
import { CityForm } from "@/components/CityForm";
import { RouteManager } from "@/components/RouteManager";
import { WaypointManager } from "@/components/WaypointManager";
import { SettingsDialog } from "@/components/SettingsDialog";
import { JsonManager } from "@/components/JsonManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("mapbox-api-key") || "");
  const [data, setData] = useState<OPRData>(() => {
    const saved = localStorage.getItem("opr-data");
    return saved ? JSON.parse(saved) : DEFAULT_OPR_DATA;
  });
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(() => {
    const saved = localStorage.getItem("opr-selected-route");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number | null>(() => {
    const saved = localStorage.getItem("opr-selected-waypoint");
    return saved ? JSON.parse(saved) : null;
  });
  const [isSettingCity, setIsSettingCity] = useState(false);

  useEffect(() => {
    localStorage.setItem("mapbox-api-key", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem("opr-data", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("opr-selected-route", JSON.stringify(selectedRouteIndex));
  }, [selectedRouteIndex]);

  useEffect(() => {
    localStorage.setItem("opr-selected-waypoint", JSON.stringify(selectedWaypointIndex));
  }, [selectedWaypointIndex]);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  const handleDataChange = (newData: OPRData) => {
    setData(newData);
  };

  const handleRoutesChange = (newRoutes: OPRData["routes"]) => {
    setData({ ...data, routes: newRoutes });
  };

  const handleWaypointsChange = (newWaypoints: OPRData["routes"][0]["waypoints"]) => {
    if (selectedRouteIndex === null) return;
    const newRoutes = [...data.routes];
    newRoutes[selectedRouteIndex] = { ...newRoutes[selectedRouteIndex], waypoints: newWaypoints };
    handleRoutesChange(newRoutes);
  };

  const handleWaypointMove = (index: number, lat: number, lng: number) => {
    if (selectedRouteIndex === null) return;
    const waypoints = [...data.routes[selectedRouteIndex].waypoints];
    waypoints[index] = { ...waypoints[index], latitude: lat, longitude: lng };
    handleWaypointsChange(waypoints);
  };

  const handleCityMove = (lat: number, lng: number) => {
    setData({ ...data, latitude: lat, longitude: lng });
    setIsSettingCity(false);
  };

  const currentWaypoints =
    selectedRouteIndex !== null ? data.routes[selectedRouteIndex].waypoints : [];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-[400px] border-r border-border bg-card overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">OPR Route Builder</h1>
              <SettingsDialog apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
            </div>
            <JsonManager data={data} onImport={handleDataChange} />
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="city" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="city">City</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="waypoints" disabled={selectedRouteIndex === null}>
                Waypoints
              </TabsTrigger>
            </TabsList>

            <TabsContent value="city" className="mt-4">
              <Card className="p-4">
                <CityForm
                  data={data}
                  onChange={handleDataChange}
                  onSetCityFromMap={() => setIsSettingCity(!isSettingCity)}
                  isSettingCity={isSettingCity}
                />
              </Card>
            </TabsContent>

            <TabsContent value="routes" className="mt-4">
              <Card className="p-4">
                <RouteManager
                  routes={data.routes}
                  selectedRouteIndex={selectedRouteIndex}
                  onRoutesChange={handleRoutesChange}
                  onSelectRoute={setSelectedRouteIndex}
                />
              </Card>
            </TabsContent>

            <TabsContent value="waypoints" className="mt-4">
              <Card className="p-4">
                {selectedRouteIndex !== null ? (
                  <WaypointManager
                    waypoints={currentWaypoints}
                    selectedWaypointIndex={selectedWaypointIndex}
                    onWaypointsChange={handleWaypointsChange}
                    onSelectWaypoint={setSelectedWaypointIndex}
                    centerLat={data.latitude}
                    centerLng={data.longitude}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Select a route first to manage waypoints
                  </p>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapView
          apiKey={apiKey}
          centerLat={data.latitude}
          centerLng={data.longitude}
          waypoints={currentWaypoints}
          selectedWaypointIndex={selectedWaypointIndex}
          onWaypointMove={handleWaypointMove}
          onWaypointSelect={setSelectedWaypointIndex}
          onCityMove={handleCityMove}
          showCityMarker={isSettingCity}
        />
      </div>
    </div>
  );
};

export default Index;
