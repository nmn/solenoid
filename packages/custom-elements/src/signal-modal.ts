import { Signal } from "./signal-store";
import { signalStore } from "./signal-store-instance";
import { generateTemplateId } from "./utils/template-utils";
import { getTemplateContent } from "./utils/template-helpers";

export class SignalModal extends HTMLElement {
  static observedAttributes = ["name", "watch"];
  
  private signal: Signal<any> | null = null;
  private cleanUp: (() => void) | null = null;
  private signalRegistry: typeof signalStore;
  private handleKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private handleClickOutside: ((e: MouseEvent) => void) | null = null;
  private modalId: string;
  private modalBackdropId: string;
  constructor() {
    super();
    this.signalRegistry = window.signalRegistry || signalStore;
    this.modalId = `modal-${Math.random().toString(36).substr(2, 9)}`;
    this.modalBackdropId = `modal-backdrop-${Math.random().toString(36).substr(2, 9)}`;
  }

  connectedCallback() {
    const name = this.getAttribute("name");
    const watchProp = this.getAttribute("watch") || "isOpen";
    const templateId = this.getAttribute("template-id") || generateTemplateId(this);

    if (!name) {
      throw new Error("signal-modal must have a name attribute");
    }

    const content = getTemplateContent(this, templateId, "signal-modal");
    if (!content) {
      return;
    }

    // Create modal wrapper with template content
    this.innerHTML = `
      <div id="${this.modalId}" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity hidden" style="pointer-events: auto;">
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div id="${this.modalBackdropId}" class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0" style="pointer-events: auto;">
            <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              ${content}
            </div>
          </div>
        </div>
      </div>
    `;

    // Get modal element using ID
    const modalElement = document.getElementById(this.modalId) as HTMLElement;
    const modalBackdropElement = document.getElementById(this.modalBackdropId) as HTMLElement;

    // Subscribe to signal changes
    this.signal = this.signalRegistry.get(name) ?? null;
    if (!this.signal) {
      console.warn(`No signal found with name: ${name}`);
      return;
    }

    this.cleanUp = this.signal.subscribe((state) => {
      if (modalElement) {
        const isOpen = state[watchProp];
        if (isOpen) {
          this.removeAttribute('hidden');
          this.style.display = 'block';
        } else {
          this.setAttribute('hidden', '');
          this.style.display = 'none';
        }
        modalElement.classList.toggle('hidden', !isOpen);
      }
    });

    // Create bound event handlers that we can remove later
    this.handleClickOutside = (e: MouseEvent) => {
      // Check if click target is either the backdrop or the modal overlay
      if (e.target === modalElement || e.target === modalBackdropElement) {
        this.signal?.set({ 
          ...this.signal.get(), 
          [watchProp]: false 
        });
      }
    };

    this.handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.signal?.get()[watchProp]) {
        this.signal.set({ 
          ...this.signal.get(), 
          [watchProp]: false 
        });
      }
    };

    // Add event listeners
    modalElement?.addEventListener('click', this.handleClickOutside);
    modalBackdropElement?.addEventListener('click', this.handleClickOutside);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    // Clean up signal subscription
    this.cleanUp?.();
    this.signal = null;

    // Clean up event listeners
    if (this.handleKeyDown) {
      window.removeEventListener('keydown', this.handleKeyDown);
      this.handleKeyDown = null;
    }

    const modalElement = document.getElementById(this.modalId);
    if (modalElement && this.handleClickOutside) {
      modalElement.removeEventListener('click', this.handleClickOutside as EventListener);
      this.handleClickOutside = null;
    }

    const modalBackdropElement = document.getElementById(this.modalBackdropId);
    if (modalBackdropElement && this.handleClickOutside) {
      modalBackdropElement.removeEventListener('click', this.handleClickOutside as EventListener);
      this.handleClickOutside = null;
    }
  }
}
