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

export type ViewersPeerConnections = {
  [key: string]: RTCPeerConnection;
};

export type ViewersDataChannels = {
  [key: string]: RTCDataChannel;
};

export type ChatType = {
  message: string;
  user: IUser;
};

export interface IJoinedUser {
  name: string;
  pic: string;
  viewerId: string;
  socketId: string;
}
