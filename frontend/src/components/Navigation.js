import React, { useState } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import { Redirect } from 'react-router-dom';
import logo from '../assets/logo.svg';
import './Navigation.scss';
import { Input } from "baseui/input";
import { Button } from "baseui/button";

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchClicked, setSearchClicked] = useState(false);
  const [value, setValue] = useState("");

  const toggle = () => setIsOpen(!isOpen);

  const handleSearchClick = () => {
    console.log("Searching with", value);
    setSearchClicked(true);
  };

  if (searchClicked) {
    return (
      <Redirect
        push
        to={{
          pathname: "/session",
          state: { videoUrl: value }
        }}
      />
    );
  }

  return (
    <Navbar dark expand="md" className="Navigation">
      <NavbarBrand href="/">
        <img src={logo} alt=""/>
      </NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink href="https://github.com/reactstrap/reactstrap">GitHub</NavLink>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  )
}

export default Navigation;