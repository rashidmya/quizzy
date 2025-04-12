# Quizzy

![Quizzy Logo](public/logo.png)

A modern quiz application built with Next.js and PostgreSQL that allows you to create, manage, and share quizzes.

## Features

- **Modern UI**: Clean, responsive interface built with Shadcn UI and Tailwind CSS
- **Authentication**: Secure user authentication with NextAuth
- **Quiz Creation**: Easily create custom quizzes with multiple question types
- **Dashboard**: Track and manage your quizzes from a centralized dashboard
- **Dark & Light Mode**: Full theme support for user preference
- **Database Integration**: Robust PostgreSQL backend with Drizzle ORM

## Coming Soon

- **Question-Based Timer**: Set time limits for individual questions
- **Quiz Sessions**: Create timed quiz sessions for groups
- **Share Quizzes**: Generate shareable links to distribute your quizzes
- **Analytics**: Get detailed insights about quiz performance

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)

## Getting Started

```bash
git clone https://github.com/YOUR-USERNAME/quizzy
cd quizzy
pnpm install
```

## Running Locally

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Then, run the database migrations and seed the database:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
