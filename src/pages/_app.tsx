import '@/app/globals.css';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';

// Disable SSR for the entire app
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

// Disable SSR by using dynamic import with ssr: false
export default dynamic(() => Promise.resolve(MyApp), {
  ssr: false,
}); 