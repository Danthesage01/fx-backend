// src/server.ts - FINAL FIX
import dotenv from 'dotenv';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { Server } from 'http';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
 'NODE_ENV',
 'PORT',
 'MONGODB_URI',
 'JWT_SECRET',
 'EXCHANGE_RATE_API_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
 console.error('Missing required environment variables:', missingEnvVars);
 process.exit(1);
}

let server: Server | undefined;

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
 console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
 console.error(err.name, err.message);
 console.error(err.stack);
 process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
 console.error('UNHANDLED REJECTION! 💥 Shutting down...');
 console.error(err.name, err.message);
 console.error(err.stack);

 if (server) {
  server.close(() => {
   process.exit(1);
  });
 } else {
  process.exit(1);
 }
});

const startServer = async (): Promise<Server> => {
 try {
  // Connect to database
  await connectDatabase();
  console.log('✅ Database connected successfully');

  // Create Express app
  const app = createApp();

  // Start server
  const PORT = process.env.PORT || 5700;
  const httpServer = app.listen(PORT, () => {
   console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);


   if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 Development mode - CORS enabled for localhost`);
   }
  });

  // Assign to global server variable
  server = httpServer;

  // Graceful shutdown handling
  const gracefulShutdown = (signal: string) => {
   console.log(`\n${signal} received. Graceful shutdown initiated...`);

   if (server) {
    server.close(async () => {
     console.log('HTTP server closed.');

     try {
      // Close database connection
      const mongoose = await import('mongoose');
      await mongoose.connection.close();
      console.log('Database connection closed.');

      console.log('Graceful shutdown completed. ✅');
      process.exit(0);
     } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
     }
    });

    // Force close after 10 seconds
    setTimeout(() => {
     console.error('Could not close connections in time, forcefully shutting down');
     process.exit(1);
    }, 10000);
   } else {
    process.exit(1);
   }
  };

  // Handle termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return httpServer;
 } catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
 }
};

// Start the server
startServer().catch((error) => {
 console.error('Failed to start server:', error);
 process.exit(1);
});

export default server;