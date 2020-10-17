import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
  SIZE,
  ROLE
} from "baseui/modal";
import { KIND as ButtonKind } from "baseui/button";
import { Spinner } from "baseui/spinner";
import PoseNet from "react-posenet"
import { Redirect } from "react-router-dom";
import "./Session.scss";
import sendVideo from '../services/video';

function Session(props) {
  const [isOpen, setIsOpen] = useState(true);
  const [backClicked, setBackClicked] = useState(false);
  const [countingDown, setCountingDown] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [counter, setCounter] = useState(3);
  const [data, setData] = useState(null);

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
    console.log("poses", poses);
  };

  const handleStart = () => {
    const { location: { state: { videoUrl } } } = props;
    setModalLoading(true);
    sendVideo(videoUrl)
      .then(response => {
        console.log("Got response", response);
      })
      .catch(error => {
        console.error("Error", error);
        setIsOpen(false);
      })
    // send info
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
            {/* <PoseNet className="Session__posenet" onEstimate={handleEstimate} /> */}
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
        closeable
        isOpen={isOpen}
        animate
        autoFocus
        size={SIZE.default}
        role={ROLE.dialog}
      >
        {renderModalContent()}
      </Modal>
    </>
  );
}

export default Session;