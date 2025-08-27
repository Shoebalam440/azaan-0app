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
  private users: Map<string, { email: string; otp: string; timestamp: number }> = new Map();
  private readonly OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

  async sendOTP(email: string): Promise<void> {
    // Generate a simple 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with timestamp
    this.users.set(email, {
      email,
      otp,
      timestamp: Date.now()
    });

    // In a real app, this would send an email
    // For now, we'll just log it to console
    console.log(`OTP for ${email}: ${otp}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async verifyOTP(email: string, code: string): Promise<{ user: User }> {
    const userData = this.users.get(email);
    
    if (!userData) {
      throw new Error('No OTP found for this email');
    }

    // Check if OTP is expired
    if (Date.now() - userData.timestamp > this.OTP_EXPIRY) {
      this.users.delete(email);
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
    this.users.delete(email);

    return { user };
  }

  async logout(): Promise<void> {
    // Simple logout - just return
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export const authService = new AuthService();
