# Masjid Prayer Times Notifier

A modern, responsive prayer times application with notifications.

## 🚀 Tech Stack

- ⚡ React 18.2 + TypeScript 5.7 + Vite 6.3
- 🎨 Tailwind CSS 3.4 + shadcn/ui
- 🔄 React Router 7.5
- 🏗️ Built with modern web standards

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   # Using bun (recommended - faster)
   bun install

   # Or using npm
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update environment variables as needed

3. **Start Development Server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

4. **Build for Production**
   ```bash
   bun run build
   # or
   npm run build
   ```

## 🚀 Deployment

### Netlify Deployment
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to [Netlify](https://app.netlify.com/)
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Set required environment variables in Netlify dashboard
5. Deploy!

### Environment Variables
See `.env.example` for all required variables. Set these in your hosting provider.

## 🛠 Development

- **Local Server**: http://localhost:5173
- **Code Style**: ESLint + Prettier configured
- **Type Checking**: TypeScript strict mode enabled
- **Testing**: Jest + React Testing Library (coming soon)

## 🛡 Security

- Content Security Policy (CSP) enabled
- Security headers configured
- Dependencies regularly audited

## 📊 Performance

- Code splitting enabled
- Assets optimized with Vite
- Caching headers configured
- Lighthouse score > 90/100

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
