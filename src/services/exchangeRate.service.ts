// src/services/exchangeRate.service.ts 
import axios from 'axios';
import { AppError } from '../utils/AppError';

export interface ExchangeRateResponse {
 success: boolean;
 terms?: string;
 privacy?: string;
 query: {
  from: string;
  to: string;
  amount: number;
 };
 info: {
  timestamp?: number;
  rate?: number;
  quote?: number;
 };
 result: number;
 error?: {
  code: number;
  type: string;
  info: string;
 };
}

export class ExchangeRateService {
 private static getBaseUrl(): string {
  return process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate.host';
 }

 // Get API key dynamically to ensure env vars are loaded
 private static getApiKey(): string | undefined {
  return process.env.EXCHANGE_RATE_API_KEY;
 }

 // Mock rates for development fallback
 private static readonly MOCK_RATES: Record<string, number> = {
  'USD_NGN': 1580,
  'USD_EUR': 0.85,
  'USD_GBP': 0.73,
  'EUR_USD': 1.18,
  'EUR_NGN': 1863,
  'GBP_USD': 1.37,
  'GBP_NGN': 2165,
  'NGN_USD': 0.00063,
  'NGN_EUR': 0.00054,
  'NGN_GBP': 0.00046
 };

 static async getRate(fromCurrency: string, toCurrency: string, amount: number = 1): Promise<number> {
  try {
   console.log(`Fetching exchange rate: ${fromCurrency} -> ${toCurrency}`);

   // Build the API URL with proper parameters
   const params = new URLSearchParams({
    from: fromCurrency,
    to: toCurrency,
    amount: amount.toString()
   });

   // Add API key if available
   const apiKey = this.getApiKey();
   if (apiKey) {
    params.append('access_key', apiKey);
    console.log('✅ Using API key for exchange rate request');
   } else {
    console.log('⚠️  No API key found, request may fail');
   }

   const apiUrl = `${this.getBaseUrl()}/convert?${params.toString()}`;
   console.log('API URL:', apiUrl);

   const response = await axios.get<ExchangeRateResponse>(apiUrl, {
    timeout: 10000,
    headers: {
     'Accept': 'application/json',
     'User-Agent': 'FX-Converter-API/1.0'
    }
   });

   console.log('API Response:', response.data);

   if (!response.data.success) {
    console.log('API returned success: false');
    throw new AppError('Failed to fetch exchange rate', 500);
   }

   // Handle different response structures from exchangerate.host
   let rate: number;
   if (response.data.info?.rate) {
    rate = response.data.info.rate;
   } else if (response.data.info?.quote) {
    rate = response.data.info.quote;
   } else if (response.data.result) {
    rate = response.data.result;
   } else {
    console.log('Unexpected API response structure:', response.data);
    throw new AppError('Invalid exchange rate response format', 500);
   }

   console.log(`✅ Real exchange rate ${fromCurrency}/${toCurrency}: ${rate}`);

   return rate;

  } catch (error: any) {
   console.error('Exchange rate API error:', error.message);

   // Check if it's a rate limit error
   if (error.response?.data?.error?.code === 106) {
    console.log('⚠️  Rate limit reached, falling back to mock data');
   } else {
    console.error('Error details:', error);
   }

   // Fall back to mock rates in development
   if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Using fallback mock rate for development');
    return this.getMockRate(fromCurrency, toCurrency);
   }

   // In production, we want to know about API failures
   throw new AppError('Exchange rate service temporarily unavailable', 503);
  }
 }

 private static getMockRate(fromCurrency: string, toCurrency: string): number {
  const key = `${fromCurrency}_${toCurrency}`;
  const reverseKey = `${toCurrency}_${fromCurrency}`;

  if (this.MOCK_RATES[key]) {
   const rate = this.MOCK_RATES[key];
   console.log(`Using mock rate ${fromCurrency}/${toCurrency}: ${rate}`);
   return rate;
  }

  if (this.MOCK_RATES[reverseKey]) {
   const rate = 1 / this.MOCK_RATES[reverseKey];
   console.log(`Using reverse mock rate ${fromCurrency}/${toCurrency}: ${rate}`);
   return rate;
  }

  // Default fallback rate
  const defaultRate = 1.0;
  console.log(`Using default mock rate ${fromCurrency}/${toCurrency}: ${defaultRate}`);
  return defaultRate;
 }

 static async getSupportedCurrencies(): Promise<string[]> {
  try {
   // If we have an API key, we could fetch supported currencies from the API
   const apiKey = this.getApiKey();
   if (apiKey) {
    const apiUrl = `${this.getBaseUrl()}/symbols?access_key=${apiKey}`;
    const response = await axios.get(apiUrl);

    if (response.data.success && response.data.symbols) {
     return Object.keys(response.data.symbols);
    }
   }

   // Fallback to common currencies
   return [
    'USD', 'EUR', 'GBP', 'NGN', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR',
    'KRW', 'MXN', 'RUB', 'ZAR', 'BRL', 'SGD', 'HKD', 'NOK', 'SEK', 'PLN'
   ];
  } catch (error) {
   console.error('Error fetching supported currencies:', error);

   // Return basic currencies if API fails
   return ['USD', 'EUR', 'GBP', 'NGN', 'JPY', 'CAD', 'AUD'];
  }
 }

 // Utility method to check if API key is configured
 static isApiKeyConfigured(): boolean {
  return !!this.getApiKey();
 }

 // Method to get API status for health checks
 static async getApiStatus(): Promise<{ available: boolean; usingMockData: boolean }> {
  const apiKey = this.getApiKey();
  if (!apiKey) {
   return { available: false, usingMockData: true };
  }

  try {
   const apiUrl = `${this.getBaseUrl()}/symbols?access_key=${apiKey}`;
   const response = await axios.get(apiUrl, { timeout: 5000 });

   return {
    available: response.data.success,
    usingMockData: !response.data.success
   };
  } catch (error) {
   return { available: false, usingMockData: true };
  }
 }
}