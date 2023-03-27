import React, { ReactNode } from 'react';

const Meeting = React.lazy(() =>
  import('@/features').then((module) => ({ default: module.Meeting }))
);
export default function MeetingPage(): ReactNode {
  return <Meeting />;
}
