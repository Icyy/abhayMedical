import type { Prescription } from "../types/prescription";

interface InvoiceModalProps {
  prescription: Prescription;
  onClose: () => void;
}

const InvoiceModal = ({ prescription, onClose }: InvoiceModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-green-800">Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-gray-100 pb-4 mb-4">
          <p className="text-sm text-gray-500">Patient</p>
          <p className="font-medium">{prescription.customer.name}</p>
          <p className="text-sm text-gray-500 mt-2">Doctor</p>
          <p className="font-medium">{prescription.doctorName || "—"}</p>
          <p className="text-sm text-gray-500 mt-2">Date</p>
          <p className="font-medium">
            {new Date(prescription.date).toLocaleDateString()}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Medicines</p>
          {prescription.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span>
                {item.medicine.name} × {item.quantity}
              </span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4 flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>₹{prescription.subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Discount</span>
            <span>{prescription.discount}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">GST</span>
            <span>₹{prescription.gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-medium mt-2">
            <span>Total</span>
            <span>₹{prescription.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
