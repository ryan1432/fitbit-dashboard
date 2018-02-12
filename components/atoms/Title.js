import typography from '../../styles/typography'
import colors from '../../styles/colors'

export default function Title ({ tag: Tag, children, className }) {
  return (
    <Tag className={className}>
      <span>{children}</span>
      <style jsx>{`
        span {
          font-size: ${typography.text.large};
          color: ${colors.darkGrey};
          font-weight: normal;
        }
      `}</style>
    </Tag>
  )
}

Title.defaultProps = {
  tag: 'h2',
}
