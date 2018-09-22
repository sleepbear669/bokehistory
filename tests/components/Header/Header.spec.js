import React from 'react'
import {Header} from 'madComponents/Header/Header'
import {Link} from 'react-router-dom'
import {shallow} from 'enzyme'

describe('(Component) Header', () => {
    let _wrapper

    beforeEach(() => {
        _wrapper = shallow(<Header/>)
    })

    // it('Renders a welcome message', () => {
    //   const welcome = _wrapper.find('h1')
    //   expect(welcome).to.exist
    //   expect(welcome.text()).to.match(/React Redux Starter Kit/)
    // })

    describe('Navigation links...', () => {
        it('Should render a Link to Home route', () => {
            expect(_wrapper.contains(
                <Link to='/'>Home</Link>
            )).to.be.true
        })

        it('Should render a Link to Counter route', () => {
            expect(_wrapper.contains(
                <Link to='/counter'>Counter</Link>
            )).to.be.true
        })

        it('Should render a Link to Guide route', () => {
            expect(_wrapper.contains(
                <Link to='/guide'>Design Guide</Link>
            )).to.be.true
        })
    })
})
