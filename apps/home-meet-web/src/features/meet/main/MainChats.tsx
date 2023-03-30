import ChatBubble from '@/components/ChatBubble';
import { ChatType, IUser, StyleProps } from '@/util';
import { Button, Input } from 'antd';
import React from 'react';
import { BsSend } from 'react-icons/bs';

export type MainChatsProps = StyleProps & {
  dataChannel?: RTCDataChannel;
  user: IUser;
  onSend?: (message: string) => void;
  chats: ChatType[];
  isHost: boolean | null;
  sendMessage?: (message: string) => void;
};

const DEFAULT_PROPS = {} as const;

export default function MainChats(props: MainChatsProps) {
  const p = { ...DEFAULT_PROPS, ...props };
  const [message, setMessage] = React.useState<string>('');

  if (p.isHost === null) return null;

  const verifyIsHost = p.isHost !== null && p.isHost;
  const height = verifyIsHost ? 'h-[100%]' : 'h-[95%]';

  const sendMessageWithDataChannel = () => {
    if (p.dataChannel && message) {
      p.sendMessage && p.sendMessage(message);
      p.dataChannel.send(
        JSON.stringify({
          message,
          user: p.user,
        })
      );
      setMessage('');
    }
  };

  return (
    <div className="h-[100vh] border-1 border-solid border-[#e7e7e7] rounded overflow-hidden">
      <div className={`${height} overflow-scroll`}>
        {p.chats.map((chat, idx) => (
          <ChatBubble
            isMe={verifyIsHost ? false : true}
            avatarUrl={chat.user.pic ?? ''}
            message={chat.message}
            time="12:00"
            key={idx}
          />
        ))}
      </div>

      {!verifyIsHost && (
        <Input
          className="bottom-0 h-[5%] w-full"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          suffix={
            <Button
              icon={
                <BsSend
                  size={15}
                  className="pt-1"
                  onClick={sendMessageWithDataChannel}
                />
              }
            />
          }
        />
      )}
    </div>
  );
}
