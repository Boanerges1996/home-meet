import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const Meeting = dynamic(
  () =>
    import('@/features').then((module) => ({
      default: module.MeetMain,
    })),
  {
    ssr: false,
  }
);

export default function MeetingRoom(): ReactNode {
  return <Meeting />;
}
