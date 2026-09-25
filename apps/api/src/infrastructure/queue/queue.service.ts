import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface AsyncJob<T = any> {
  id: string;
  type: string;
  payload: T;
  timestamp: string;
}

export type JobHandler<T = any> = (job: AsyncJob<T>) => Promise<void>;

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private handlers = new Map<string, JobHandler>();

  constructor(private readonly redisService: RedisService) {}

  registerHandler<T = any>(jobType: string, handler: JobHandler<T>) {
    this.handlers.set(jobType, handler);
    this.logger.log(`Registered async worker handler for job type: ${jobType}`);
  }

  async dispatch<T = any>(type: string, payload: T): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const job: AsyncJob<T> = {
      id: jobId,
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    if (this.redisService.isAvailable()) {
      try {
        const client = this.redisService.getClient();
        await client?.lpush('saas:jobs:queue', JSON.stringify(job));
        this.logger.log(`Job ${jobId} [${type}] pushed to Redis queue.`);
      } catch (err: any) {
        this.logger.warn(`Failed to push job ${jobId} to Redis queue: ${err.message}. Falling back to in-process execution.`);
        this.executeAsync(job);
      }
    } else {
      // In-process asynchronous execution boundary
      this.executeAsync(job);
    }

    return jobId;
  }

  private executeAsync<T>(job: AsyncJob<T>) {
    setImmediate(async () => {
      const handler = this.handlers.get(job.type);
      if (handler) {
        try {
          await handler(job);
          this.logger.log(`Job ${job.id} [${job.type}] completed successfully.`);
        } catch (error: any) {
          this.logger.error(`Job ${job.id} [${job.type}] failed: ${error.message}`, error.stack);
        }
      } else {
        this.logger.warn(`No handler registered for async job type: ${job.type}`);
      }
    });
  }
}
