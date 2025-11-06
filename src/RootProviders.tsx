import React, { useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootProviders({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside a component using lazy init to avoid module-scope hooks/state
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
