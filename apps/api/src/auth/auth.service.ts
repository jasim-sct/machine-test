import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse, Role, UserDto, UserStatus } from '@saas/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email address is already in use');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Enforce Role.USER and UserStatus.ACTIVE strictly on public registration
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
    });

    const userDto = this.formatUserDto(user);
    const accessToken = this.generateToken(userDto);

    return {
      accessToken,
      user: userDto,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Your account has been suspended. Please contact an administrator.',
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    const userDto = this.formatUserDto(user);
    const accessToken = this.generateToken(userDto);

    return {
      accessToken,
      user: userDto,
    };
  }

  private generateToken(user: UserDto): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private formatUserDto(user: any): UserDto {
    return {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
