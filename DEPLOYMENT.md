# ASL Reading Hero Deployment Guide

## Prerequisites

- Node.js 20.x
- npm 10.x
- Git

## Build Process

### Local Build

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/ASL Reading Hero.git
   cd ASL Reading Hero
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Deployment Options

### 1. Netlify

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. Set up environment variables in Netlify Dashboard if needed

### 2. GitHub Pages

1. Enable GitHub Pages in repository settings
2. Use provided GitHub Actions workflow (`.github/workflows/deploy.yml`)
3. Workflow automatically deploys on push to `main` branch

### 3. AWS S3 + CloudFront

1. Build the project:
   ```bash
   npm run build
   ```

2. Sync files to S3 bucket:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name
   ```

3. Create CloudFront distribution
   - Origin: S3 bucket
   - Default Root Object: `index.html`

## Environment Variables

- `VITE_API_BASE_URL`: Base URL for backend API
- `VITE_ENVIRONMENT`: Deployment environment (development/production)

## Troubleshooting

- **Build Fails**: Check Node.js and npm versions
- **Missing Dependencies**: Run `npm install`
- **Routing Issues**: Ensure `base` path in `vite.config.ts` is correct
- **Performance**: Check bundle size and optimize imports

## Best Practices

- Always test production build locally with `npm run preview`
- Use environment-specific configurations
- Set up proper Content Security Policy
- Enable HTTPS for all deployments

## Monitoring

- Set up logging and error tracking
- Monitor performance metrics
- Regularly update dependencies