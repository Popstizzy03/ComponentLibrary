// apps/server/src/drizzle/drizzle.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create a properly typed DrizzleClient type
export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

// Export the injection token as a string for consistency
export const DRIZZLE_CLIENT = 'DRIZZLE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_CLIENT,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<DrizzleClient> => {
        const connectionString = configService.get<string>('DATABASE_URL');

        if (!connectionString) {
          throw new Error('DATABASE_URL is not configured');
        }

        const pool = new Pool({
          connectionString,
          ssl:
            process.env.NODE_ENV === 'production'
              ? { rejectUnauthorized: false }
              : false,
          // Add connection pool configuration for better performance
          max: 20, // Maximum number of clients in the pool
          idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
          connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
        });

        // Test the connection
        try {
          const client = await pool.connect();
          client.release();
          console.log('Database connection established successfully');
        } catch (error) {
          console.error('Failed to connect to database:', error);
          throw error;
        }

        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DRIZZLE_CLIENT],
})
export class DrizzleModule {}
