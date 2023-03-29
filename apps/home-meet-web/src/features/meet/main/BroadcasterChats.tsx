import ChatBubble from '@/components/ChatBubble';
import { ChatType, StyleProps } from '@/util';
import { Button } from 'antd';
import Input from 'rc-input';
import React from 'react';

export type BroadcasterChatsProps = StyleProps & {
  chats: ChatType[];
};

const DEFAULT_PROPS = {} as const;

export function BroadcasterChats(props: BroadcasterChatsProps) {
  const p = { ...DEFAULT_PROPS, ...props };
  const [message, setMessage] = React.useState<string>('');
  return (
    <div className="h-[100vh] border-1 border-solid border-[#e7e7e7] rounded overflow-hidden">
      <div className="h-[95%] overflow-scroll">
        {p.chats.map((chat, idx) => (
          <ChatBubble
            isMe={false}
            avatarUrl={chat.user.pic ?? ''}
            message={chat.message}
            time="12:00"
            key={idx}
          />
        ))}
      </div>

      <Input
        className="bottom-0 h-[5%] w-full"
        onChange={(e) => setMessage(e.target.value)}
      />
    </div>
  );
}
