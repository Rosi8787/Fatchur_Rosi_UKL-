import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
     constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { user, access_token } = await this.authService.register(body.name, body.email, body.password, body.role);
    return { status: 'success', message: 'Registrasi berhasil', data: { user, access_token } };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { user, access_token } = await this.authService.login(body.email, body.password);
    return { status: 'success', message: 'Login berhasil', data: { user, access_token } };
  }
}
