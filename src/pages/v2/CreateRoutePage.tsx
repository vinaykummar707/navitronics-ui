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
interface RouteParams extends Record<string, string | undefined> {
  areaId?: string;
  depotId?: string;
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
      organization_id: areaId || null,
      depot_id: depotId || null,
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

        const parseConfig = (val: any) => {
          if (!val) return null;
          if (typeof val === "object") return val;
          try {
            return JSON.parse(val);
          } catch (e) {
            console.warn("Could not parse route signboard config string:", e);
            return null;
          }
        };

        methods.reset({
          ...data,
          front: parseConfig(data.front),
          rear: parseConfig(data.rear),
          side: parseConfig(data.side),
          internal: parseConfig(data.internal),
          stops: parseConfig(data.stops),
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
      <div className="bg-default-background h-[100dvh] min-h-[100dvh] w-full overflow-hidden">
        <RouteCreationLayout mode={mode} />
      </div>
    </FormProvider>
  );
};

export default RouteCreatePage;
