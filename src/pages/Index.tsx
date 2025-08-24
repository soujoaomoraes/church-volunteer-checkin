import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserMinus, Clock, Wifi, WifiOff, Users, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const mockStats = {
    checkedIn: 12,
    totalToday: 45,
    pendingItems: 8
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sistema de Voluntários</h1>
            <p className="text-muted-foreground">Igreja Central</p>
          </div>
        </div>

        {/* Status Card */}
        <Card className="border-0 shadow-md bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-foreground">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-foreground">Offline</span>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Última sync</p>
                <p className="text-xs font-medium">{lastSync.toLocaleTimeString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-success">{mockStats.checkedIn}</div>
              <div className="text-xs text-muted-foreground">Presentes</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-primary">{mockStats.totalToday}</div>
              <div className="text-xs text-muted-foreground">Hoje</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-warning">{mockStats.pendingItems}</div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Time */}
        <Card className="border-0 shadow-sm bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{new Date().toLocaleString('pt-BR')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Main Action Buttons */}
        <div className="space-y-4">
          <Button 
            variant="success"
            size="lg"
            className="w-full h-16 text-lg"
            onClick={() => navigate("/checkin")}
          >
            <UserPlus className="h-6 w-6" />
            Check-in
            <Badge variant="secondary" className="ml-auto">
              Entrada
            </Badge>
          </Button>

          <Button 
            variant="default"
            size="lg" 
            className="w-full h-16 text-lg"
            onClick={() => navigate("/checkout")}
          >
            <UserMinus className="h-6 w-6" />
            Check-out
            <Badge variant="outline" className="ml-auto">
              Saída
            </Badge>
          </Button>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Sistema funcionando normalmente</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            Sistema de Voluntários v1.0 • Igreja Central
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
