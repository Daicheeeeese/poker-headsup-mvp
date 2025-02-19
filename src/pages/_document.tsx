import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="QnZoLRFeR9TfWYROTey81hXeLAIhGsH5iRGiJHr5JAg" />
        
        {/* Google AdSense 確認用のメタタグ */}
        <meta name="google-adsense-account" content="ca-pub-8437153362194493" />
        
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}`}
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 