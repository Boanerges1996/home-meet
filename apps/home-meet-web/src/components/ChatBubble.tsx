import Image from 'next/image';
import React from 'react';

export const ChatBubble = ({
  message,
  time,
  name,
  isMe,
}: {
  message: string;
  time: string;
  avatarUrl: string;
  isMe: boolean;
  name?: string;
}) => {
  const align = isMe ? 'flex-row-reverse' : 'flex-row';
  const justify = isMe ? 'justify-end' : 'justify-start';
  const bgColor = isMe ? 'bg-[#b7b6b7]' : 'bg-[#ECECEC]';
  const textColor = isMe ? 'text-black' : 'text-gray-800';
  const borderRadius = isMe
    ? 'rounded-tl-xl rounded-tr-xl rounded-bl-xl'
    : 'rounded-bl-xl rounded-tr-xl rounded-br-xl';

  return (
    <div className={`flex ${align} items-start mt-4 mb-4`}>
      <div className={`flex ${justify} items-start w-full`}>
        <div className={`inline-block p-3 ${bgColor} ${borderRadius}`}>
          {name && <p className="text-xs font-bold mb-1">{name}</p>}
          <p className={`text-sm ${textColor}`}>{message}</p>
          <div className="inline-block pl-1 pr-2">
            <span className="text-xs text-gray-500">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
