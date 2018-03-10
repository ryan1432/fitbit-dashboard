import PropTypes from 'prop-types'
import Link from 'next/link'

import colors from '../../styles/colors'
import spacing from '../../styles/spacing'
import typography from '../../styles/typography'

export default function Avatar ({ user }) {
  return (
    <div className="avatar">
      {user.avatar && <img src={user.avatar} className="avatar-image" />}
      {!user.avatar && <div className="avatar-image placeholder" />}
      <span className="greeting">
        {user.firstName && `Heya, ${user.firstName}!`}
        {!user.firstName && 'Hey there!'}
        <small className="disclaimer">
          Not you?
          <Link href="/logout" prefetch><a className="test">Log out</a></Link>
        </small>
      </span>
      <style jsx>{`
        .avatar {
          display: flex;
          align-items: center;
          margin-bottom: ${spacing.small};
        }

        .avatar-image {
          overflow: hidden;
          border-radius: 100px;
          width: 50px;
          height: 50px;
          margin-right: ${spacing.small};
        }

        .placeholder {
          background: ${colors.darkGrey};
        }
        @media(min-width: 768px) {
          .avatar {
            margin-bottom: 0;
          }
        }

        .greeting {
          display: flex;
          align-items: flex-end;
        }

        .disclaimer {
          font-size: ${typography.text.small};
          margin-left: ${spacing.small};
        }

        .disclaimer a {
          color: ${colors.text};
          text-decoration: none;
          margin-left: ${spacing.small};
        }
      `}</style>
    </div>
  )
}

Avatar.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string,
    firstName: PropTypes.string,
  }),
}
