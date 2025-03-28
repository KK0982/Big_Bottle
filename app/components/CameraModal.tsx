"use client";

import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react";
import Camera from "./Camera";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const handleCapture = (imageData: string) => {
    onCapture(imageData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Take Photo</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          <Camera onCapture={handleCapture} onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CameraModal;
