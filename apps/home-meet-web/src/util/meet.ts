import { notification } from 'antd';

export const logConnectionState = ({
  state,
  viewerName,
}: {
  state: RTCPeerConnectionState;
  viewerName: string;
}) => {
  console.log(`[${viewerName}] Connection state: ${state}`);
  switch (state) {
    case 'new':
      console.log(`[${viewerName}] Connection state: new`);
      break;
    case 'connecting':
      console.log(`[${viewerName}] Connection state: connecting`);
      break;
    case 'connected':
      notification.success({
        message: 'Connected',
        description: `${viewerName} joined the broadcast`,
        duration: 2,
      });
      console.log(`[${viewerName}] Connection state: connected`);
      break;
    case 'failed':
      notification.error({
        message: 'Disconnected',
        description: `The connection with ${viewerName} has failed`,
        duration: 2,
      });
      console.log(`[${viewerName}] Connection state: failed`);
      break;

    case 'disconnected':
      console.log(`[${viewerName}] Connection state: disconnected`);
      break;

    case 'closed':
      console.log(`[${viewerName}] Connection state: closed`);
      break;
    default:
      console.log(`[${viewerName}] Connection state: unknown`);
      break;
  }
};
