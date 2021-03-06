import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
  SIZE,
  ROLE
} from "baseui/modal";
import { Button, SIZE as ButtonSize, KIND as ButtonKind } from "baseui/button";
import { Spinner } from "baseui/spinner";
import PoseNet from "react-posenet"
import { Redirect } from "react-router-dom";
import "./Session.scss";
import sendVideo from '../services/video';
import ReactPlayer from 'react-player';
import socketIOClient from "socket.io-client";
import { SOCKET_URL } from '../constants';
import Navigation from './Navigation';

const socket = socketIOClient(SOCKET_URL);

function Session(props) {
  const [isOpen, setIsOpen] = useState(true);
  const [backClicked, setBackClicked] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [lastOneSent, setLastOneSent] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState(null);
  const [prevTime, setPrevTime] = useState(0);
  const [poseHint, setPoseHint] = useState("");
  const [poseBatch, setPoseBatch] = useState([]);
  const [accuracies, setAccuracies] = useState([]);
  const youtubeEl = useRef(null);

  useEffect(() => {
    if (!socket.hasListeners('poses:res')) {
      socket.on('poses:res', data => {
        console.log("Got back data", data);
        const { score, hint } = data;
        setUserScore(score.toFixed(2));
        setPoseHint(hint);
        setAccuracies(prevAccuracies => [...prevAccuracies, score]);
      });
    }
  });

  if (!props.location || !props.location.state || !props.location.state.videoUrl) {
    return <Redirect to="/" />;
  }

  const handleEstimate = poses => {
    const currentTime = youtubeEl.current.getCurrentTime();
    const totalDuration = youtubeEl.current.getDuration();
    const difference = currentTime - prevTime;

    const pose = poses[0];
    let obj;

    if (pose && pose.keypoints) {
      const { keypoints } = pose;
      keypoints.forEach(keypoint => {
        const { part, position } = keypoint;
        const { x, y } = position;
        obj = { ...obj, [part]: [x, y] };
      });
    }

    if (currentTime !== totalDuration && currentTime > 0) {
      if (difference < 3) {
        setPoseBatch(prevPoseBatch => [...prevPoseBatch, obj]);
      } else {
        console.log("Sending batch", poseBatch);

        socket.emit("poses:req", {
          startTime: prevTime,
          endTime: currentTime,
          videoUrl: "https://www.youtube.com/watch?v=vHBR5MZmEsY",
          poseBatch
        });
  
        setPrevTime(currentTime);
        setPoseBatch([]);
      }
    } else if (currentTime === totalDuration) {
      if (!lastOneSent) {
        socket.emit("poses:req", {
          startTime: prevTime,
          endTime: currentTime,
          videoUrl: "https://www.youtube.com/watch?v=vHBR5MZmEsY",
          poseBatch
        });
  
        setPrevTime(currentTime);
        setPoseBatch([]);
      }

      setLastOneSent(true);
    }
  };

  const handleReady = () => {
    const { location: { state: { videoUrl } } } = props;
    setModalLoading(true);
    setHasError(false);

    sendVideo(videoUrl)
      .then(response => {
        console.log("Got response", response);
        const { data: { videoUrl } } = response;

        setIsOpen(false);
        setModalLoading(false);
        setHasError(false);
        setYoutubeUrl(videoUrl);
      })
      .catch(error => {
        console.error("Error", error);
        setModalLoading(false);
        setHasError(true);
      });
  };

  const renderModalContent = () => {
    const loadingContent = (
      <>
        <ModalHeader>
          Just hang tight...
        </ModalHeader>
        <ModalBody>
          We're working hard to prepare the session for you.
          <div className="Session__spinnerWrapper">
            <Spinner className="Session__spinner" />
          </div>
        </ModalBody>
      </>
    );

    const preparationContent = (
      <>
        <ModalHeader>
          Are you prepared?
        </ModalHeader>
        <ModalBody>
          Make sure you’ve allowed browser permissions!
          <PoseNet className="Session__posenetModal" />
        </ModalBody>
        <ModalFooter>
          <ModalButton
            kind={ButtonKind.tertiary}
            onClick={() => setBackClicked(true)}
          >
            Back
          </ModalButton>
          <ModalButton onClick={handleReady}>Ready</ModalButton>
        </ModalFooter>
      </>
    );

    const errorContent = (
      <>
        <ModalHeader>
          Oops, something went wrong!
        </ModalHeader>
        <ModalBody>
          Try again in a bit and see if it'll work.
        </ModalBody>
        <ModalFooter>
          <ModalButton
            kind={ButtonKind.tertiary}
            onClick={() => setBackClicked(true)}
          >
            Back
          </ModalButton>
          <ModalButton onClick={handleReady}>Try again</ModalButton>
        </ModalFooter>
      </>
    )

    if (modalLoading) {
      return loadingContent;
    } else if (hasError) {
      return errorContent;
    }

    return preparationContent;
  };

  const onButtonClick = () => {
    console.log(youtubeEl.current.getCurrentTime())
    setVideoPlaying(true);
  }

  const handleVideoDone = () => {
    setShowWinner(true);
  };

  if (backClicked) {
    return <Redirect to="/" />
  }

  if (showWinner) {
    return <Redirect push to={{ pathname: "/results", state: { accuracies } }} />;
  }

  return (
    <div className="Session">
      <Navigation />
      {!isOpen && 
        <div className="Session__header">
          <div className="Session__scoreWrapper">
            <p className="Session__accuracy">ACCURACY</p>
            <div className="Session__score">
              {userScore}
            </div>
          </div>
        </div>
      }
      {youtubeUrl && <div className="Session__view">
      <ReactPlayer
        url={youtubeUrl}
        ref={youtubeEl}
        playing={videoPlaying}
        onEnded={handleVideoDone}
        className="Session__youtube"
      />
      <PoseNet className="Session__posenetMain" onEstimate={handleEstimate} />
      </div>
      }
      {!videoPlaying && !isOpen ? (
        <Button className="Session__button" size={ButtonSize.large} onClick={onButtonClick}>Start</Button>
      ) : (
        <div className="Session__poseHint">{poseHint}</div>
      )}
      <Modal
        onClose={() => setIsOpen(false)}
        closeable={false}
        isOpen={isOpen}
        animate
        autoFocus
        size={SIZE.default}
        role={ROLE.dialog}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
}

export default Session;