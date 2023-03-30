import { EXCHANGE_ICE_CANDIDATES, JOIN_AS_VIEWER } from '@/common';
import { AppContext } from '@/providers';
import { IMeeting } from '@/util';
import { notification } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useSocket } from './socket';

export const useViewer = ({
  isHost,
  meetId,
  meet,
}: {
  isHost: boolean | null;
  meetId: string;
  meet: IMeeting | null;
}) => {
  const [hasSetViewerPeerConnection, setHasSetViewerPeerConnection] =
    useState<boolean>(false);
  const [
    viewersMediaStreamFromBroadcaster,
    setViewersMediaStreamFromBroadcaster,
  ] = useState<MediaStream>();
  const [
    viewerPeerConnectionToBroadcaster,
    setViewerPeerConnectionToBroadcaster,
  ] = useState<RTCPeerConnection>();
  const [viewerDataChannelToBroadcaster, setViewerDataChannelToBroadcaster] =
    useState<RTCDataChannel>();
  const [hasStartedStreaming, setHasStartedStreaming] =
    useState<boolean>(false);
  const { profile } = useContext(AppContext);
  const [socket] = useSocket();

  const hasMetViewerRequirements =
    isHost !== null &&
    !isHost &&
    meetId &&
    meet &&
    socket &&
    !hasSetViewerPeerConnection;

  useEffect(() => {
    if (hasMetViewerRequirements) {
      socket.emit(
        JOIN_AS_VIEWER,
        {
          roomId: meetId,
          viewerData: {
            viewerId: profile._id,
            name: profile.name,
            pic: profile.pic,
          },
        },
        async (data: { success: boolean }) => {
          if (data.success) {
            const viewerPeerConnection = new RTCPeerConnection({
              iceServers: [
                {
                  urls: 'stun:stun.l.google.com:19302',
                },
              ],
            });

            // this is used by the sender to send data to the receiver
            let sendChannel = viewerPeerConnection.createDataChannel(
              'chat',
              {}
            );

            sendChannel.onopen = () => {
              console.log('data channel opened');
            };

            sendChannel.onmessage = (event) => {
              console.log('data channel message', event.data);
            };

            sendChannel.onclose = () => {
              console.log('data channel closed');
            };

            viewerPeerConnection.onicecandidate = (event) => {
              if (event.candidate) {
                // Send ice candidates to broadcaster
                socket.emit(EXCHANGE_ICE_CANDIDATES, {
                  candidate: event.candidate,
                  userId: meet.creator._id,
                  viewerId: profile._id,
                  roomId: meetId,
                });
              }
            };

            viewerPeerConnection.ontrack = (event) => {
              if (event.streams && event.streams[0]) {
                setViewersMediaStreamFromBroadcaster(event.streams[0]);
                setHasStartedStreaming(true);
              }
            };

            viewerPeerConnection.onconnectionstatechange = (event) => {
              if (viewerPeerConnection.connectionState === 'failed') {
                notification.open({
                  message: 'Broadcaster has left the meet',
                  description:
                    'The connection to the broadcaster has been closed',
                  duration: 5,
                });
                // router.push('/');
              }
              console.log(
                'connection state',
                viewerPeerConnection.connectionState
              );
            };

            setViewerPeerConnectionToBroadcaster(viewerPeerConnection);
            setHasSetViewerPeerConnection(true);
            setViewerDataChannelToBroadcaster(sendChannel);
          }
        }
      );
    }
  }, [
    hasMetViewerRequirements,
    meet?.creator._id,
    meetId,
    profile._id,
    profile.name,
    profile.pic,
    socket,
  ]);

  return {
    hasStartedStreaming,
    viewersMediaStreamFromBroadcaster,
    viewerPeerConnectionToBroadcaster,
    viewerDataChannelToBroadcaster,
  };
};
