import { IMeeting } from '@/util';
import { useEffect, useMemo, useState } from 'react';
import { Socket } from 'socket.io-client';

export const useMediaStream = ({
  isHost,
  meet,
  meetId,
  socket,
}: {
  isHost: boolean | null;
  meetId: string;
  socket: Socket | null;
  meet: IMeeting | null;
}) => {
  const [hasGotMediaStream, setHasGotMediaStream] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  console.log(isHost);
  const hasMetRequirements = useMemo(
    () => Boolean(isHost !== null && isHost && meetId && meet && socket),
    [isHost, meetId, meet, socket]
  );

  useEffect(() => {
    const getMediaStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput'
      );
      const audioDevices = devices.filter(
        (device) => device.kind === 'audioinput'
      );

      setAudioDevices(audioDevices);
      setVideoDevices(videoDevices);
      setSelectedAudioDevice(audioDevices[0].deviceId);
      setSelectedVideoDevice(videoDevices[0].deviceId);
      setMediaStream(stream);
    };

    if (hasMetRequirements && !hasGotMediaStream) {
      getMediaStream();
    }
  }, [hasGotMediaStream, hasMetRequirements]);

  return {
    mediaStream,
    setMediaStream,
    videoDevices,
    setVideoDevices,
    audioDevices,
    setAudioDevices,
    selectedVideoDevice,
    setSelectedVideoDevice,
    selectedAudioDevice,
    setSelectedAudioDevice,
  };
};
