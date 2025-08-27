// Simple authentication service for development
// This replaces the Devv AI auth temporarily

interface User {
  projectId: string;
  uid: string;
  name: string;
  email: string;
  createdTime: number;
  lastLoginTime: number;
}

class AuthService {
  private readonly OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private readonly STORAGE_KEY = 'azaan_otp_storage';

  private getUsers(): Map<string, { email: string; otp: string; timestamp: number }> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load OTP storage:', error);
    }
    return new Map();
  }

  private saveUsers(users: Map<string, { email: string; otp: string; timestamp: number }>): void {
    try {
      const data = Object.fromEntries(users);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save OTP storage:', error);
    }
  }

  async sendOTP(email: string): Promise<void> {
    // Generate a simple 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with timestamp
    const users = this.getUsers();
    users.set(email, {
      email,
      otp,
      timestamp: Date.now()
    });
    this.saveUsers(users);

    // In a real app, this would send an email
    // For now, we'll just log it to console
    console.log(`OTP for ${email}: ${otp}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async verifyOTP(email: string, code: string): Promise<{ user: User }> {
    const users = this.getUsers();
    const userData = users.get(email);
    
    if (!userData) {
      throw new Error('No OTP found for this email');
    }

    // Check if OTP is expired
    if (Date.now() - userData.timestamp > this.OTP_EXPIRY) {
      users.delete(email);
      this.saveUsers(users);
      throw new Error('OTP has expired');
    }

    // Check if OTP matches
    if (userData.otp !== code) {
      throw new Error('Invalid OTP');
    }

    // Create user object
    const user: User = {
      projectId: 'local-dev',
      uid: `user_${Date.now()}`,
      name: 'Admin User',
      email: email,
      createdTime: Date.now(),
      lastLoginTime: Date.now()
    };

    // Clear OTP after successful verification
    users.delete(email);
    this.saveUsers(users);

    return { user };
  }

  async logout(): Promise<void> {
    // Simple logout - just return
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export const authService = new AuthService();
