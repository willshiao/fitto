import React, { useState } from 'react';
import './Results.scss';
import winnerImage from '../assets/pixeltrue-yoga 1.svg';
import Navigation from './Navigation';
import { Button } from "baseui/button";
import { Redirect } from 'react-router-dom';

function Results(props) {
  const { location: { state: { accuracies } } } = props;
  const getAverage = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

  const [finishClicked, setFinishClicked] = useState(false);

  if (finishClicked) {
    return <Redirect push to={{ pathname: "/" }} />;
  }

  return (
    <div className="Results container-fluid">
      <Navigation />
      <div className="Results__content">
        <div className="row justify-content-center">
          <div className="col-5">
            <div className="Results__imageWrap">
              <img src={winnerImage} alt="" className="Results__image"/>
            </div>
          </div>
          <div className="col-5">
            <div className="Results__score">{getAverage(accuracies).toFixed(2)}</div>
            <div className="Results__info">
              <p>This is how you ended up doing on average! Aren’t satisfied with the score? Trying making sure with the following:</p>
              <ul>
                <li>You’re surroundings are well-lit</li>
                <li>No one else is around you</li>
                <li>You’re completely visible to your camera</li>
              </ul>
            </div>
            <Button onClick={() => setFinishClicked(true)} className="Results__finish">Finish</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;