import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.model';
import * as bcrypt from 'bcrypt';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtConfigService } from 'src/jwt';
import { UserController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const userSchema = UserSchema;

          userSchema.pre('save', async function (next) {
            if (this.isModified('password')) {
              this.password = await bcrypt.hash(this.password, 10);
            }
            next();
          });
          return userSchema;
        },
      },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useClass: JwtConfigService,
    }),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
