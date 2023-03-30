import { StyleProps } from '@/util';
import { Spin } from 'antd';
import React, { forwardRef, LegacyRef } from 'react';

export type MeetVideoProps = StyleProps & {
  isMuted: boolean;
  isHost: boolean | null;
  hasStartedStreaming: boolean;
};

const DEFAULT_PROPS = {} as const;

export const MeetVideo = forwardRef((props: MeetVideoProps, ref) => {
  const p = { ...DEFAULT_PROPS, ...props };

  if (!p.hasStartedStreaming) return <Spin />;

  return (
    <video
      ref={ref as LegacyRef<HTMLVideoElement>}
      className="w-[100%] object-cover m-0 p-0"
      muted={p.isHost ? p.isMuted : true}
      autoPlay
      height="60%"
    />
  );
});

MeetVideo.displayName = 'MeetVideo';
