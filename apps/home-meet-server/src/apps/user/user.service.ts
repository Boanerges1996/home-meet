import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HomeMeetApiResponse } from '../common';
import { UserLoginDto, UserSignupDto } from './dto';
import { User, UserDocument } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async findUserByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).select('+password');
  }

  async findUserById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).lean();
  }

  async findUserByPhone(phone: string): Promise<UserDocument> {
    return this.userModel.findOne({
      phone,
    });
  }

  async checkUserExists(email: string, phone?: string): Promise<void> {
    const emailExists = await this.findUserByEmail(email);
    if (phone) {
      const phoneExists = await this.findUserByPhone(phone);
      if (phoneExists) throw new Error('Phone already exists');
    }

    if (emailExists) {
      throw new Error('Email or phone already exists');
    }
  }

  async signupUser(signupData: UserSignupDto): Promise<HomeMeetApiResponse> {
    const { email, phone } = signupData;
    await this.checkUserExists(email, phone);

    const createdUser = await this.userModel.create(signupData);

    return {
      message: 'User created successfully',
      status: 'success',
      data: createdUser,
    };
  }

  async loginUser(loginData: UserLoginDto): Promise<HomeMeetApiResponse> {
    const { email, password } = loginData;
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new Error('User does not exist');
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const { accessToken, refreshToken } = await this.getTokens(user.toObject());

    return {
      message: 'User logged in successfully',
      status: 'success',
      accessToken,
      refreshToken,
      data: user,
    };
  }

  async getTokens(
    data: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(data, {
        secret: this.configService.get('jwt.secret'),
      }),
      this.jwtService.signAsync(data, {
        secret: this.configService.get('jwt.refreshSecret'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserProfile(userId: string): Promise<HomeMeetApiResponse> {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new Error('User does not exist');
    }

    return {
      message: 'User profile fetched successfully',
      status: 'success',
      data: user,
    };
  }
}
