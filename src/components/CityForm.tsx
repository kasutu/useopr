import { OPRData, IslandGroup, CityType } from "@/types/opr";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface CityFormProps {
  data: OPRData;
  onChange: (data: OPRData) => void;
  onSetCityFromMap: () => void;
  isSettingCity: boolean;
}

export const CityForm = ({ data, onChange, onSetCityFromMap, isSettingCity }: CityFormProps) => {
  const updateField = (field: keyof OPRData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">City Information</h3>
        <Button
          size="sm"
          variant={isSettingCity ? "default" : "outline"}
          onClick={onSetCityFromMap}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {isSettingCity ? "Setting..." : "Set from Map"}
        </Button>
      </div>

      <div className="grid gap-3">
        <div>
          <Label htmlFor="island">Island Group</Label>
          <Select value={data.island_group} onValueChange={(v) => updateField("island_group", v as IslandGroup)}>
            <SelectTrigger id="island">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Luzon">Luzon</SelectItem>
              <SelectItem value="Visayas">Visayas</SelectItem>
              <SelectItem value="Mindanao">Mindanao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              value={data.region}
              onChange={(e) => updateField("region", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="region-code">Region Code</Label>
            <Input
              id="region-code"
              value={data.region_code}
              onChange={(e) => updateField("region_code", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="province">Province</Label>
            <Input
              id="province"
              value={data.province}
              onChange={(e) => updateField("province", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="province-code">Province Code</Label>
            <Input
              id="province-code"
              value={data.province_code}
              onChange={(e) => updateField("province_code", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => updateField("city", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="city-type">City Type</Label>
            <Select value={data.city_type} onValueChange={(v) => updateField("city_type", v as CityType)}>
              <SelectTrigger id="city-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="highly_urbanized_city">Highly Urbanized City</SelectItem>
                <SelectItem value="component_city">Component City</SelectItem>
                <SelectItem value="municipality">Municipality</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="postal">Postal Code</Label>
            <Input
              id="postal"
              value={data.postal_code}
              onChange={(e) => updateField("postal_code", e.target.value)}
              maxLength={4}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="any"
              value={data.latitude}
              onChange={(e) => updateField("latitude", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              type="number"
              step="any"
              value={data.longitude}
              onChange={(e) => updateField("longitude", parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
