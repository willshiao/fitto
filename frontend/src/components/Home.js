import React, { useState } from 'react';
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import { Redirect } from "react-router-dom";
import Navigation from './Navigation';
import { LightTheme, BaseProvider } from 'baseui';
import banner from '../assets/banner.svg';
import './Home.scss';
import featuredData from '../featuredData';

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
      <div className="Home__header">
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
      <div className="Home__featured container-fluid">
        <div className="row justify-content-center">
          <div className="col-9">
            <div className="Home__featuredTitle">Featured</div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-9">
            <div className="row justify-content-center">
              {featuredData.map(({ thumbnail, duration, title, username }) => (
                <div className="col-4">
                  <div className="Home__featuredCard" onClick={() => {}}>
                    <img className="Home__videoThumbnail" src={thumbnail} alt=""/>
                    <div className="Home__videoDuration">
                      {duration}
                    </div>
                    <div className="Home__videoUser">
                      <div className="Home__videoTitle">
                        {title}
                      </div>
                      <div className="Home__videoUsername">
                        {username}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseProvider>
  );
}

export default Home;