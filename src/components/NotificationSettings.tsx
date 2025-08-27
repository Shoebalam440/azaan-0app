import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Volume2, TestTube } from 'lucide-react';
import { notificationService } from '@/lib/notification-service';
import { useToast } from '@/hooks/use-toast';

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();
    
    // Check current permission status
    const currentPermission = notificationService.getPermissionStatus();
    setPermission(currentPermission);
    setNotificationsEnabled(currentPermission === 'granted');
  }, []);

  const handleNotificationToggle = async () => {
    if (!notificationService.isNotificationSupported()) {
      toast({
        title: "Not Supported",
        description: "Notifications are not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (permission !== 'granted') {
        const newPermission = await notificationService.requestPermission();
        setPermission(newPermission);
        
        if (newPermission === 'granted') {
          setNotificationsEnabled(true);
          toast({
            title: "Notifications Enabled",
            description: "You'll receive prayer time notifications.",
          });
        } else {
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive",
          });
        }
      } else {
        // Toggle notifications (in a real app, you'd have a setting stored)
        setNotificationsEnabled(!notificationsEnabled);
        
        if (!notificationsEnabled) {
          toast({
            title: "Notifications Enabled",
            description: "Prayer time notifications are now active.",
          });
        } else {
          toast({
            title: "Notifications Disabled",
            description: "Prayer time notifications are turned off.",
          });
          notificationService.clearNotifications();
        }
      }
    } catch (error) {
      console.error('Notification toggle error:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.showTestNotification();
      toast({
        title: "Test Sent",
        description: "Check your notifications!",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Please enable notifications first.",
        variant: "destructive",
      });
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge variant="default" className="bg-green-500">Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="secondary">Not Set</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {notificationsEnabled ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          Prayer Notifications
        </CardTitle>
        <CardDescription>
          Receive notifications at prayer times with Azaan audio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">Enable Notifications</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              Permission: {getPermissionBadge()}
            </div>
          </div>
          <Switch
            checked={notificationsEnabled && permission === 'granted'}
            onCheckedChange={handleNotificationToggle}
            disabled={isLoading}
          />
        </div>

        {permission === 'granted' && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Notification
            </Button>
          </div>
        )}

        {permission === 'denied' && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <strong>Notifications are blocked.</strong><br />
              To enable: Click the lock icon in your browser's address bar, then allow notifications.
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Volume2 className="h-3 w-3" />
            Notifications include Azaan audio playback
          </div>
        </div>
      </CardContent>
    </Card>
  );
}