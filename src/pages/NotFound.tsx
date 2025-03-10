
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

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
          <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center text-primary">
            <AlertCircle size={32} />
          </div>
        </div>
        <h1 className="text-heading-1 font-bold text-black mb-2">Page Not Found</h1>
        <p className="text-body text-medium-gray mb-6">
          The page you're looking for doesn't exist or another error occurred. 
          Go back, or head to the home page to choose a new direction.
        </p>
        <Button asChild className="w-full">
          <a href="/">Back to Home</a>
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
