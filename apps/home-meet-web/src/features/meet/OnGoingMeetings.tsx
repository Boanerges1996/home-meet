import { AppContext } from '@/providers';
import React, { useContext } from 'react';

export function OnGoingMeetings() {
  const { meetings } = useContext(AppContext);
  return (
    <div>
      <p className="text-[25px] text-center m-0">Meetings</p>
      {meetings?.map((meeting) => (
        <p key={meeting._id}>{meeting.title}</p>
      ))}
    </div>
  );
}
