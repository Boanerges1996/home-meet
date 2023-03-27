import React from 'react';

const Meeting = React.lazy(() =>
  import('@/features').then((module) => ({ default: module.Meeting }))
);

export default function MeetingRoom() {
  return <Meeting />;
}
