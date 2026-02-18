import { defaultDisplayConfigPostRequest } from "@/constants/defaultRouteValues";
import { supabase } from "@/supabaseClient";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
import { RouteCreationLayout } from "@/ui/components/RouteCreationLayout";
import React, { useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

// Define the type for expected route params
interface RouteParams extends Record<string, string> {
  areaId: string;
  depotId: string;
  routeId?: string; // Optional routeId
}

const RouteCreatePage: React.FC = ({ initialData }) => {
  // Using `useParams` with a type parameter to ensure type safety
  const { areaId, depotId, routeId } = useParams<RouteParams>();
  const [mode, setMode] = React.useState<"create" | "edit">("create");

  // Logging the parameters to the console
  console.log("Route Parameters:", { areaId, depotId });

  const methods = useForm<DisplayConfigPostRequest>({
    defaultValues: {
      ...defaultDisplayConfigPostRequest,
      organization_id: areaId,
      depot_id: depotId,
    },
  });

  const reset = methods.reset;

  useEffect(() => {
    if (routeId) {
      const fetchRoute = async () => {
        const { data, error } = await supabase
          .from("routes")
          .select("*")
          .eq("id", routeId)
          .single();

        if (error) {
          console.error("Error fetching route:", error);
          return;
        }

        methods.reset({
          ...data,
          front: data.front ? JSON.parse(data.front) : null,
          rear: data.rear ? JSON.parse(data.rear) : null,
          side: data.side ? JSON.parse(data.side) : null,
          internal: data.internal ? JSON.parse(data.internal) : null,
          stops: data.stops ? JSON.parse(data.stops) : null,
        });
        setMode("edit");
      };

      fetchRoute();
    }
  }, [routeId, methods]);

  return (
    <FormProvider {...methods}>
      <div className=" bg-default-background h-screen w-screen overflow-hidden">
        <RouteCreationLayout mode={mode} />
      </div>
    </FormProvider>
  );
};

export default RouteCreatePage;
