import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, LogOut, Clock, Save, Plus, Edit3, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { table } from '@devvai/devv-code-backend';

interface PrayerTime {
  _id?: string;
  _uid?: string;
  date: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  masjid_name: string;
  updated_at: number;
}

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const PRAYER_LABELS = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr', 
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha'
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime>({
    date: selectedDate,
    fajr: '05:30',
    dhuhr: '12:30',
    asr: '15:45',
    maghrib: '18:15',
    isha: '19:30',
    masjid_name: 'Local Masjid',
    updated_at: Date.now()
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingRecord, setExistingRecord] = useState<PrayerTime | null>(null);

  // Load prayer times for selected date
  useEffect(() => {
    loadPrayerTimes(selectedDate);
  }, [selectedDate]);

  const loadPrayerTimes = async (date: string) => {
    try {
      setIsLoading(true);
      const response = await table.getItems('ewa3uqhxhfy8', {
        query: { date },
        limit: 1
      });
      
      if (response.items.length > 0) {
        const record = response.items[0] as PrayerTime;
        setExistingRecord(record);
        setPrayerTimes(record);
        setIsEditing(true);
      } else {
        // No existing record, create new
        setExistingRecord(null);
        setPrayerTimes({
          date,
          fajr: '05:30',
          dhuhr: '12:30', 
          asr: '15:45',
          maghrib: '18:15',
          isha: '19:30',
          masjid_name: 'Local Masjid',
          updated_at: Date.now()
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error loading prayer times:', error);
      toast({
        title: "Error",
        description: "Failed to load prayer times for this date.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = (prayer: keyof typeof PRAYER_LABELS, value: string) => {
    setPrayerTimes(prev => ({
      ...prev,
      [prayer]: value,
      updated_at: Date.now()
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      if (isEditing && existingRecord) {
        // Update existing record
        await table.updateItem('ewa3uqhxhfy8', {
          _uid: existingRecord._uid,
          _id: existingRecord._id,
          ...prayerTimes
        });
        toast({
          title: "Prayer Times Updated",
          description: `Successfully updated prayer times for ${selectedDate}`,
        });
      } else {
        // Create new record
        await table.addItem('ewa3uqhxhfy8', prayerTimes);
        toast({
          title: "Prayer Times Saved", 
          description: `Successfully saved prayer times for ${selectedDate}`,
        });
        setIsEditing(true);
      }
      
      // Reload to get updated record
      await loadPrayerTimes(selectedDate);
      
    } catch (error) {
      console.error('Error saving prayer times:', error);
      toast({
        title: "Error",
        description: "Failed to save prayer times. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingRecord || !existingRecord._uid || !existingRecord._id) return;
    
    try {
      setIsLoading(true);
      await table.deleteItem('ewa3uqhxhfy8', {
        _uid: existingRecord._uid,
        _id: existingRecord._id
      });
      
      toast({
        title: "Prayer Times Deleted",
        description: `Deleted prayer times for ${selectedDate}`,
      });
      
      // Reset to new record state
      setExistingRecord(null);
      setIsEditing(false);
      setPrayerTimes({
        date: selectedDate,
        fajr: '05:30',
        dhuhr: '12:30',
        asr: '15:45', 
        maghrib: '18:15',
        isha: '19:30',
        masjid_name: 'Local Masjid',
        updated_at: Date.now()
      });
      
    } catch (error) {
      console.error('Error deleting prayer times:', error);
      toast({
        title: "Error",
        description: "Failed to delete prayer times. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              View User Page
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Date Selection
                  </CardTitle>
                  <CardDescription>
                    Select a date to manage prayer times
                  </CardDescription>
                </div>
                {isEditing && (
                  <Badge variant="secondary">
                    <Edit3 className="h-3 w-3 mr-1" />
                    Editing Existing
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="max-w-48"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="masjid">Masjid Name</Label>
                  <Input
                    id="masjid"
                    value={prayerTimes.masjid_name}
                    onChange={(e) => setPrayerTimes(prev => ({ ...prev, masjid_name: e.target.value }))}
                    placeholder="Enter masjid name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prayer Times Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Prayer Times for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
              <CardDescription>
                Set the prayer times for this date. All times should be in 24-hour format (HH:MM).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {PRAYER_NAMES.map((prayer) => (
                  <div key={prayer} className="space-y-2">
                    <Label htmlFor={prayer} className="text-sm font-medium">
                      {PRAYER_LABELS[prayer]}
                    </Label>
                    <Input
                      id={prayer}
                      type="time"
                      value={prayerTimes[prayer]}
                      onChange={(e) => handleTimeChange(prayer, e.target.value)}
                      className="text-lg font-mono"
                    />
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {existingRecord ? (
                    <>Last updated: {new Date(prayerTimes.updated_at).toLocaleString()}</>
                  ) : (
                    <>Creating new prayer times for {selectedDate}</>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {isEditing && existingRecord && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="min-w-24"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        {isEditing ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        {isEditing ? 'Update' : 'Save'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How the prayer times will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">{prayerTimes.masjid_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="grid grid-cols-5 gap-4">
                  {PRAYER_NAMES.map((prayer) => (
                    <div key={prayer} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                        {PRAYER_LABELS[prayer]}
                      </div>
                      <div className="text-lg font-mono font-semibold">
                        {prayerTimes[prayer]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}