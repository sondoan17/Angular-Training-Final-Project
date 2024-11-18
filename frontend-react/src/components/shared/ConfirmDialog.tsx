import { Modal, Button } from 'antd';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDialog = ({ open, title, message, onClose, onConfirm }: ConfirmDialogProps) => {
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          onClick={onConfirm}
        >
          Delete
        </Button>,
      ]}
      className="dark:bg-gray-800"
    >
      <p className="text-gray-600 dark:text-gray-300">{message}</p>
    </Modal>
  );
};

export default ConfirmDialog; 