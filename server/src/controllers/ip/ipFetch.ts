import axios, { AxiosResponse } from "axios";
import { isValidIP } from "./ipValidation";
import { ipServiceProviders, fallbackProviders } from "./ipProviders";

export const getPublicIP = async (): Promise<string> => {
  for (const provider of fallbackProviders) {
    try {
      const response = await axios.get(provider.url, {
        timeout: provider.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; IP-Lookup-Service/1.0)',
          'Accept': 'application/json'
        }
      });

      const ip = provider.parser(response.data);
      if (isValidIP(ip)) {
        console.log(`Got public IP from ${provider.name}: ${ip}`);
        return ip;
      }
    } catch (error: any) {
      console.warn(`Failed to get IP from ${provider.name}:`, error.message);
    }
  }

  throw new Error('Failed to get public IP from any provider');
};

export const fetchIPInfo = async (ip: string): Promise<any> => {
  const errors: string[] = [];

  for (const provider of ipServiceProviders) {
    try {
      const response: AxiosResponse = await axios.get(provider.url(ip), {
        timeout: provider.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; IP-Lookup-Service/1.0)',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200 && response.data) {
        return provider.parser(response.data);
      }
    } catch (error: any) {
      errors.push(`${provider.name}: ${error.message}`);
      console.warn(`Failed to fetch from ${provider.name}:`, error.message);
    }
  }

  throw new Error(`All IP service providers failed. Errors: ${errors.join(', ')}`);
};
