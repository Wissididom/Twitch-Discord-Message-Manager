import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <title>Twitch-Discord-Message-Manager</title>
        <link rel="stylesheet" href="styles.css" />
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
