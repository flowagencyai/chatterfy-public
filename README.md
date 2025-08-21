# Chatterfy - Chat SaaS Platform

> A production-ready Chat SaaS platform with multi-provider AI support, Stripe integration, and complete subscription management.

## ✨ Features

- 🤖 **Multi-Provider AI Support**: OpenAI, DeepSeek, Anthropic, Google, Ollama
- 🔐 **Authentication**: Magic link email authentication with NextAuth
- 💳 **Subscription Management**: Complete Stripe integration with webhooks
- 📊 **Usage Tracking**: Token usage monitoring and plan-based limits
- 📁 **File Upload**: Support for file attachments with S3 integration
- 🌟 **Anonymous Access**: Free tier with session-based limits
- 🎨 **Modern UI**: Clean, responsive interface with real-time updates
- 🏢 **Multi-tenant**: Organization-based isolation and management
- 📈 **Admin Dashboard**: Usage analytics and subscription management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- SMTP server for email authentication
- Stripe account for subscriptions
- AI provider API keys (OpenAI, DeepSeek, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/flowagencyai/chatterfy-public.git
   cd chatterfy-public
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp apps/web/.env.local.example apps/web/.env.local
   ```

4. **Configure Environment Variables**
   
   Edit `.env` with your credentials:
   ```bash
   # Database (SQLite for development)
   DATABASE_URL="file:./prisma/dev.db"
   
   # API Keys
   OPENAI_API_KEY=sk-...
   DEEPSEEK_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   
   # NextAuth (email authentication)
   NEXTAUTH_URL=http://localhost:3001
   NEXTAUTH_SECRET=your-secret-here
   EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
   EMAIL_FROM=noreply@example.com
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Database Setup**
   ```bash
   cd apps/api
   npm run prisma:generate
   npm run prisma:push
   
   # Seed default plans
   curl -X POST http://localhost:8787/admin/seed-plans
   ```

6. **Start Development Servers**
   ```bash
   # Terminal 1 - API Backend (port 8787)
   cd apps/api
   npm run dev
   
   # Terminal 2 - Frontend (port 3001)
   cd apps/web
   PORT=3001 npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:3001
   - API: http://localhost:8787

## 🏗️ Architecture

### Project Structure
```
apps/
├── api/           # Express backend with OpenAI-compatible endpoints
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── middleware/ # Auth, rate limiting, tenant isolation
│   │   └── util/      # Helper functions (Stripe, metering)
│   └── prisma/        # Database schema
└── web/           # Next.js frontend with App Router
    ├── app/
    │   ├── components/ # React components
    │   ├── contexts/   # State management
    │   └── api/auth/   # NextAuth configuration
    └── hooks/         # Custom React hooks
```

### Core Features

#### 🔌 API Endpoints

**Chat Completions (OpenAI Compatible)**
```bash
POST /v1/chat/completions
```
```json
{
  "model": "deepseek-chat",
  "messages": [{"role": "user", "content": "Hello"}],
  "provider": "deepseek",
  "temperature": 0.7,
  "stream": false
}
```

**Anonymous Chat (No authentication)**
```bash
POST /v1/anonymous/chat/completions
```
- 5 messages per session limit
- Session tracking via cookies

**Subscription Management**
```bash
POST /v1/subscription/upgrade    # Upgrade plan
POST /v1/subscription/cancel     # Cancel subscription
GET  /v1/subscription/details    # Get subscription info
```

#### 🎨 Frontend Components

- **ChatArea**: Main chat interface with loading states
- **MessageList**: Conversation history with markdown support
- **Sidebar**: Thread management and navigation
- **ModelSelector**: AI provider/model selection
- **SubscriptionManagement**: Billing and plan management

#### 💾 Database Schema

Key models:
- **Organization**: Multi-tenant organizations
- **User**: Users with NextAuth integration
- **Plan**: Subscription plans (FREE, PRO)
- **Subscription**: Active subscriptions with Stripe
- **Usage**: Token usage tracking
- **Thread/Message**: Conversation history

## 💳 Subscription Plans

### Default Plans
- **FREE**: 2M tokens/month, 200MB storage
- **PRO**: 10M tokens/month, 2GB storage, R$ 49.90/month

### Plan Management
```bash
# Create Stripe products and update database
cd apps/api
node scripts/seed-plans.js
node scripts/update-stripe-plans.js
```

## 🔧 Configuration

### AI Providers

Configure multiple AI providers with automatic fallback:

```javascript
// Provider priority (cost-effectiveness)
1. DeepSeek - Most cost-effective (default)
2. OpenAI - Streaming support
3. Anthropic - Claude models
4. Google - Gemini models
5. Ollama - Local models
```

### Rate Limiting

- Global: 120 requests/minute
- Per Organization: 600 requests/minute
- Per User: 240 requests/minute
- Anonymous: 5 messages per session

### File Upload

- Development: Local storage (`uploads/`)
- Production: AWS S3 (set `USE_S3=true`)
- Max file size: 50MB (configurable)

## 🚀 Deployment

### Docker Deployment

```bash
# Build and deploy
docker-compose up -d

# With custom environment
docker-compose -f docker-compose.prod.yml up -d
```

### Production Checklist

1. **Environment Variables**
   - Set production database URL (PostgreSQL)
   - Configure production Stripe keys
   - Set up AWS S3 for file storage
   - Configure production email server

2. **Database Migration**
   ```bash
   npm run prisma:migrate:deploy
   ```

3. **Stripe Setup**
   - Create products and prices in Stripe Dashboard
   - Configure webhook endpoints
   - Update database with Stripe IDs

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure uptime monitoring
   - Enable logging and analytics

## 🧪 Testing

### API Testing
```bash
# Test chat completion
curl -X POST http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-Org-Id: org123" \
  -H "X-User-Id: user456" \
  -d '{"model": "deepseek-chat", "messages": [{"role": "user", "content": "Hello"}]}'

# Test anonymous chat
curl -X POST http://localhost:8787/v1/anonymous/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-chat", "messages": [{"role": "user", "content": "Hello"}]}'
```

### Frontend Testing
```bash
# Run development server
PORT=3001 npm run dev

# Test authentication flow
# 1. Go to http://localhost:3001/auth
# 2. Enter email and verify magic link
# 3. Test chat functionality
```

## 📚 API Documentation

### Authentication

**Headers-based (Authenticated Users)**
```bash
X-Org-Id: organization-id
X-User-Id: user-id
```

**Session-based (Anonymous Users)**
- Automatic session tracking
- 5 message limit per session
- Session data in localStorage

### Models Available

- `deepseek-chat` (Default - Most cost-effective)
- `gpt-4o-mini`, `gpt-4o` (OpenAI)
- `claude-3-haiku`, `claude-3-sonnet` (Anthropic)
- `gemini-pro` (Google)
- Custom Ollama models

### Error Handling

Standard HTTP status codes with detailed error messages:
```json
{
  "error": {
    "message": "Plan limit exceeded",
    "type": "plan_limit_error",
    "code": "TOKENS_EXCEEDED"
  }
}
```

## 🛠️ Development

### Key Scripts

```bash
# API Development
cd apps/api
npm run dev          # Start development server
npm run build        # Build for production
npm run prisma:push  # Update database schema

# Frontend Development  
cd apps/web
PORT=3001 npm run dev  # Start development server (port 3001)
npm run build          # Build for production
npm run start          # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open database browser
```

### Common Issues

**Database Connection**
```bash
# Check database file
ls -la apps/api/prisma/dev.db

# Recreate database
cd apps/api
rm prisma/dev.db
npm run prisma:push
```

**Port Conflicts**
```bash
# Kill processes on occupied ports
lsof -ti:8787 | xargs kill -9  # API
lsof -ti:3001 | xargs kill -9  # Frontend
```

**Email Authentication**
- Verify `EMAIL_SERVER` configuration
- Check `NEXTAUTH_URL` matches frontend URL
- Ensure `NEXTAUTH_SECRET` is set

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](docs/)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/flowagencyai/chatterfy-public/issues)
- **Discussions**: [GitHub Discussions](https://github.com/flowagencyai/chatterfy-public/discussions)
- **Email**: support@flowagency.ai

---

Built with ❤️ by [Flow Agency AI](https://flowagency.ai)