# PDF Annotator - Frontend

A modern, production-ready React application for PDF file management and viewing with role-based access control.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check
```

## ✨ Features

- 📄 **PDF Upload & Management** - Upload, view, and delete PDF files
- 👥 **Role-Based Access** - Four user roles (A1, D1, D2, R1) with different permissions
- 📱 **Modern UI** - Clean, responsive design with Tailwind CSS and shadcn/ui
- 🎨 **Design System** - Modern component library with consistent theming
- ⚡ **Optimized Build** - Code splitting and lazy loading
- 🛡️ **Type Safe** - Full TypeScript strict mode
- 🔍 **Error Handling** - Error boundaries and custom error classes

## 🏗️ Tech Stack

- **React 18.3.1** - Modern React with hooks
- **TypeScript 5.6.2** - Strict type checking
- **Vite 5.4.8** - Fast build tool and dev server
- **React Router 6.26.2** - Client-side routing
- **react-pdf 9.1.1** - PDF viewing with navigation
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── ErrorBoundary/   # Error boundary wrapper
│   ├── FileList/        # File list display
│   ├── FileUploader/    # File upload form
│   └── Header/          # App header with role switcher
├── contexts/            # React contexts
│   └── UserContext.tsx  # User role management
├── pages/               # Page components
│   ├── Dashboard/       # Main dashboard
│   └── PdfViewer/       # PDF viewer page
├── styles/              # Global styles
│   └── globals.css      # Global CSS with Tailwind and CSS variables
├── types/               # TypeScript types
│   ├── index.ts         # Shared types
│   └── css.d.ts         # CSS module types
├── utils/               # Utility functions
│   └── api.ts           # API client
├── App.tsx              # Root component
└── main.tsx             # Entry point
```

## 🎨 Styling Architecture

This project uses a hybrid approach:
- **Tailwind CSS** - Utility-first styling for modern components
- **shadcn/ui** - Pre-built, accessible React components
- **CSS Modules** - Legacy component styling (being phased out)

New components use Tailwind and shadcn/ui:
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

<Card className="p-4">
  <Button variant="primary">Click me</Button>
</Card>
```

Design tokens are defined in `src/styles/globals.css` using CSS variables for both Tailwind and legacy components.

## 🔧 Configuration

### Environment Variables

Create a `.env` file:
```env
VITE_API_URL=http://localhost:4000/api
```

### Path Aliases

Configured in `vite.config.ts` and `tsconfig.app.json`:
```typescript
import { Header } from '@components/Header';
import { useUserContext } from '@contexts/UserContext';
import type { Role } from '@/types';
```

## 📚 Key Features

- **PDF Annotations** - Highlight, comment, and draw on PDFs
- **Visibility Control** - Private or shared annotations with role-based access
- **Toast Notifications** - User-friendly feedback system
- **Responsive Design** - Works seamlessly on all devices

## 🧪 Testing

### Manual Testing Checklist
- [ ] User role switching works
- [ ] File upload (A1 only)
- [ ] File list displays correctly
- [ ] PDF viewer with navigation
- [ ] File deletion (A1 only)
- [ ] Responsive design
- [ ] Error handling

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output in `dist/` directory:
- Optimized bundles with code splitting
- Separate vendor chunks (react, pdf)
- Source maps for debugging
- Gzipped assets

### Deploy to Netlify/Vercel
```bash
# Build command
npm run build

# Publish directory
dist
```

## 🎯 User Roles

- **A1 (Admin)** - Full access: upload, view, delete
- **D1, D2 (Developers)** - View only
- **R1 (Reviewer)** - View only

## 🛠️ Development

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Tailwind CSS for styling
- Functional components with hooks
- shadcn/ui for UI components

### Performance
- Code splitting (react-vendor, pdf-vendor)
- Lazy loading of routes
- Memoization with useMemo/useCallback
- Optimized re-renders

## 📦 Build Output

```
dist/
├── index.html                     0.62 kB
├── assets/
│   ├── index-*.css               20.27 kB (gzip: 4.20 kB)
│   ├── index-*.js                 9.81 kB (gzip: 3.86 kB)
│   ├── react-vendor-*.js        161.79 kB (gzip: 52.81 kB)
│   └── pdf-vendor-*.js          375.13 kB (gzip: 112.01 kB)
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
