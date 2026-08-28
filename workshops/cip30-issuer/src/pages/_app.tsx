import { MeshProvider } from '@meshsdk/react';

import type { AppProps } from 'next/app';


function App({ Component, pageProps }: AppProps) {
    return (
      <MeshProvider>
        {/* Your actual app or pages */}
        <Component {...pageProps} />
      </MeshProvider>
    );
  }


export default App;
