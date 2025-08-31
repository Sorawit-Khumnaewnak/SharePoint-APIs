import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService, TokenResponse } from './auth.service';

class JwtDto { jwt_token!: string }

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/getTokenByJwtToken
  @Post('getTokenByJwtToken')
  @ApiBody({ schema: { properties: { jwt_token: { type: 'string' } }, required: ['jwt_token'] } })
  async getTokenByJwtToken(@Body() body: JwtDto): Promise<TokenResponse> {
    const { jwt_token } = body;
    if (!jwt_token) throw new Error('jwt_token required');
    return this.authService.exchangeAssertionForToken(jwt_token);
  }
}


