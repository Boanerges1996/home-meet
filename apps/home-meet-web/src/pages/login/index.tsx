import React from 'react';

const Login = React.lazy(() =>
  import('@/features').then((module) => ({ default: module.Login }))
);

export default function LoginPage() {
  return <Login />;
}
