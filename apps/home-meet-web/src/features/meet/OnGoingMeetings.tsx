import { MeetingListCard } from '@/components';
import { AppContext } from '@/providers';
import { IMeeting } from '@/util';
import { notification } from 'antd';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';

export function OnGoingMeetings() {
  const { meetings, setSelectedMeetingCtx, profile, isLogged } =
    useContext(AppContext);
  const router = useRouter();

  const joinMeeting = (meet: IMeeting) => {
    if (isLogged) {
      setSelectedMeetingCtx!(meet);
      router.push(`/meet/${meet._id}`);
      return;
    }

    notification.warning({
      message: 'Please login before you can join a meeting',
      duration: 2,
    });
  };
  return (
    <div>
      <p className="text-[25px] text-center m-0">Ongoing Broadcast</p>
      {meetings?.map((meeting) => (
        <MeetingListCard
          key={meeting._id}
          meet={meeting}
          clickJoin={() => joinMeeting(meeting)}
          userId={profile._id!}
        />
      ))}
    </div>
  );
}
