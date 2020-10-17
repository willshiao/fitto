import React, { useState } from 'react';
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
import { Redirect } from "react-router-dom";
import "./Session.scss";

function Session(props) {
  const [isOpen, setIsOpen] = useState(true);
  const [backClicked, setBackClicked ] = useState(false);

  const renderModalContent = () => {
    return (
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
        <ModalFooter>
          <ModalButton kind={ButtonKind.tertiary} onClick={() => setBackClicked(true)}>
            Back
          </ModalButton>
          <ModalButton>Okay</ModalButton>
        </ModalFooter>
      </>
    );
  };

  if (backClicked) {
    return <Redirect push to={{ pathname: "/" }} />;
  }

  return (
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
  );
}

export default Session;