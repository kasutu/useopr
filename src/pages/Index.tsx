import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CityForm } from '@/components/CityForm';
import { DEFAULT_OPR_DATA, OPRData } from '@/types/opr';
import { JsonManager } from '@/components/JsonManager';
import { MapView } from '@/components/MapView';
import { RouteManager } from '@/components/RouteManager';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
  } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { WaypointManager } from '@/components/WaypointManager';

const Index = () => {
  // ALL HOOKS MUST BE DECLARED AT THE TOP LEVEL, BEFORE ANY CONDITIONAL RETURNS
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OPRData>(() => {
    const saved = localStorage.getItem('opr-data');
    return saved ? JSON.parse(saved) : DEFAULT_OPR_DATA;
  });
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(
    () => {
      const saved = localStorage.getItem('opr-selected-route');
      return saved ? JSON.parse(saved) : null;
    }
  );
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<
    number | null
  >(() => {
    const saved = localStorage.getItem('opr-selected-waypoint');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSettingCity, setIsSettingCity] = useState(false);
  const [currentMapCenter, setCurrentMapCenter] = useState(() => ({
    lat: data.latitude,
    lng: data.longitude,
  }));

  // ALL EFFECTS MUST BE DECLARED AT THE TOP LEVEL
  useEffect(() => {
    const validateApiKey = async () => {
      try {
        // Simulate async loading for better UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        const key = import.meta.env.VITE_MAPBOX_API_KEY;

        if (!key || key.trim() === '') {
          throw new Error(
            'Mapbox API key is not configured. Please set VITE_MAPBOX_API_KEY in your .env file'
          );
        }

        setApiKey(key);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load API configuration'
        );
      } finally {
        setIsLoading(false);
      }
    };

    validateApiKey();
  }, []);

  useEffect(() => {
    localStorage.setItem('opr-data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(
      'opr-selected-route',
      JSON.stringify(selectedRouteIndex)
    );
  }, [selectedRouteIndex]);

  useEffect(() => {
    localStorage.setItem(
      'opr-selected-waypoint',
      JSON.stringify(selectedWaypointIndex)
    );
  }, [selectedWaypointIndex]);

  // CONDITIONAL LOGIC COMES AFTER ALL HOOKS
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid h-screen place-content-center bg-background p-4 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-destructive" />
        <h2 className="mb-1 text-lg font-semibold text-destructive">
          Missing Mapbox key
        </h2>
        <p className="text-sm text-muted-foreground">Add it and redeploy.</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  const handleDataChange = (newData: OPRData) => {
    setData(newData);
  };

  const handleRoutesChange = (newRoutes: OPRData['routes']) => {
    setData({ ...data, routes: newRoutes });
  };

  const handleWaypointsChange = (
    newWaypoints: OPRData['routes'][0]['waypoints']
  ) => {
    if (selectedRouteIndex === null) return;
    const newRoutes = [...data.routes];
    newRoutes[selectedRouteIndex] = {
      ...newRoutes[selectedRouteIndex],
      waypoints: newWaypoints,
    };
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
    // Update map center when city moves
    setCurrentMapCenter({ lat, lng });
  };

  const currentWaypoints =
    selectedRouteIndex !== null
      ? data.routes[selectedRouteIndex].waypoints
      : [];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-[400px] border-r border-border bg-card overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">OPR Route Builder</h1>
            </div>
            <JsonManager
              data={data}
              onImport={handleDataChange}
              apiKey={apiKey}
            />
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="city" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="city">City</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger
                value="waypoints"
                disabled={selectedRouteIndex === null}
              >
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
                    centerLat={currentMapCenter.lat}
                    centerLng={currentMapCenter.lng}
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
          onMapCenterChange={(lat, lng) => setCurrentMapCenter({ lat, lng })}
        />
      </div>
    </div>
  );
};

export default Index;
