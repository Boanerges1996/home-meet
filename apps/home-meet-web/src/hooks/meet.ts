import { axiosClient, IMeeting } from '@/util';
import { useQuery } from 'react-query';
import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

export const useMeetData = (meetId: string | null | undefined) => {
  const { data: meetData } = useQuery(
    ['get-meet-data', meetId],
    async () => {
      return axiosClient.get('/meet/get/' + meetId);
    },
    {
      enabled: Boolean(meetId),
    }
  );

  return { meet: meetData?.data?.data };
};
import { INCOMING_CANDIDATE, INCOMING_OFFER, NEW_ANSWER } from '@/common';

const useViewerPeerConnection = ({
  viewerPeerConnectionToBroadcaster,
  socket,
  meetId,
  profile,
}: {
  viewerPeerConnectionToBroadcaster?: RTCPeerConnection;
  socket: Socket | null;
  meetId: string | null;
  profile: any;
}) => {
  useEffect(() => {
    if (viewerPeerConnectionToBroadcaster && socket && meetId) {
      socket.on(
        INCOMING_OFFER,
        async (data: { offer: any; viewerId: string }) => {
          try {
            if (viewerPeerConnectionToBroadcaster) {
              await viewerPeerConnectionToBroadcaster.setRemoteDescription(
                data.offer
              );

              const answer =
                await viewerPeerConnectionToBroadcaster.createAnswer();

              await viewerPeerConnectionToBroadcaster.setLocalDescription(
                answer
              );

              socket.emit(NEW_ANSWER, {
                roomId: meetId,
                data: {
                  answer,
                  viewerId: profile._id,
                },
              });
            }
          } catch (error) {}
        }
      );

      socket.on(
        INCOMING_CANDIDATE,
        async ({
          candidate,
        }: {
          candidate: RTCIceCandidate;
          userId: string;
        }) => {
          if (viewerPeerConnectionToBroadcaster)
            viewerPeerConnectionToBroadcaster.addIceCandidate(candidate);
        }
      );
    }
  }, [meetId, profile._id, socket, viewerPeerConnectionToBroadcaster]);
};

export default useViewerPeerConnection;
