import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRole,
}: {
  path: string;
  component: React.FC;
  allowedRole?: "student" | "organization";
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !user ? (
        <Redirect to="/auth" />
      ) : allowedRole && user.role !== allowedRole ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-center">
            You don't have permission to access this page.
          </p>
          {user.role === "student" ? (
            <Redirect to="/student" />
          ) : (
            <Redirect to="/org" />
          )}
        </div>
      ) : (
        <Component />
      )}
    </Route>
  );
}
