import type { Route } from "./+types/destination.$id";
import { useParams, useNavigate } from "react-router";
import { MOCK_DESTINATIONS } from "~/lib/mock-data";
import { DestinationDetail } from "~/components/swipe/DestinationDetail";
import { useSelectedDestinations } from "~/lib/contexts/SelectedDestinationsContext";
import { useEffect, useState } from "react";
import type { Destination } from "~/lib/mock-data";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Destination Details - ${params.id}` },
    { name: "description", content: "View destination details" },
  ];
}

export default function DestinationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addDestination, removeDestination, isSelected } = useSelectedDestinations();
  const [destination, setDestination] = useState<Destination | null>(null);

  useEffect(() => {
    const dest = MOCK_DESTINATIONS.find((d) => d.id === id);
    if (dest) {
      setDestination(dest);
    }
  }, [id]);

  if (!destination) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-dark text-white">
        <p>여행지를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      addDestination(destination);
    } else {
      removeDestination(destination.id);
    }
    navigate("/");
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <DestinationDetail
      destination={destination}
      isOpen={true}
      onClose={handleClose}
      onSwipe={handleSwipe}
    />
  );
}

