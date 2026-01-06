import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { Destination } from "~/lib/mock-data";

interface SelectedDestinationsContextType {
  selectedDestinations: Destination[];
  addDestination: (destination: Destination) => void;
  removeDestination: (destinationId: string) => void;
  clearDestinations: () => void;
  isSelected: (destinationId: string) => boolean;
}

const SelectedDestinationsContext = createContext<SelectedDestinationsContextType | undefined>(undefined);

export function SelectedDestinationsProvider({ children }: { children: ReactNode }) {
  const [selectedDestinations, setSelectedDestinations] = useState<Destination[]>([]);

  const addDestination = useCallback((destination: Destination) => {
    setSelectedDestinations((prev) => {
      // 중복 방지
      if (prev.some((d) => d.id === destination.id)) {
        return prev;
      }
      return [...prev, destination];
    });
  }, []);

  const removeDestination = useCallback((destinationId: string) => {
    setSelectedDestinations((prev) => prev.filter((d) => d.id !== destinationId));
  }, []);

  const clearDestinations = useCallback(() => {
    setSelectedDestinations([]);
  }, []);

  const isSelected = useCallback(
    (destinationId: string) => {
      return selectedDestinations.some((d) => d.id === destinationId);
    },
    [selectedDestinations]
  );

  return (
    <SelectedDestinationsContext.Provider
      value={{
        selectedDestinations,
        addDestination,
        removeDestination,
        clearDestinations,
        isSelected,
      }}
    >
      {children}
    </SelectedDestinationsContext.Provider>
  );
}

export function useSelectedDestinations() {
  const context = useContext(SelectedDestinationsContext);
  if (context === undefined) {
    throw new Error("useSelectedDestinations must be used within a SelectedDestinationsProvider");
  }
  return context;
}

