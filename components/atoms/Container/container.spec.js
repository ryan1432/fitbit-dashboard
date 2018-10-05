import Container from './'

describe('Container', () => {
  it('renders children', () => {
    const child = 'this is a test'
    const wrapper = shallow(<Container>{child}</Container>)
    expect(wrapper).toMatchSnapshot()
  })
})
