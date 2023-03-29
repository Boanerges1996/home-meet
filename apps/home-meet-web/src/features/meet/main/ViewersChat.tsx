import { IUser, StyleProps } from '@/util';
import { Button, Input, Space } from 'antd';
import React from 'react';
import { BsSend } from 'react-icons/bs';

export type ViewersChatsProps = StyleProps & {
  dataChannel?: RTCDataChannel;
  user: IUser;
  onSend?: (message: string) => void;
};

const DEFAULT_PROPS = {} as const;

export function ViewersChat(props: ViewersChatsProps) {
  const p = { ...DEFAULT_PROPS, ...props };
  const [message, setMessage] = React.useState<string>('');
  return (
    <div className="h-[100vh] border-1 border-solid border-[#e7e7e7] rounded overflow-hidden">
      <div className="h-[95%]"></div>

      <Input
        className="bottom-0 h-[5%] w-full"
        onChange={(e) => setMessage(e.target.value)}
        suffix={
          <Button
            icon={
              <BsSend
                size={15}
                className="pt-1"
                onClick={() => {
                  if (p.dataChannel && message) {
                    p.dataChannel.send(
                      JSON.stringify({
                        message,
                        user: p.user,
                      })
                    );
                    setMessage('');
                  }
                }}
              />
            }
          />
        }
      />
    </div>
  );
}
