import { Module } from '@nestjs/common';

import { ConfigModule } from '../config';
import { CacheService } from './cache.service';
import { RequestContextCacheService } from './request-context-cache.service';

@Module({
    imports: [ConfigModule],
    providers: [RequestContextCacheService, CacheService],
    exports: [RequestContextCacheService, CacheService],
})
export class CacheModule {}
