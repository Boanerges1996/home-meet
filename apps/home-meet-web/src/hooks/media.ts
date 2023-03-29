import { useEffect, useState } from 'react';

interface MediaDeviceInfo {
  deviceId: string;
  kind: string;
  label: string;
}

interface MediaStreamConfig {
  video?: MediaTrackConstraints | boolean;
  audio?: MediaTrackConstraints | boolean;
}

export const useUserMedia = ({
  config,
  isHost,
}: {
  config: MediaStreamConfig;
  isHost: boolean | null;
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedVideoDevice, setSelectedVideoDevice] =
    useState<MediaDeviceInfo | null>(null);
  const [selectedAudioDevice, setSelectedAudioDevice] =
    useState<MediaDeviceInfo | null>(null);
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const videoConfig = config.video || true;
        const audioConfig = config.audio || true;
        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput'
        );
        const audioDevices = devices.filter(
          (device) => device.kind === 'audioinput'
        );

        if (videoDevices.length > 0 && !selectedVideoDevice) {
          setSelectedVideoDevice(videoDevices[0]);
        }

        if (audioDevices.length > 0 && !selectedAudioDevice) {
          setSelectedAudioDevice(audioDevices[0]);
        }

        const constraints: MediaStreamConstraints = {
          video: videoConfig,
          audio: audioConfig,
        };

        if (selectedVideoDevice) {
          constraints.video = {
            deviceId: { exact: selectedVideoDevice.deviceId },
          };
        }

        if (selectedAudioDevice) {
          constraints.audio = {
            deviceId: { exact: selectedAudioDevice.deviceId },
          };
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(stream);
        setHasStartedStreaming(true);
      } catch (error) {
        console.error('Error accessing user media:', error);
      }
    };

    if (isHost !== null && isHost) {
      getUserMedia();
    }
  }, [config, selectedVideoDevice, selectedAudioDevice, isHost]);

  const toggleVideoDevice = async (deviceId: string) => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === 'videoinput'
    );
    const selectedDevice = videoDevices.find(
      (device) => device.deviceId === deviceId
    );

    if (selectedDevice) {
      setSelectedVideoDevice(selectedDevice);
    }
  };

  const toggleAudioDevice = async (deviceId: string) => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(
      (device) => device.kind === 'audioinput'
    );
    const selectedDevice = audioDevices.find(
      (device) => device.deviceId === deviceId
    );

    if (selectedDevice) {
      setSelectedAudioDevice(selectedDevice);
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  return {
    stream,
    toggleMute,
    selectedVideoDevice,
    toggleVideoDevice,
    selectedAudioDevice,
    toggleAudioDevice,
    audioDevices,
    videoDevices,
    hasStartedStreaming,
  };
};
