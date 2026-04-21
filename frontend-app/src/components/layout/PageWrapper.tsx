import type { PropsWithChildren } from 'react';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function PageWrapper({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-4 pb-12 pt-8 md:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
