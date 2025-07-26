
import { useState } from 'react';

interface ModalData {
  [key: string]: any;
}

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<string>('');
  const [data, setData] = useState<ModalData>({});

  const onOpen = (modalType: string, modalData: ModalData = {}) => {
    setType(modalType);
    setData(modalData);
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    setType('');
    setData({});
  };

  return {
    isOpen,
    type,
    data,
    onOpen,
    onClose,
  };
};
