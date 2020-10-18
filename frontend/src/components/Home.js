import React, { useState } from 'react';
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import { Redirect } from "react-router-dom";
import Navigation from './Navigation';
import { LightTheme, BaseProvider } from 'baseui';
import banner from '../assets/banner.svg';
import './Home.scss';

function Home() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    console.log("Submitting with value", value);
    setSubmitted(true);
  };

  if (submitted) {
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
    <BaseProvider theme={LightTheme}>
      <div className="Home">
        <Navigation />
        <div className="Home__actions">
          <div className="Home__text">Stay active at home, <br/> keep in shape.</div>
          <div className="Home__search">
            <Input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Youtube URL"
              clearOnEscape
            />
            <Button onClick={handleSubmit}>Enter</Button>
          </div>
        </div>
        <img src={banner} alt="" className="Home__banner"/>
      </div>
    </BaseProvider>
  );
}

export default Home;