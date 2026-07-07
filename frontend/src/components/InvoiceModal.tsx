import type { Prescription } from "../types/prescription"

interface InvoiceModalProps {
  prescription: Prescription
  onClose: () => void
}

const safe = (val: number | undefined | null) => (val || 0).toFixed(2)

const InvoiceModal = ({ prescription, onClose }: InvoiceModalProps) => {
  const saleDateTime = new Date(prescription.date)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-medium text-green-800">Invoice</h2>
            <p className="text-xs text-[#8A8678]">#{prescription.id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="border-b border-gray-100 pb-4 mb-4">
          <p className="text-xs text-[#8A8678]">Patient</p>
          <p className="font-medium text-sm">{prescription.customer?.name || 'Walk-in Customer'}</p>
          <p className="text-xs text-[#8A8678]">{prescription.customer?.phoneNumber}</p>
          {prescription.doctorName && (
            <>
              <p className="text-xs text-[#8A8678] mt-2">Doctor</p>
              <p className="text-sm font-medium">Dr. {prescription.doctorName}</p>
            </>
          )}
          <p className="text-xs text-[#8A8678] mt-2">Date & Time</p>
          <p className="text-sm font-medium">
            {saleDateTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            {' · '}
            {saleDateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-xs font-medium text-[#8A8678] mb-2 uppercase tracking-wide">Items</p>
          {prescription.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-[#F1EFE8]">
              <div>
                <p className="text-gray-900">{item.medicine?.name}</p>
                <p className="text-xs text-[#8A8678]">{item.quantity} units × ₹{safe(item.price)}</p>
              </div>
              <p className="text-gray-900 font-medium">₹{safe(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-[#8A8678]">Subtotal</span>
            <span>₹{safe(prescription.subTotal)}</span>
          </div>
          {(prescription.discount || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8A8678]">Discount ({prescription.discount}%)</span>
              <span className="text-green-700">-₹{safe((prescription.subTotal || 0) * (prescription.discount || 0) / 100)}</span>
            </div>
          )}
          {(prescription.gstAmount || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8A8678]">GST</span>
              <span>₹{safe(prescription.gstAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-medium mt-1 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>₹{safe(prescription.total)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-[#8A8678]">Abhay Medical · MediTrack</p>
          <p className="text-xs text-[#8A8678]">Thank you for your purchase</p>
        </div>
      </div>
    </div>
  )
}

export default InvoiceModal