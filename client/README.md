# LinguaBridge AI

LinguaBridge AI is a production-ready real-time translation chat application designed to break language barriers. It enables seamless communication between users speaking different languages by automatically translating text and voice messages in real-time.

## Features

- **Real-time Messaging**: Instant messaging powered by Socket.io.
- **AI Translation**: Automatic translation of text messages using OpenAI (GPT-4o-mini).
- **Voice Support**: Send and receive voice messages with automatic transcription (Whisper) and translated text-to-speech (OpenAI TTS).
- **Language Detection**: Automatically detects the language of incoming messages.
- **User Authentication**: Secure signup and login using NextAuth.js (Credentials provider).
- **Chat History**: Persistent chat history with scroll-based pagination.
- **User Search**: Find and start chats with other users.
- **Modern UI**: Responsive design with Dark Mode support, built with Tailwind CSS and Shadcn UI.
- **Dashboard**: User-friendly dashboard to manage chats and profile settings.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Authentication**: NextAuth.js v5
- **Database**: MongoDB (with Mongoose)
- **Real-time**: Socket.io, Redis (Adapter)
- **AI**: OpenAI API, LangChain

## Prerequisites

- Node.js (v18 or higher)
- MongoDB instance (Local or Atlas)
- Redis instance (Local or Cloud) - *Optional but recommended for scaling*
- OpenAI API Key

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd Linguabridge-AI
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**

    Copy the example environment file and update the values:

    ```bash
    cp .env.example .env.local
    ```

    Update `.env.local` with your credentials:

    ```env
    MONGODB_URI=mongodb://localhost:27017/linguabridge
    NEXTAUTH_SECRET=your_super_secret_key
    NEXTAUTH_URL=http://localhost:3000
    OPENAI_API_KEY=your_openai_api_key
    REDIS_URL=redis://localhost:6379 (Optional)
    ```

## Running the Project

1.  **Start the development server:**

    ```bash
    npm run dev
    ```

    The server will start on `http://localhost:3000`.

2.  **Build for production:**

    ```bash
    npm run build
    npm start
    ```

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions, database connection, AI service, and chat service logic.
- `src/models`: Mongoose database models (User, Chat, Message).
- `src/types`: TypeScript type definitions.
- `server.ts`: Custom server entry point for Socket.io integration.

## License

MIT
