
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-gray">
      <div className="text-center bg-white p-8 rounded-lg shadow-card max-w-md">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
            <AlertTriangle size={32} />
          </div>
        </div>
        <h1 className="text-heading-1 font-bold text-black mb-2">404</h1>
        <p className="text-heading-3 text-dark-gray mb-4">Page not found</p>
        <p className="text-medium-gray mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild>
          <a href="/">Return to Dashboard</a>
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
