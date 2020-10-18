import React from 'react';
import {
  Navbar,
  NavbarBrand,
} from 'reactstrap';
import logo from '../assets/logo.svg';
import './Navigation.scss';

function Navigation() {
  return (
    <div className="Navigation__wrapper">
      <Navbar dark expand="md" className="Navigation p-4">
        <NavbarBrand href="/">
          <img src={logo} alt=""/>
        </NavbarBrand>
      </Navbar>
    </div>
  )
}

export default Navigation;