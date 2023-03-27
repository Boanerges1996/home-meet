'use client';

import React from 'react';

const Landing = React.lazy(() =>
  import('@/features').then((module) => ({ default: module.Landing }))
);

export default function Home() {
  return <Landing />;
}
