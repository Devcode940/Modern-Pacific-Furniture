# Modern Pacific Furniture

A modern, full-featured e-commerce platform built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and shadcn/ui. This application provides a complete furniture shopping experience with advanced features like product comparison, room visualization, loyalty programs, and an admin dashboard.

## 🌟 Features

### Customer Features
- **Product Browsing**: Browse furniture by categories with detailed product information
- **Search & Filter**: Advanced search functionality with filtering options
- **Shopping Cart**: Persistent cart with session management
- **Wishlist**: Save favorite products for later
- **Product Comparison**: Compare multiple products side-by-side
- **Room Visualizer**: Visualize furniture in your space
- **Room Calculator**: Calculate room dimensions and requirements
- **Interior Design Quiz**: Get personalized recommendations
- **Bundle Deal Builder**: Create custom bundles and save money
- **Loyalty Program**: Earn and redeem points
- **Referral System**: Refer friends and earn rewards
- **Order Tracking**: Track your orders in real-time
- **Blog**: Read articles about interior design and furniture care
- **Account Management**: Manage profile, addresses, and order history
- **WhatsApp Chat**: Direct customer support

### Admin Features
- **Dashboard**: Overview of sales, orders, and analytics
- **Product Management**: Add, edit, and delete products
- **Order Management**: Process and track orders
- **Analytics**: View sales reports and insights

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Package Manager**: Bun

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun 1.0+
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Modern-Pacific-Furniture
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   bun run db:push
   bun run db:seed
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

6. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:reset` | Reset database |

## 🗄️ Database Schema

The application uses SQLite with the following main models:

- **Category**: Product categories with images and descriptions
- **Product**: Furniture items with detailed specifications
- **Review**: Product reviews with ratings
- **User**: Customer accounts
- **Address**: User shipping addresses
- **CartItem**: Shopping cart items
- **WishlistItem**: Saved products
- **Order**: Customer orders
- **Coupon**: Discount codes
- **BlogPost**: Blog articles
- **Video**: Product videos

## 📁 Project Structure

```
Modern-Pacific-Furniture/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main page component
│   ├── components/       # React components
│   │   ├── admin/        # Admin dashboard components
│   │   ├── cart/         # Cart-related components
│   │   ├── checkout/     # Checkout components
│   │   ├── features/     # Feature-specific components
│   │   ├── home/         # Homepage components
│   │   ├── layout/       # Layout components (header, footer)
│   │   ├── product/      # Product display components
│   │   └── shop/         # Shop/browse components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── store/            # Zustand stores
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── public/               # Static assets
└── skills/               # Skill-related files
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible UI components including:

- Accordion, Alert Dialog, Aspect Ratio
- Avatar, Badge, Button
- Calendar, Card, Checkbox
- Collapsible, Combobox, Command
- Context Menu, Data Table, Date Picker
- Dialog, Drawer, Dropdown Menu
- Form, Hover Card, Input
- Label, Menubar, Navigation Menu
- Popover, Progress, Radio Group
- Scroll Area, Select, Separator
- Sheet, Skeleton, Slider
- Sonner (Toast), Switch, Table
- Tabs, Textarea, Toggle
- Tooltip, and more!

## 🚀 Deployment

### Production Build

1. **Build the application**
   ```bash
   bun run build
   ```

2. **Start the production server**
   ```bash
   bun run start
   ```

### Docker (Optional)

The project supports standalone deployment with the build process copying necessary files to `.next/standalone`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Framer Motion](https://www.framer.com/motion/)

---

Built with ❤️ using Next.js and Modern UI technologies