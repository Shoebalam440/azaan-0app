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
    // For testing purposes, use a fixed OTP
    const otp = '123456';
    
    // Force clear any old data
    localStorage.removeItem(this.STORAGE_KEY);
    
    // Store OTP with timestamp
    const users = this.getUsers();
    users.set(email, {
      email,
      otp,
      timestamp: Date.now()
    });
    this.saveUsers(users);

    // Log OTP to console for easy testing
    console.log(`🔐 OTP for ${email}: ${otp}`);
    console.log(`📱 Use this OTP: ${otp}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async verifyOTP(email: string, code: string): Promise<{ user: User }> {
    console.log(`🔍 Verifying OTP for ${email} with code: ${code}`);
    
    const users = this.getUsers();
    const userData = users.get(email);
    
    console.log(`📊 Stored users:`, users);
    console.log(`📋 User data for ${email}:`, userData);
    
    if (!userData) {
      console.error(`❌ No OTP found for ${email}`);
      throw new Error('No OTP found for this email. Please send a new verification code.');
    }

    // Check if OTP is expired
    if (Date.now() - userData.timestamp > this.OTP_EXPIRY) {
      users.delete(email);
      this.saveUsers(users);
      console.error(`⏰ OTP expired for ${email}`);
      throw new Error('OTP has expired. Please send a new verification code.');
    }

    // Check if OTP matches
    console.log(`🔐 Comparing: "${userData.otp}" with "${code}"`);
    if (userData.otp !== code) {
      console.error(`❌ Invalid OTP for ${email}`);
      throw new Error('Invalid OTP. Please check the code and try again.');
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
