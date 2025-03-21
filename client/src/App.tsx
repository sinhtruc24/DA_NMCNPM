import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import StudentPage from "@/pages/student-page";
import OrgPage from "@/pages/org-page";
import ActivitiesPage from "@/pages/activities-page";
import PointsPage from "@/pages/points-page";
import NotificationsPage from "@/pages/notifications-page";
import ComplaintsPage from "@/pages/complaints-page";
import CreateActivityPage from "@/pages/create-activity-page";
import SettingsPage from "@/pages/settings-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={() => {
        window.location.href = window.location.href + "student";
        return null;
      }} />
      <ProtectedRoute path="/student" component={StudentPage} allowedRole="student" />
      <ProtectedRoute path="/org" component={OrgPage} allowedRole="organization" />
      <ProtectedRoute path="/activities" component={ActivitiesPage} />
      <ProtectedRoute path="/points" component={PointsPage} allowedRole="student" />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/complaints" component={ComplaintsPage} />
      <ProtectedRoute path="/create-activity" component={CreateActivityPage} allowedRole="organization" />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
