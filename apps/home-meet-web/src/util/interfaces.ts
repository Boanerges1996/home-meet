export interface IUser {
  id?: string;
  name?: string;
  email?: string;
  pic?: string;
  _id?: string;
}

export interface IMeeting {
  id: string;
  title: string;
  creator: IUser;
  attendees: IUser[];
  _id?: string;
}
