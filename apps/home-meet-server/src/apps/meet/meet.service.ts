import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HomeMeetApiResponse } from '../common';
import { CreateMeetDto } from './dto';
import { Meet, MeetDocument } from './meet.model';

@Injectable()
export class MeetService {
  constructor(
    @InjectModel(Meet.name) private readonly meetModel: Model<MeetDocument>,
  ) {}

  async createMeet(meetData: CreateMeetDto): Promise<HomeMeetApiResponse> {
    const meet = await this.meetModel.create(meetData);

    const createdMeet = await this.meetModel
      .findById(meet._id)
      .populate('creator')
      .lean();

    return {
      message: 'Meet created successfully',
      status: 'success',
      data: createdMeet,
    };
  }

  async getMeetById(id: string): Promise<HomeMeetApiResponse> {
    const meet = await this.meetModel.findById(id).populate('creator').lean();

    if (!meet) {
      throw new Error('Meet does not exist');
    }

    return {
      message: 'Meet fetched successfully',
      status: 'success',
      data: meet,
    };
  }

  async getMeetsByUserId(userId: string): Promise<HomeMeetApiResponse> {
    const meets = await this.meetModel
      .find({ creator: userId })
      .populate('creator')
      .lean();

    return {
      message: 'Meets fetched successfully',
      status: 'success',
      data: meets,
    };
  }

  async getMeets(): Promise<HomeMeetApiResponse> {
    const meets = await this.meetModel.find().populate('creator').lean();

    return {
      message: 'Meets fetched successfully',
      status: 'success',
      data: meets,
    };
  }
}
