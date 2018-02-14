import qs from 'query-string'
import Color from 'color'

import Container from '../atoms/Container'

import colors from '../../styles/colors'
import typography from '../../styles/typography'
import spacing from '../../styles/spacing'

import Clickable from '../atoms/Clickable'

const AUTHORIZE_URL = `${process.env.FITBIT_OAUTH_URL}?${qs.stringify({
  response_type: 'code',
  client_id: process.env.FITBIT_OAUTH_CLIENT_ID,
  redirect_uri: `${process.env.APP_URL}${process.env.FITBIT_CALLBACK_ENDPOINT}`,
  scope: 'activity profile heartrate',
  expires_in: 2592000,
})}`

export default function Mask (props) {
  return (
    <div className="mask">
      <Container max="400px">
        <div className="mask-inner">
          <h2>Hey there!</h2>
          <p>We need to connect to your Fitbit account to show you your stats. Click the link below to log into your Fitbit account</p>
          <p>After you log in, you&apos;ll be brought back to your dashboard.</p>
          <div className="action"><Clickable href={AUTHORIZE_URL}>Authorize</Clickable></div>
        </div>
      </Container>
      <style jsx>{`
        .mask {
          background: ${Color(colors.white).fade(0.3)};
          padding: ${spacing.large};
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        h2 {
          font-size: ${typography.text.large};
        }
        .action {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mask-inner {
          background ${colors.white};
          border: 1px solid ${colors.border};
          padding: ${spacing.large};
          border-radius: 3px;
        }
        `}</style>
    </div>
  )
}
