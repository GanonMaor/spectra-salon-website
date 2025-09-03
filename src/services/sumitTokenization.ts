// SUMIT Tokenization Service
// Handles client-side tokenization using SUMIT's payments.js

interface TokenizationResult {
  success: boolean;
  token?: string;
  error?: string;
}

interface SumitConfig {
  CompanyID: string;
  APIPublicKey: string;
}

declare global {
  interface Window {
    OfficeGuy?: {
      Payments?: {
        BindFormSubmit: (config: any) => void;
      };
    };
    jQuery?: any;
  }
}

export class SumitTokenizationService {
  private static instance: SumitTokenizationService;
  private isInitialized = false;
  
  private constructor() {}
  
  static getInstance(): SumitTokenizationService {
    if (!SumitTokenizationService.instance) {
      SumitTokenizationService.instance = new SumitTokenizationService();
    }
    return SumitTokenizationService.instance;
  }
  
  /**
   * Initialize SUMIT tokenization on a form
   */
  async initializeTokenization(
    formSelector: string,
    config: SumitConfig
  ): Promise<void> {
    // Wait for jQuery and SUMIT scripts to load
    await this.waitForDependencies();
    
    if (!window.OfficeGuy?.Payments?.BindFormSubmit) {
      throw new Error('SUMIT Payments library not loaded');
    }
    
    // Create a promise that will resolve when tokenization is complete
    return new Promise((resolve, reject) => {
      window.OfficeGuy.Payments.BindFormSubmit({
        CompanyID: config.CompanyID,
        APIPublicKey: config.APIPublicKey,
        Selector: formSelector,
        onSuccess: (response: any) => {
          console.log('SUMIT tokenization success:', response);
          
          // Store token in hidden field
          const tokenField = document.querySelector('input[name="og-token"]') as HTMLInputElement;
          if (tokenField && response.Token) {
            tokenField.value = response.Token;
          }
          
          this.isInitialized = true;
          resolve();
        },
        onError: (error: any) => {
          console.error('SUMIT tokenization error:', error);
          
          // Display error in the designated container
          const errorContainer = document.querySelector('.og-errors');
          if (errorContainer) {
            errorContainer.textContent = error.Message || 'Payment validation failed';
          }
          
          reject(new Error(error.Message || 'Tokenization failed'));
        }
      });
    });
  }
  
  /**
   * Get the tokenized value
   */
  getToken(): string | null {
    const tokenField = document.querySelector('input[name="og-token"]') as HTMLInputElement;
    return tokenField?.value || null;
  }
  
  /**
   * Clear any stored tokens
   */
  clearToken(): void {
    const tokenField = document.querySelector('input[name="og-token"]') as HTMLInputElement;
    if (tokenField) {
      tokenField.value = '';
    }
  }
  
  /**
   * Programmatically trigger form tokenization
   */
  async tokenizeForm(formSelector: string): Promise<TokenizationResult> {
    try {
      // Trigger form submission which will be intercepted by SUMIT
      const form = document.querySelector(formSelector) as HTMLFormElement;
      if (!form) {
        throw new Error('Form not found');
      }
      
      // Create and dispatch a submit event
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
      
      // Wait a bit for tokenization to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const token = this.getToken();
      if (token) {
        return { success: true, token };
      } else {
        return { success: false, error: 'No token generated' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Wait for required dependencies to load
   */
  private async waitForDependencies(maxAttempts = 50): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      if (window.jQuery && window.OfficeGuy?.Payments) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('SUMIT dependencies failed to load');
  }
}

export const sumitTokenization = SumitTokenizationService.getInstance();
