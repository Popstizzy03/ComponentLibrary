// apps/server/src/drizzle/drizzle.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { lookup } from 'node:dns/promises';

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;
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

        const url = new URL(connectionString);

        // Extract endpoint ID from hostname (first part before first dot)
        const endpointId = url.hostname.split('.')[0]; // 'ep-purple-boat-acovj9nr'
        
        // Resolve hostname to IPv4 address
        const { address: ipv4Host } = await lookup(url.hostname, { family: 4 });

        const config = {
          host: ipv4Host,
          port: parseInt(url.port) || 5432,
          user: url.username,
          password: url.password,
          database: url.pathname.slice(1),
          ssl: { rejectUnauthorized: false },
          options: `endpoint=${endpointId}`, // Add endpoint ID parameter
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 30000,
        };

        console.log('Database config:', {
          host: config.host,
          port: config.port,
          user: config.user,
          database: config.database,
          endpointId: endpointId,
        });

        const pool = new Pool(config);

        try {
          console.log('Attempting to connect to database...');
          const client = await pool.connect();
          await client.query('SELECT NOW()');
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