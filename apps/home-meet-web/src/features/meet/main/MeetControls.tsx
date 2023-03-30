import { SelectDeviceModel } from '@/components';
import { StyleProps } from '@/util';
import { Button, Space, Spin, Tooltip } from 'antd';
import React from 'react';
import { BsFillMicFill, BsFillMicMuteFill } from 'react-icons/bs';
import { AiFillSetting } from 'react-icons/ai';

export type MeetControlsProps = StyleProps & {
  isMuted: boolean;
  selectedAudioDevice: string | null;
  selectedVideoDevice: string | null;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  toggleMute: () => void;
  isHost: boolean | null;
  onSelectAudioDevice?: (audio: string) => void;
  onSelectVideoDevice?: (video: string) => void;
};

const DEFAULT_PROPS = {} as const;

export function MeetControls(props: MeetControlsProps) {
  const [showSelectDevice, setShowSelectDevice] =
    React.useState<boolean>(false);

  const p = { ...DEFAULT_PROPS, ...props };
  if (p.isHost === null) return <Spin />;
  if (!p.isHost) return null;
  return (
    <div className="h-[85px] w-full bg-black opacity-75 py-2 mt-[-105px] flex items-center justify-center">
      {showSelectDevice && (
        <SelectDeviceModel
          isVisible={showSelectDevice}
          audioDevices={p.audioDevices}
          videoDevices={p.videoDevices}
          selectedAudioDevice={p.selectedAudioDevice}
          selectedVideoDevice={p.selectedVideoDevice}
          onCancel={() => setShowSelectDevice(false)}
          onOk={() => setShowSelectDevice(false)}
          onSelectAudioDevice={p?.onSelectAudioDevice}
          onSelectVideoDevice={p?.onSelectVideoDevice}
        />
      )}
      <Space>
        <Tooltip title={p.isMuted ? 'Unmute' : 'Mute'}>
          <Button onClick={p.toggleMute} shape="circle">
            {p.isMuted ? <BsFillMicMuteFill /> : <BsFillMicFill />}
          </Button>
        </Tooltip>
        <Button shape="circle" onClick={() => setShowSelectDevice(true)}>
          <AiFillSetting className="mt-1" />
        </Button>
      </Space>
    </div>
  );
}
