// src/pages/index.tsx
import dynamic from 'next/dynamic';
import Head from 'next/head';

const SimpleMap = dynamic(() => import('../components/SimpleMap'), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Leaflet Map Example</title>
      </Head>
      <main style={{ padding: '1rem' }}>
        <h1>Leaflet Map Demo</h1>
        <SimpleMap />
      </main>
    </div>
  );
}