import { HttpException, Injectable } from '@nestjs/common';
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
      if (phoneExists) throw new HttpException('Phone already exists', 400);
    }

    if (emailExists) {
      throw new HttpException('Email or phone already exists', 400);
    }
  }

  async signupUser(signupData: UserSignupDto): Promise<HomeMeetApiResponse> {
    const { email, phone } = signupData;
    await this.checkUserExists(email, phone);

    const createdUser = await this.userModel.create(signupData);
    const { accessToken, refreshToken } = await this.getTokens(
      createdUser.toObject(),
    );

    return {
      message: 'User created successfully',
      status: 'success',
      data: createdUser,
      accessToken,
      refreshToken,
    };
  }

  async loginUser(loginData: UserLoginDto): Promise<HomeMeetApiResponse> {
    const { email, password } = loginData;
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 400);
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
