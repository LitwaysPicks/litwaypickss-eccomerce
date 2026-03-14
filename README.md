# LitwayPicks - E-commerce Platform

A comprehensive, production-ready e-commerce platform built for Liberia with modern web technologies.

## 🌟 Features

### Customer Features
- **Product Browsing**: Browse products by categories, search, and filter
- **User Authentication**: Secure sign-up/login with email/password and Google OAuth
- **Shopping Cart**: Add/remove items, quantity management, persistent cart
- **Checkout**: Seamless checkout process with address collection
- **Payment Integration**: MoMo (Mobile Money) payment processing
- **Order Tracking**: Real-time order status updates
- **WhatsApp Notifications**: Order confirmations and updates via WhatsApp
- **Newsletter**: Subscribe for exclusive deals and updates

### Admin Features
- **Dashboard**: Comprehensive analytics and KPIs
- **Product Management**: Full CRUD operations for products and categories
- **Order Management**: Process orders, update statuses
- **Inventory Tracking**: Low stock alerts and inventory management
- **Customer Management**: User accounts and order history
- **Real-time Notifications**: WhatsApp alerts for new orders

### Technical Features
- **Responsive Design**: Mobile-first, fully responsive UI
- **SEO Optimized**: Meta tags, structured data, sitemap
- **Performance**: Optimized images, caching, code splitting
- **Security**: Role-based access, input validation, secure payments
- **Database**: SQLite with Prisma ORM (Firebase option available)
- **Real-time Features**: Live notifications and updates

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: SQLite + Prisma (Firebase Firestore optional)
- **Authentication**: NextAuth.js
- **Payments**: MoMo API integration
- **Messaging**: Twilio WhatsApp API
- **Deployment**: Vercel, Docker support
- **Testing**: Jest, Cypress

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd litwaypicks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in the required environment variables:
   - Database URL
   - NextAuth configuration
   - Google OAuth credentials
   - MoMo API credentials
   - Twilio WhatsApp API credentials

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="file:./dev.db"
USE_FIREBASE=false

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# MoMo Payment
MOMO_API_KEY="your-momo-api-key"
MOMO_MERCHANT_ID="your-momo-merchant-id"

# Twilio WhatsApp
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
WHATSAPP_FROM="whatsapp:+14155238886"
ADMIN_WHATSAPP_TO="whatsapp:+231888640502"
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```bash
# Build the Docker image
docker build -t litwaypicks .

# Run the container
docker run -p 3000:3000 litwaypicks
```

### Docker Compose
```bash
docker-compose up -d
```

## 📱 Database Options

### SQLite (Default)
- Zero configuration
- File-based database
- Perfect for development and small to medium deployments

### Firebase Firestore (Optional)
Set `USE_FIREBASE=true` in your environment variables and configure Firebase credentials.

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#6B7280)
- **Accent**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: 600-700 weight
- **Body**: 400-500 weight

### Components
Built with shadcn/ui components for consistency and accessibility.

## 🧪 Testing

### Unit Tests
```bash
npm run test
npm run test:watch
```

### E2E Tests
```bash
npm run test:e2e
npm run test:e2e:headless
```

## 📊 Analytics

The platform includes:
- Google Analytics integration
- Custom event tracking
- Admin dashboard analytics
- Sales and performance metrics

## 🔐 Security

- **Authentication**: Secure user authentication with NextAuth
- **Authorization**: Role-based access control
- **Input Validation**: Server-side validation with Zod
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: NextAuth CSRF protection

## 🌍 Localization

Currently supports:
- English (Primary)
- Liberian Dollar (LRD) currency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- **Email**: support@litwaypicks.com
- **Phone**: +231-888-640-502
- **WhatsApp**: +231-888-640-502

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- shadcn for the beautiful UI components
- Prisma for the excellent ORM
- All contributors and users of LitwayPicks

---

Built with ❤️ for Liberia 🇱🇷