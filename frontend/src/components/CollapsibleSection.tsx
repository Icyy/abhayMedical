import { useState, type ReactNode } from "react";
import { ChevronDown, Plus } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ title, children, defaultOpen = false }: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-[#E8E4D9] rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-[#0F4C3A]">
          <Plus size={15} className={isOpen ? "rotate-45 transition-transform" : "transition-transform"} />
          {title}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="px-4 pb-4 border-t border-[#F1EFE8] pt-4">{children}</div>}
    </div>
  );
};

export default CollapsibleSection;