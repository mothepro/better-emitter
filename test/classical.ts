import { spy } from 'sinon'
import { SafeEmitter } from '../index.js'
import { later } from './util.js'

let action: SafeEmitter

describe('Simple classical usage', () => {
  beforeEach(() => (action = new SafeEmitter()))

  it('activated once', done => {
    action.once(done)
    action.activate()
  })

  it('activated three times', done => {
    const listener = spy()

    action.on(listener)
    action
      .activate()
      .activate()
      .activate()
    
    later(() => {
      listener.should.have.been.calledThrice()
      done()
    })
  })

  it('activated more times', done => {
    const listener = spy()

    action.on(listener)
    action.on(listener)
    action
      .activate()
      .activate()
      .activate()
    
    
    later(() => {
      listener.should.have.callCount(6)
      done()
    })
  })

  it("should activate both once's", done => {
    const listener = spy()
    
    action.once(listener)
    action.once(listener)

    action.activate()

    later(() => {
      listener.should.have.been.calledTwice()
      done()
    })
  })
})
