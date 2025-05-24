# Radiology Question Bank

A modern, scalable web application for radiology education and practice.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Image Storage**: Supabase Storage
- **Hosting**: Vercel
- **Testing**: Jest, React Testing Library
- **Monitoring**: Sentry
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
radiology-qbank/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── (marketing)/       # Public marketing pages
│   │   └── api/               # API routes
│   ├── components/            # Reusable React components
│   │   ├── ui/               # Basic UI components
│   │   ├── forms/            # Form components
│   │   └── features/         # Feature-specific components
│   ├── lib/                  # Utility functions and shared logic
│   │   ├── supabase/        # Supabase client and utilities
│   │   ├── stripe/          # Stripe integration
│   │   └── utils/           # Helper functions
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global styles
├── public/                  # Static assets
├── tests/                   # Test files
├── .github/                # GitHub Actions workflows
└── prisma/                 # Database schema and migrations
```

## 🛠️ Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run development server: `npm run dev`

## 🔑 Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 🚀 Deployment

The application is configured for deployment on Vercel. Connect your GitHub repository to Vercel for automatic deployments.

## 📝 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 