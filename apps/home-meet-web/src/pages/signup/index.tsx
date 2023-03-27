import React, { ReactNode } from 'react';

const Signup = React.lazy(() =>
  import('@/features').then((module) => ({ default: module.Signup }))
);

export default function SignupPage(): ReactNode {
  return <Signup />;
}
