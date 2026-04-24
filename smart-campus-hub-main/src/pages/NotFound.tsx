import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, Building2, Calendar, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen campus-gradient flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Smart Campus Hub
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
              Welcome to the <span className="text-secondary">Future</span> of Campus Life
            </h1>
            <p className="text-xl text-white/70 max-w-lg">
              Manage facilities, book resources, and track maintenance tickets with our all-in-one smart campus operations hub.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-white px-8 rounded-full h-14 text-lg font-semibold shadow-lg shadow-secondary/20 transition-all hover:scale-105"
              onClick={() => navigate("/")}
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 rounded-full h-14 text-lg font-semibold backdrop-blur-sm"
              onClick={() => navigate("/")}
            >
              Explore Assets
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10">
            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Building2 className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm font-medium">Facilities</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Calendar className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm font-medium">Bookings</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Wrench className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm font-medium">Maintenance</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <GraduationCap className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm font-medium">Students</span>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block animate-float">
          <div className="absolute -inset-4 bg-secondary/20 blur-3xl rounded-full" />
          <img 
            src="/campus_welcome_hero_1777024074749.png" 
            alt="Smart Campus Hero" 
            className="relative w-full h-auto drop-shadow-2xl rounded-3xl"
          />
        </div>
      </div>

      <div className="absolute bottom-8 text-white/40 text-sm">
        Oops! Looks like you took a wrong turn, but welcome back anyway.
      </div>
    </div>
  );
};

export default NotFound;
