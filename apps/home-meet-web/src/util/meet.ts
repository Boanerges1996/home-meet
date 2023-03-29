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
    case 'disconnected':
      notification.error({
        message: 'Disconnected',
        description: `The connection with ${viewerName} has been disconnected`,
        duration: 2,
      });
      console.log(`[${viewerName}] Connection state: disconnected`);
      break;

    case 'closed':
      notification.error({
        message: 'Closed',
        description: `The connection with ${viewerName} has been closed`,
        duration: 2,
      });
      console.log(`[${viewerName}] Connection state: closed`);
      break;
    default:
      console.log(`[${viewerName}] Connection state: unknown`);
      break;
  }
};
