import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@app/controllers/AuthController";
import { useTheme } from "next-themes";
import { ArrowLeft, Settings, LogOut, Sun, Moon, Users } from "lucide-react";
import { branding } from "@/values/config/branding";
import { cn } from "@app/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";

interface AppHeaderProps {
  showBack?: boolean;
  backPath?: string;
  title?: string;
  icon?: React.ElementType;
  showEnterpriseInfo?: boolean; // If true, shows Enterprise name and Profile name
  rightActions?: ReactNode;
  showDefaultActions?: boolean; // Settings, Team, Logout
  fullWidth?: boolean;
  compact?: boolean;
}

export const AppHeader = ({
  showBack,
  backPath = "/app",
  title,
  icon: Icon,
  showEnterpriseInfo,
  rightActions,
  showDefaultActions,
  fullWidth = false,
  compact = false
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const { enterprise, profile, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className={cn(
      "shrink-0 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border transition-all",
      compact ? "h-14" : ""
    )}>
      <div className={cn(
        "px-4 md:px-6 flex items-center justify-between h-full w-full",
        !fullWidth && "max-w-6xl mx-auto",
        !compact && "h-16"
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          {showBack && (
            <button
              onClick={() => navigate(backPath)}
              className="p-2 -ml-2 rounded-lg hover:bg-secondary/50 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <img src={branding.logo} alt={branding.name} className={cn("object-contain rounded-sm shrink-0", compact ? "h-6" : "h-7")} />
          
          {enterprise?.logo && (
            <>
              <div className={cn("w-px bg-border mx-1 shrink-0", compact ? "h-4" : "h-5")}></div>
              <img 
                src={enterprise.logo.url.startsWith("http") ? enterprise.logo.url : `${API_URL}${enterprise.logo.url}`} 
                alt={enterprise.name} 
                className={cn("rounded-md object-cover shrink-0", compact ? "h-6 w-6" : "h-7 w-7")} 
              />
            </>
          )}

          {showEnterpriseInfo && enterprise && (
            <div className="border-l border-border pl-3 ml-1 truncate">
              <h1 className="text-sm font-semibold leading-none truncate">{enterprise.name}</h1>
              <p className="text-xs text-muted-foreground truncate">{profile?.fullname}</p>
            </div>
          )}

          {title && (
            <>
              <div className={cn("w-px bg-border mx-1 shrink-0", compact ? "h-4" : "h-5")}></div>
              <div className="flex items-center gap-2 truncate">
                {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
                <h1 className="text-sm font-semibold truncate">{title}</h1>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto pl-4 shrink-0">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Mudar Tema"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          {rightActions}

          {showDefaultActions && (
            <div className="flex items-center gap-2 sm:gap-4 ml-2 sm:ml-4">
              <div className="h-4 w-px bg-border hidden sm:block"></div>
              <button
                onClick={() => navigate("/app/team")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Equipe</span>
              </button>
              <button
                onClick={() => navigate("/app/settings")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Configurações</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
