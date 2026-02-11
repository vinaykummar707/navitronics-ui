import { defaultDisplayConfigPostRequest } from "@/constants/defaultRouteValues";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
import { RouteCreationLayout } from "@/ui/components/RouteCreationLayout";
import React, { useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

// Define the type for expected route params
interface RouteParams extends Record<string, string> {
  areaId: string;
  depotId: string;
}

const RouteCreatePage: React.FC = () => {
  // Using `useParams` with a type parameter to ensure type safety
  const { areaId, depotId } = useParams<RouteParams>();

  // Logging the parameters to the console


  const methods = useForm<DisplayConfigPostRequest>({
    defaultValues: defaultDisplayConfigPostRequest,
  });

  const allData = methods.watch(); // Watch all form data

  useEffect(() => {
    console.log("Form Data Changed:", allData);
  }, [allData]);





  return (
    <FormProvider {...methods}>
      <div className=" bg-default-background h-screen w-screen overflow-hidden">
        <RouteCreationLayout />
      </div>
    </FormProvider>
  );
};

export default RouteCreatePage;
