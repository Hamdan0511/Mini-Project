
# EcoEvaluator 🌍

EcoEvaluator is a cutting-edge web application that bridges the gap between environmental consciousness and property valuation. Using advanced AI, real-time environmental data, and stunning 3D visualizations, it helps users understand their land's ecological footprint and future value.

## 🚀 Features

- **3D Earth Visualization**: Interactive 3D globe with real-time environmental data overlay
- **GPS-Based Analysis**: Extract location data from uploaded images for precise analysis
- **Environmental Metrics**: Air quality, weather, vegetation index, and more
- **Property Valuation**: AI-powered value projections based on environmental factors
- **AI Assistant**: EcoBot chat interface for environmental queries
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Data**: Integration with environmental APIs for live data

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Image Processing**: EXIF data extraction with exifr

### Backend
- **Runtime**: Node.js (via Next.js API routes)
- **APIs**: RESTful API endpoints for environmental data
- **External Services**: Integration with environmental data providers

### Development Tools
- **Linting**: ESLint with Next.js configuration
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: npm
- **Version Control**: Git

## 📁 Project Structure

```
ecoevaluator/
├── app/                          # Next.js app directory
│   ├── about/                    # About page
│   │   └── page.tsx
│   ├── api/                      # API routes
│   │   ├── assistant/            # AI assistant endpoint
│   │   │   └── route.ts
│   │   ├── chat/                 # Chat functionality
│   │   │   └── route.ts
│   │   ├── ecobot/               # EcoBot API
│   │   │   └── route.ts
│   │   ├── environment/          # Environmental data API
│   │   │   └── route.ts
│   │   ├── search/               # Property search API
│   │   │   └── route.ts
│   │   ├── summary/              # Analysis summary API
│   │   │   └── route.ts
│   │   └── value/                # Property value API
│   │       └── route.ts
│   ├── contact/                  # Contact page
│   │   └── page.tsx
│   ├── dashboard/                # Dashboard page
│   │   └── page.tsx
│   ├── search/                   # Search page
│   │   └── page.tsx
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ChatBox.tsx               # AI chat interface
│   ├── Earth2050.tsx             # 3D Earth component
│   ├── GPSMarker.tsx             # GPS location marker
│   ├── ImageUpload.tsx           # Image upload with GPS extraction
│   ├── Navigation.tsx            # Navigation component
│   ├── PageWrapper.tsx           # Page layout wrapper
│   ├── RealisticEarth2050.tsx    # Enhanced 3D Earth
│   ├── RealisticEarthScene.tsx   # 3D scene setup
│   ├── ResultsPanel.tsx          # Analysis results display
│   ├── Scene.tsx                 # 3D scene component
│   ├── SearchBar.tsx             # Search functionality
│   └── SimpleEarthScene.tsx      # Simplified 3D scene
├── public/                       # Static assets
│   └── images/                   # Earth texture images
│       ├── earth_atmos_2048.jpg
│       ├── earth_lights_2048.png
│       └── earth_normal_2048.jpg
├── scripts/                      # Utility scripts
│   └── generate_ai2_ppt.py       # PPT generation script
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── next-env.d.ts                 # Next.js TypeScript definitions
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS configuration
├── PROJECT_SUMMARY.md            # Project summary
├── README.md                     # This file
├── tailwind.config.ts            # Tailwind CSS configuration
├── TEXTURES_README.md            # Texture assets documentation
├── TODO.md                       # Development tasks
└── tsconfig.json                 # TypeScript configuration
```

## 🏗️ Architecture

### Frontend Architecture
- **Component-Based**: Modular React components with TypeScript
- **Page-Based Routing**: Next.js file-based routing system
- **Client-Side Rendering**: Optimized for interactive 3D content
- **Responsive Layout**: Mobile-first design with Tailwind CSS

### API Architecture
- **RESTful Endpoints**: Clean API design for data operations
- **Serverless Functions**: Next.js API routes for backend logic
- **External Integrations**: Connection to environmental data services
- **Error Handling**: Comprehensive error management and user feedback

### Data Flow
1. User uploads image with GPS metadata
2. Frontend extracts coordinates using EXIF data
3. API calls fetch environmental data (air quality, weather, vegetation)
4. AI analysis generates property value projections
5. Results displayed with 3D visualization and summary

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecoevaluator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Add required API keys for environmental data services

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 🔧 Configuration

### Next.js Configuration
- Custom webpack settings for Three.js optimization
- Image optimization settings
- API route configuration

### Tailwind CSS Configuration
- Custom color palette (neon green theme)
- Dark mode support
- Responsive breakpoints

### ESLint Configuration
- Next.js recommended rules
- TypeScript support
- Custom linting rules for code quality

## 🌐 API Endpoints

### Environmental Data
- `POST /api/environment` - Fetch environmental metrics for coordinates
- `POST /api/value` - Get property value analysis
- `POST /api/summary` - Generate analysis summary

### AI Features
- `POST /api/assistant` - AI-powered environmental queries
- `POST /api/chat` - Chat functionality
- `POST /api/ecobot` - EcoBot interactions

### Search
- `GET /api/search` - Property search with filters

## 🎨 Design System

### Colors
- **Primary**: Neon Green (#00FF99)
- **Background**: Dark (#000000)
- **Secondary**: Green variants for UI elements

### Typography
- **Font Family**: System fonts with fallbacks
- **Hierarchy**: Responsive text sizing
- **Accessibility**: High contrast ratios

### Components
- **Glass Morphism**: Semi-transparent UI elements
- **3D Effects**: Depth and shadows for modern look
- **Animations**: Smooth transitions and micro-interactions

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for tablets
- **Desktop Enhancement**: Advanced features for larger screens
- **Touch Friendly**: Gesture support and touch targets

## 🔒 Security

- **API Key Management**: Secure storage of external service keys
- **Input Validation**: Client and server-side validation
- **CORS Configuration**: Proper cross-origin resource sharing
- **Data Sanitization**: Protection against malicious inputs

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
- Compatible with Netlify, AWS Amplify, and other hosting platforms
- Docker support for containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Environmental data providers
- Open source community
- Three.js and React communities
- Next.js team for the amazing framework

## 📞 Support

For support, email info@ecoevaluator.com or join our Discord community.

---

**Built with ❤️ for a sustainable future** 🌱
>>>>>>> aa61d0f (fixed eslint apostrophe error)
