import { AppContext, HomeMeetProvider } from '@/providers';
import '@/styles/globals.css';
import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#b039cc',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <HomeMeetProvider>
          <Component {...pageProps} />
        </HomeMeetProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
