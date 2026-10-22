const realFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (/supabase|\/rest\/v1|\/auth\/v1|\/storage\/v1/.test(url)) {
    return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return realFetch(input, init);
};

import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../index.css";
import { LanguageConfigProvider } from "../context/LanguageConfigContext";
import RouteCreatePage from "../pages/v2/CreateRoutePage";

const qc = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light">
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/route/a/d/create"]}>
        <LanguageConfigProvider>
          <Routes>
            <Route path="/route/:areaId/:depotId/create" element={<RouteCreatePage />} />
          </Routes>
        </LanguageConfigProvider>
      </MemoryRouter>
      <ToastContainer />
    </QueryClientProvider>
  </ThemeProvider>
);
