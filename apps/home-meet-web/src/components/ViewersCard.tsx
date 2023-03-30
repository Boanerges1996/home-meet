import { generateRandomColor, StyleProps } from '@/util';
import { Tooltip } from 'antd';
import React from 'react';

export type ViewerCardProps = StyleProps & {
  name: string;
};

const DEFAULT_PROPS = {} as const;

export function ViewersCard(props: ViewerCardProps) {
  const p = { ...DEFAULT_PROPS, ...props };
  const [color, setColor] = React.useState<string>(generateRandomColor());

  return (
    <div className="w-[150px] h-[150px] inline-block m-1">
      <div
        style={{ backgroundColor: color }}
        className="w-full h-full flex items-center justify-center text-black text-[25px] rounded"
      >
        <Tooltip title={p.name}>{p.name.split(' ').map((n) => n[0])}</Tooltip>
      </div>
    </div>
  );
}
