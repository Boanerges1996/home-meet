export interface IUser {
  id?: string;
  name?: string;
  email?: string;
  pic?: string;
}

export interface IMeeting {
  id: string;
  title: string;
  user: IUser;
  attendees: IUser[];
}
