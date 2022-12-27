import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Twitch-Discord-Message-Manager</title>
        <script type="application/javascript" src="lib/tmi.min.js"></script>
        <script defer type="application/javascript" src="app.js"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
