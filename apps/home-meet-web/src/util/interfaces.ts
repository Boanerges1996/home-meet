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

interface MediaDeviceInfo {
  deviceId: string;
  kind: string;
  label: string;
}
