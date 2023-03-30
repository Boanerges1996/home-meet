import { StyleProps } from '@/util';
import { Modal, Select, Space, Typography } from 'antd';
import React from 'react';

export type SelectDeviceModelProps = StyleProps & {
  isVisible?: boolean;
  onCancel?: () => void;
  onOk?: () => void;
  onSelectAudioDevice?: (audio: string) => void;
  onSelectVideoDevice?: (video: string) => void;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedAudioDevice: string | null;
  selectedVideoDevice: string | null;
};

const DEFAULT_PROPS = {} as const;

export function SelectDeviceModel(props: SelectDeviceModelProps) {
  const p = { ...DEFAULT_PROPS, ...props };

  return (
    <Modal open={p.isVisible} onCancel={p.onCancel} onOk={p.onOk}>
      <Space direction="vertical">
        <Typography.Title level={4}>Audio Devices</Typography.Title>
        <Select
          value={p?.selectedAudioDevice}
          placeholder="Select microphone"
          options={[
            ...p.audioDevices.map((device) => ({
              label: device.label,
              value: device.deviceId,
            })),
          ]}
          onChange={p.onSelectAudioDevice}
        />
        <Typography.Title level={4}>Video Devices</Typography.Title>
        <Select
          value={p?.selectedVideoDevice}
          placeholder="Select camera"
          options={[
            ...p.videoDevices.map((device) => ({
              label: device.label,
              value: device.deviceId,
            })),
          ]}
          onChange={p.onSelectVideoDevice}
        />
      </Space>
    </Modal>
  );
}
