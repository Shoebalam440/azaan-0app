import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Clock, Bell, Settings, RefreshCw, Wifi, WifiOff, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePrayerStore } from '@/store/prayer-store';
import { notificationService } from '@/lib/notification-service';
import { InstallPrompt } from '@/components/InstallPrompt';
import { NotificationSettings } from '@/components/NotificationSettings';
import { formatTime12Hour } from '@/lib/utils';

interface PrayerTimeDisplay {
  name: string;
  time: string;
  arabic: string;
  isNext: boolean;
  isPassed: boolean;
  isCurrent: boolean;
}

function HomePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [azaanPlaying, setAzaanPlaying] = useState<string | null>(null);

  const {
    currentPrayerTimes,
    loading,
    error,
    fetchPrayerTimes,
    getCurrentPrayer,
    getTimeUntilNext
  } = usePrayerStore();

  // Prayer name translations
  const prayerTranslations = {
    Fajr: 'الفجر',
    Dhuhr: 'الظهر', 
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء'
  };

  useEffect(() => {
    // Initialize notification service and PWA features
    notificationService.initialize();
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Listen for azaan playing events
    const handleAzaanPlaying = (event: CustomEvent) => {
      setAzaanPlaying(event.detail.prayer);
      setTimeout(() => setAzaanPlaying(null), 5000); // Show for 5 seconds
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('azaan-playing', handleAzaanPlaying as EventListener);

    // Check notification permission status
    setNotificationsEnabled(notificationService.getPermissionStatus() === 'granted');

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('azaan-playing', handleAzaanPlaying as EventListener);
    };
  }, []);

  useEffect(() => {
    // Fetch prayer times for today on component mount
    const today = new Date().toISOString().split('T')[0];
    fetchPrayerTimes(today);
    setLastRefresh(new Date());
  }, [fetchPrayerTimes]);

  useEffect(() => {
    // Schedule notifications when prayer times change
    if (currentPrayerTimes && notificationsEnabled) {
      const prayerTimesForNotification = {
        fajr: currentPrayerTimes.fajr,
        dhuhr: currentPrayerTimes.dhuhr,
        asr: currentPrayerTimes.asr,
        maghrib: currentPrayerTimes.maghrib,
        isha: currentPrayerTimes.isha
      };
      notificationService.schedulePrayerNotifications(prayerTimesForNotification);
    }
  }, [currentPrayerTimes, notificationsEnabled]);

  const handleRefresh = async () => {
    const today = new Date().toISOString().split('T')[0];
    await fetchPrayerTimes(today);
    setLastRefresh(new Date());
    toast({
      title: "Refreshed",
      description: "Prayer times updated successfully.",
    });
  };

  const handleNotificationToggle = () => {
    setShowNotificationSettings(!showNotificationSettings);
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentPrayerTimes = (): PrayerTimeDisplay[] => {
    if (!currentPrayerTimes) return [];

    const currentPrayerInfo = getCurrentPrayer();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Fajr', time: currentPrayerTimes.fajr },
      { name: 'Dhuhr', time: currentPrayerTimes.dhuhr },
      { name: 'Asr', time: currentPrayerTimes.asr },
      { name: 'Maghrib', time: currentPrayerTimes.maghrib },
      { name: 'Isha', time: currentPrayerTimes.isha }
    ];

    return prayers.map(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      const isPassed = currentMinutes > prayerMinutes;
      const isNext = currentPrayerInfo?.next.name === prayer.name;
      const isCurrent = currentPrayerInfo?.name === prayer.name;

      return {
        name: prayer.name,
        time: formatTime12Hour(prayer.time),
        arabic: prayerTranslations[prayer.name as keyof typeof prayerTranslations],
        isPassed,
        isNext,
        isCurrent
      };
    });
  };

  const prayerTimes = getCurrentPrayerTimes();
  const currentPrayerInfo = getCurrentPrayer();
  const timeUntilNext = getTimeUntilNext();

  if (loading && !currentPrayerTimes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Azaan PWA</h1>
                  <p className="text-sm text-muted-foreground">Loading prayer times...</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {currentPrayerTimes?.masjid_name || 'Azaan PWA'}
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">Prayer Times & Notifications</p>
                  {isOnline ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 md:space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="hidden sm:flex"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="sm:hidden"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNotificationToggle}
                className="hidden sm:flex"
              >
                <Bell className="h-4 w-4 mr-2" />
                {notificationsEnabled ? 'On' : 'Off'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNotificationToggle}
                className="sm:hidden"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/admin/login')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
            <CardContent className="py-4">
              <div className="flex items-center space-x-2">
                <WifiOff className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Time Display */}
        <div className="text-center mb-8">
          <Card className="border-0 shadow-lg bg-primary/5">
            <CardContent className="py-8">
              <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                {formatTime(currentTime)}
              </div>
              <div className="text-lg text-muted-foreground">
                {formatDate(currentTime)}
              </div>
              {lastRefresh && (
                <div className="text-xs text-muted-foreground mt-2">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prayer Times Grid */}
        {prayerTimes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
            {prayerTimes.map((prayer) => (
              <Card 
                key={prayer.name}
                className={`
                  border-0 shadow-lg transition-all duration-250 hover:shadow-xl
                  ${prayer.isNext ? 'bg-accent border-accent-foreground/20 scale-105 ring-2 ring-accent' : ''}
                  ${prayer.isCurrent ? 'bg-primary/10 border-primary/30' : ''}
                  ${prayer.isPassed ? 'opacity-70' : ''}
                `}
              >
                <CardHeader className="pb-2 px-3 md:px-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg">{prayer.name}</CardTitle>
                    {prayer.isNext && (
                      <Badge variant="default" className="bg-accent text-accent-foreground text-xs">
                        Next
                      </Badge>
                    )}
                    {prayer.isCurrent && (
                      <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">{prayer.arabic}</div>
                </CardHeader>
                <CardContent className="px-3 md:px-6">
                  <div className="text-xl md:text-2xl font-bold text-primary">
                    {prayer.time}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {prayer.isPassed ? 'Completed' : 'Upcoming'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        )}

        {/* Next Prayer Countdown */}
        {currentPrayerInfo && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Next Prayer</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {currentPrayerInfo.next.name}
                </div>
                <div className="text-xl text-muted-foreground mb-4">
                  {timeUntilNext && `في ${timeUntilNext}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  Scheduled for {currentPrayerInfo.next.time}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Azaan Playing Notification */}
        {azaanPlaying && (
          <Card className="border-0 shadow-lg mb-6 bg-primary/10 border-primary/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-center space-x-2">
                <Bell className="h-5 w-5 text-primary animate-pulse" />
                <p className="text-primary font-medium">
                  Playing Azaan for {azaanPlaying} Prayer
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings Dialog */}
        {showNotificationSettings && (
          <div className="mb-6">
            <NotificationSettings />
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Smart Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Receive timely notifications for each prayer with beautiful Azaan audio.
              </p>
              <div className="flex items-center justify-between">
                <Badge variant={notificationsEnabled ? "default" : "secondary"}>
                  {notificationsEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNotificationToggle}
                >
                  Setup
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span>Real-time Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Prayer times are automatically updated by your masjid administration.
              </p>
              <div className="flex items-center justify-between">
                <Badge variant={isOnline ? "default" : "destructive"}>
                  {isOnline ? "Online" : "Offline"}
                </Badge>
                {!isOnline && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefresh}
                  >
                    Retry
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-primary" />
                <span>Install App</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Install this app on your device for quick access and better notifications.
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="default">
                  PWA Ready
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>


      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for the Muslim community
          </p>
          {currentPrayerTimes && (
            <p className="text-xs text-muted-foreground mt-1">
              Data updated: {new Date(currentPrayerTimes.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </footer>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

export default HomePage;