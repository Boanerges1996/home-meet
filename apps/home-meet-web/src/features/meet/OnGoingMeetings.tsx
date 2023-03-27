import { MeetingListCard } from '@/components';
import { AppContext } from '@/providers';
import { IMeeting } from '@/util';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';

export function OnGoingMeetings() {
  const { meetings, setSelectedMeetingCtx } = useContext(AppContext);
  const router = useRouter();

  const joinMeeting = (meet: IMeeting) => {
    setSelectedMeetingCtx!(meet);
    router.push(`/meet/${meet._id}`);
  };
  return (
    <div>
      <p className="text-[25px] text-center m-0">Meetings</p>
      {meetings?.map((meeting) => (
        <MeetingListCard
          key={meeting._id}
          meet={meeting}
          clickJoin={() => joinMeeting(meeting)}
        />
      ))}
    </div>
  );
}
