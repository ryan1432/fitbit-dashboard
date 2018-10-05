import Clickable from './'

describe('Clickable', () => {
  it('renders children', () => {
    const child = 'this is a test'
    const wrapper = shallow(<Clickable>{child}</Clickable>)
    expect(wrapper).toMatchSnapshot()
  })
})
