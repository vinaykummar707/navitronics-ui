import { defaultDisplayConfigPostRequest } from "@/constants/defaultRouteValues";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import useSimulationStore from "@/store/useSimulationStore";
import { supabase } from "@/supabaseClient";
import { IRouteCreate } from "@/types/IRoute";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
import { RouteCreationLayout } from "@/ui/components/RouteCreationLayout";
import React, { useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
// @subframe/sync-disable

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
  const user = useLoggedUserStore((state) => state.user); // Zustand store

  // Logging the parameters to the console
  console.log("Route Parameters:", { areaId, depotId });

  const methods = useForm<IRouteCreate>({
    defaultValues: {
      ...defaultDisplayConfigPostRequest,
      organization_id: areaId,
      depot_id: depotId,
      created_by: user?.id || "",
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

  // [UX-01]: Warn user before closing/reloading tab if route form has unsaved edits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (methods.formState.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [methods.formState.isDirty]);

  // [UX-03]: Reset global simulation store state when navigating away
  useEffect(() => {
    return () => {
      useSimulationStore.getState().reset();
    };
  }, []);

  return (
    <FormProvider {...methods}>
      <div className=" bg-default-background h-screen w-screen overflow-hidden">
        <RouteCreationLayout mode={mode} />
      </div>
    </FormProvider>
  );
};

export default RouteCreatePage;
