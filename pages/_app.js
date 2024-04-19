import "@/styles/globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import Head from "next/head";
import { config } from "@fortawesome/fontawesome-svg-core";
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss =  false;
export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Head>
        <link rel="icon" href="/favicon.ico"></link>
      </Head>
      <Component {...pageProps} />
    </UserProvider>
  );
}
