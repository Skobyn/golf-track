import dynamic from 'next/dynamic';

// Import home content with SSR disabled
const HomeContent = dynamic(() => import('@/components/HomeContent'), {
  ssr: false,
  loading: () => <div className="flex min-h-screen items-center justify-center">Loading...</div>
});

export default function Index() {
  return <HomeContent />;
} 