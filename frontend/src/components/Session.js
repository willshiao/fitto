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
import { Button, KIND as ButtonKind } from "baseui/button";
import { Spinner } from "baseui/spinner";
import PoseNet from "react-posenet"
import { Redirect } from "react-router-dom";
import "./Session.scss";
import sendVideo from '../services/video';
import ReactPlayer from 'react-player';
import socketIOClient from "socket.io-client";

const BASE_URL = "http://b9c7f8f67b95.ngrok.io";
const socket = socketIOClient(BASE_URL);

function Session(props) {
  const [isOpen, setIsOpen] = useState(true);
  const [backClicked, setBackClicked] = useState(false);
  const [countingDown, setCountingDown] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isSessionOver, setIsSessionOver] = useState(false);
  const [lastOneSent, setLastOneSent] = useState(false);
  const [counter, setCounter] = useState(3);
  const [userScore, setUserScore] = useState(0);
  const [data, setData] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState(null);
  const [prevTime, setPrevTime] = useState(0);
  const [poseBatch, setPoseBatch] = useState([]);
  const youtubeEl = useRef(null);

  // useEffect(() => {
  //   const { location: { state: { value } } } = props;
  //   console.log("got value", value);

  //   const data = { text: "hi" };

  //   if (!data) {
  //     sendVideo(value)
  //       .then(response => {
  //         console.log("Got response")
  //       })
  //       .catch(error => {
  //         console.log("Error", error);
  //       });
  //   }

  //   if (countingDown) {
  //     if (counter > 0) {
  //       setTimeout(() => setCounter(counter - 1), 1000);
  //   } else {
  //       setIsOpen(false);
  //     }
  //   }
  // }, [countingDown, counter, props]);

  const handleEstimate = poses => {
    const currentTime = youtubeEl.current.getCurrentTime();
    const totalDuration = youtubeEl.current.getDuration();
    const difference = currentTime - prevTime;

    if (currentTime !== totalDuration) {
      if (difference < 5) {
        setPoseBatch(prevPoseBatch => [...prevPoseBatch, poses]);
      } else {
        console.log("Sending batch", poseBatch);

        socket.emit("poses:req", {
          startTime: prevTime,
          endTime: currentTime,
          poseBatch
        });
  
        setPrevTime(currentTime);
        setPoseBatch([]);
      }
    } else {
      if (!lastOneSent) {
        socket.emit("poses:req", {
          startTime: prevTime,
          endTime: currentTime,
          poseBatch
        });
  
        setPrevTime(currentTime);
        setPoseBatch([]);
      }

      setLastOneSent(true);
    }
  };

  const handleStart = () => {
    const { location: { state: { videoUrl } } } = props;
    setModalLoading(true);

    sendVideo(videoUrl)
      .then(response => {
        console.log("Got response", response);
        const { videoUrl } = response;

        setIsOpen(false);
        setYoutubeUrl(videoUrl);
      })
      .catch(error => {
        console.error("Error", error);
        setIsOpen(false);
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
          {countingDown ? (
            <div className="Session__count">{counter}</div>
          ) : (
            <>
              Make sure you’ve allowed browser permissions!
            {/* <PoseNet className="Session__posenetModal" /> */}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <ModalButton
            kind={ButtonKind.tertiary}
            onClick={() => setBackClicked(true)}
          >
            Back
          </ModalButton>
          <ModalButton onClick={handleStart}>Start</ModalButton>
        </ModalFooter>
      </>
    );

    return modalLoading ? loadingContent : preparationContent;
  };

  if (backClicked) {
    return <Redirect push to={{ pathname: "/" }} />;
  }

  return (
    <>
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
      {youtubeUrl && <div className="Session__view">
        <ReactPlayer
          url="https://www.youtube.com/watch?v=rUWxSEwctFU"
          ref={youtubeEl}
          playing={videoPlaying}
          onEnded={() => setIsSessionOver(true)}
          className="Session__youtube"
        />
        <PoseNet className="Session__posenetMain" onEstimate={handleEstimate} />
        <div className="Session__scoreWrapper">
          <div className="Session__score">{userScore}</div>
        </div>
      </div>}
    </>
  );
}

export default Session;