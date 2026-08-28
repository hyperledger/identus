import { MountSDK } from '@/components/Agent';

function App({ Component, pageProps }) {
    return (
        <MountSDK>
            <Component {...pageProps} />
        </MountSDK>
    );
}

export default App;
