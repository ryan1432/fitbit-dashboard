import Link from 'next/link'
import Head from 'next/head'

export default ({ children, title = 'Next.js / Express App' }) => (
  <div>
    <Head>
      <title>{ title }</title>
      <meta charSet='utf-8' />
      <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
    </Head>

    <div className="container">
      { children }
    </div>

    <div className='container'>
      <footer className='footer'>
        &copy; { new Date().getFullYear() } - @nickjvm
      </footer>
    </div>
    <style jsx global>{`
      html { font-size: 62.5%; }
      body {
        font-family: 'Helvetica Neue', arial, sans-serif;
        font-size: 1.6rem;
      }
      .container {
        width: 100%;
        max-width: 1280px;
        margin: auto;
      }
      table {
        border-collapse: collapse;
      }
      td {
        padding: 5px;
        border: 1px solid #ccc;
      }
      th td {
        text-align: left;
      }
    `}</style>
  </div>
)
