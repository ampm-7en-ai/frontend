
import { create } from 'zustand';  

type PricingModalStore = {
  isOpen: boolean;
  openPricingModal: () => void;
  closePricingModal: () => void;
};

export const usePricingModal = create<PricingModalStore>((set) => ({
  isOpen: false,
  openPricingModal: () => set({ isOpen: true }),
  closePricingModal: () => set({ isOpen: false }),
}));
