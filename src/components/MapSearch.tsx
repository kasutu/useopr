import { Card } from '@/components/ui/card';
import { geocodeAddress, GeocodingResult } from '@/utils/geocoding';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MapSearchProps {
  apiKey: string;
  proximity?: { lat: number; lng: number };
  onResultClick: (result: GeocodingResult) => void;
}

export const MapSearch = ({
  apiKey,
  proximity,
  onResultClick,
}: MapSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length > 2 && apiKey) {
        setIsSearching(true);
        const searchResults = await geocodeAddress(apiKey, query, proximity);
        setResults(searchResults);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, apiKey, proximity]);

  const handleResultClick = (result: GeocodingResult) => {
    onResultClick(result);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="absolute top-4 left-4 w-80 z-10">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search streets, landmarks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-background/95 backdrop-blur"
        />
      </div>

      {results.length > 0 && (
        <Card className="mt-2 max-h-60 overflow-y-auto bg-background/95 backdrop-blur">
          <div className="p-1">
            {results.map((result, index) => (
              <button
                key={index}
                onClick={() => handleResultClick(result)}
                className="w-full text-left px-3 py-2 hover:bg-secondary rounded-md transition-colors flex items-start gap-2"
              >
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.text}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {result.place_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
