import '@/styles/globals.css';
import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#b039cc',
        },
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
