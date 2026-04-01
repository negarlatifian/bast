import { UnderConstruction } from '@/components/UnderConstruction';
import Image from 'next/image';

export default function Home() {
  return (
    <div>
      <main style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <UnderConstruction />
      </main>
    </div>
  );
}
