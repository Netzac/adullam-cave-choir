declare module '@paystack/inline-js' {
  export default class PaystackPop {
    newTransaction(options: {
      key: string;
      email: string;
      amount: number;
      currency?: string;
      ref?: string;
      onSuccess?: (transaction: { reference: string }) => void;
      onCancel?: () => void;
      onError?: (error: { message?: string }) => void;
    }): void;
  }
}
