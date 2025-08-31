import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GraphModule } from './graph/graph.module';

@Module({
  imports: [AuthModule, GraphModule],
})
export class AppModule {}


