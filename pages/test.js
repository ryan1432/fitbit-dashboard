import React from 'react'

export default class Test extends React.Component {
  constructor () {
    super()
    this.state = {}
  }

  onChange = e => {
    this.setState({
      input: e.target.value,
    })
  }
  render () {
    return (
      <div>
        {this.state.input}
        <input name="input" onChange={this.onChange} value={this.state.input} />
      </div>
    )
  }
}
