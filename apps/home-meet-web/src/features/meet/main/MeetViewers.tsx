import { ViewersCard } from '@/components/ViewersCard';
import { IUser, StyleProps } from '@/util';
import clsx from 'clsx';
import React from 'react';

export type MeetViewersProps = StyleProps & {
  viewers: IUser[];
};

const DEFAULT_PROPS = {} as const;

export default function MeetViewers(props: MeetViewersProps) {
  const p = { ...DEFAULT_PROPS, ...props };
  return (
    <div
      className={clsx(
        p.className,
        'h-[40%] overflow-x-scroll overflow-y-scroll snap-x-mandatory'
      )}
    >
      {p.viewers.map((viewer, idx) => (
        <ViewersCard key={idx} name={viewer.name ?? ''} />
      ))}
    </div>
  );
}
