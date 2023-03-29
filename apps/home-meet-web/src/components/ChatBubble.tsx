import Image from 'next/image';
import React from 'react';

export const ChatBubble = ({
  message,
  time,
  avatarUrl,
  isMe,
}: {
  message: string;
  time: string;
  avatarUrl: string;
  isMe: boolean;
}) => {
  const align = isMe ? 'flex-row-reverse' : 'flex-row';
  const justify = isMe ? 'justify-end' : 'justify-start';
  const bgColor = isMe ? 'bg-[#ECECEC]' : 'bg-[#ECECEC]';
  const textColor = isMe ? 'text-white' : 'text-gray-800';

  return (
    <div className={`flex ${align} items-end mb-4`}>
      <div className={`flex ${justify} items-center w-full`}>
        {!isMe && (
          <Image
            src={avatarUrl}
            alt="Avatar"
            className="w-8 h-8 rounded-full mr-2 mt-0"
            width={8}
            height={8}
          />
        )}
        <div
          className={`max-w-xs mx-2 px-4 py-2 rounded-lg shadow-md ${bgColor} ${textColor}`}
        >
          <p className="text-sm">{message}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs">{time}</span>
            {isMe && (
              <Image
                src={avatarUrl}
                alt="Avatar"
                className="w-6 h-6 rounded-full ml-2"
                width={6}
                height={6}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
