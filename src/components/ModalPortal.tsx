import React from 'react';
import { createPortal } from 'react-dom';

type ModalPortalProps = {
  children: React.ReactNode;
};

const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
};

export default ModalPortal;


