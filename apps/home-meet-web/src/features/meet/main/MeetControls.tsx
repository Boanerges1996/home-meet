import { StyleProps } from '@/util';
import { Button, Select, Space, Tooltip } from 'antd';
import React from 'react';
import { BsFillMicFill, BsFillMicMuteFill } from 'react-icons/bs';

export type MeetControlsProps = StyleProps & {
  isMuted: boolean;
  selectedAudioDevice: string | null;
  selectedVideoDevice: string | null;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  toggleMute: () => void;
  isHost: boolean | null;
};

const DEFAULT_PROPS = {} as const;

export function MeetControls(props: MeetControlsProps) {
  const p = { ...DEFAULT_PROPS, ...props };
  if (p.isHost === null) return null;
  if (!p.isHost) return null;
  return (
    <div className="h-[85px] w-full bg-black opacity-75 py-2 mt-[-105px] flex items-center justify-center">
      <Space>
        <Tooltip title={p.isMuted ? 'Unmute' : 'Mute'}>
          <Button onClick={p.toggleMute} shape="circle">
            {p.isMuted ? <BsFillMicMuteFill /> : <BsFillMicFill />}
          </Button>
        </Tooltip>
        <Select
          value={p.selectedAudioDevice}
          placeholder="Select microphone"
          options={[
            ...p.audioDevices.map((device) => ({
              label: device.label,
              value: device.deviceId,
            })),
          ]}
        />
        <Select
          value={p.selectedVideoDevice}
          placeholder="Select camera"
          options={[
            ...p.videoDevices.map((device) => ({
              label: device.label,
              value: device.deviceId,
            })),
          ]}
        />
      </Space>
    </div>
  );
}
