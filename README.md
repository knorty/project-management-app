# Email Thread Manager

A Next.js application that transforms email threads into beautiful, readable timelines. Built with TypeScript, Tailwind CSS, Shadcn UI, and Prisma with PostgreSQL.

## Features

- **Email Thread Management**: Import and organize email threads
- **Email Import System**: Import emails from multiple sources
  - Forwarded emails from email clients
  - Email files (EML, MSG formats)
  - API integrations (Gmail, Outlook, etc.)
  - Manual entry with full control
- **Timeline Visualization**: Convert email conversations into aesthetic timelines
- **Timeline Management**: Full CRUD operations for timeline views and events
- **Project Integration**: Link email threads to projects (future feature)
- **Modern UI**: Built with Shadcn UI components and Tailwind CSS
- **Type Safety**: Full TypeScript support
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Database**: PostgreSQL (NeonDB)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (planned)

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (NeonDB recommended)
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd project-management-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Update the `.env` file with your database connection string:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

### 4. Set up the database

**Option A: Quick Setup (Recommended)**
```bash
npm run db:setup
```

**Option B: Manual Setup**
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. Test the database

Visit `http://localhost:3000/api/test` to verify your database is working correctly.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses a comprehensive Prisma schema with the following main models:

### Email Management
- `EmailThread`: Main email thread container
- `EmailMessage`: Individual email messages
- `EmailAttachment`: File attachments
- `EmailParticipant`: Thread participants
- `ThreadTag`: Custom tags for organization

### Timeline Features
- `TimelineView`: Timeline display configurations
- `TimelineEvent`: Individual timeline events

### Project Management (Future)
- `Project`: Project containers
- `ProjectStatus`: Custom status workflows
- `Task`: Project tasks
- `User`: User management

## API Routes

The application includes comprehensive RESTful API routes for email thread and timeline management:

### Email Thread Management
- `GET /api/email-threads` - List all email threads
- `POST /api/email-threads` - Create a new email thread
- `GET /api/email-threads/[id]` - Get specific email thread
- `PUT /api/email-threads/[id]` - Update email thread
- `DELETE /api/email-threads/[id]` - Delete email thread

### Email Import
- `POST /api/email-import` - Import email threads from various sources
  - **Sources**: `forwarded_email`, `email_file`, `api_integration`, `manual`
  - **Features**: Auto-generates timelines, validates data, handles duplicates
  - **Options**: `autoGenerateTimeline`, `allowDuplicate`

### Timeline Management
- `GET /api/timelines` - List all timeline views
- `POST /api/timelines` - Create a new timeline view
- `GET /api/timelines/[id]` - Get specific timeline view
- `PUT /api/timelines/[id]` - Update timeline view
- `DELETE /api/timelines/[id]` - Delete timeline view

### Timeline Generation
- `POST /api/timelines/generate` - Automatically generate timeline from email thread

### Timeline Events
- `GET /api/timelines/[id]/events` - Get all events for a timeline
- `POST /api/timelines/[id]/events` - Add event to timeline
- `GET /api/timelines/[id]/events/[eventId]` - Get specific timeline event
- `PUT /api/timelines/[id]/events/[eventId]` - Update timeline event
- `DELETE /api/timelines/[id]/events/[eventId]` - Delete timeline event
- `POST /api/timelines/[id]/events/reorder` - Reorder timeline events

### Testing
- `GET /api/test` - Test database connectivity and seeded data

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/
│   └── ui/            # Shadcn UI components
└── lib/
    ├── prisma.ts      # Prisma client
    └── utils.ts       # Utility functions
```

## Development

### Adding new Shadcn components

```bash
npx shadcn@latest add <component-name>
```

### Database setup and seeding

```bash
npm run db:setup    # Complete database setup (generate, push, seed)
npm run db:seed     # Seed database with sample data
npm run test:timeline # Test timeline API endpoints
npm run test:import # Test email import functionality
```

### Database migrations

```bash
npx prisma migrate dev --name <migration-name>
```

### Type generation

```bash
npx prisma generate
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

- `DATABASE_URL`: Your production PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret key for authentication (when implemented)
- `NEXTAUTH_URL`: Your production URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
