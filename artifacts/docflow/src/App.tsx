import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";

import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import Jobs from "@/pages/Jobs";
import DocumentDetail from "@/pages/DocumentDetail";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/upload" component={Upload} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/documents/:id" component={DocumentDetail} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster
          position="bottom-right"
          richColors
          expand={false}
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: "500",
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
