import { useEffect, useState } from 'react';

export function useGetMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setDevices(devices);
    });
  }, []);

  return devices;
}

export function useGetUserMedia(constraints: MediaStreamConstraints) {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      setStream(stream);
    });
  }, [constraints]);

  return stream;
}

export function useGetDisplayMedia(constraints: MediaStreamConstraints) {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getDisplayMedia(constraints).then((stream) => {
      setStream(stream);
    });
  }, [constraints]);

  return stream;
}
