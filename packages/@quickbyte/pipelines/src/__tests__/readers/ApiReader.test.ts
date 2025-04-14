import { ApiReader } from '../../readers/ApiReader';
import axios from 'axios';

jest.mock('axios');

// Suppress console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ApiReader', () => {
  let apiReader: ApiReader;
  const mockResponse = { data: { users: [{ id: 1, name: 'John' }] } };

  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);
    (axios.post as jest.Mock).mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      apiReader = new ApiReader({});
      expect(apiReader).toBeDefined();
    });

    it('should initialize with custom values', () => {
      const config = {
        location: 'https://api.example.com',
        options: {
          method: 'POST',
          headers: { 'Authorization': 'Bearer token' },
          responsePath: 'data.users'
        }
      };
      apiReader = new ApiReader(config);
      expect(apiReader).toBeDefined();
    });
  });

  describe('read', () => {
    it('should throw error when URL is not provided', async () => {
      apiReader = new ApiReader({});
      await expect(apiReader.read()).rejects.toThrow('API URL is required');
    });

    it('should make GET request successfully', async () => {
      apiReader = new ApiReader({
        location: 'https://api.example.com',
        options: { method: 'GET' }
      });

      const result = await apiReader.read();
      expect(axios.get).toHaveBeenCalledWith('https://api.example.com', { headers: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should make POST request successfully', async () => {
      apiReader = new ApiReader({
        location: 'https://api.example.com',
        options: { method: 'POST' }
      });

      const result = await apiReader.read();
      expect(axios.post).toHaveBeenCalledWith('https://api.example.com', {}, { headers: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error for unsupported HTTP method', async () => {
      apiReader = new ApiReader({
        location: 'https://api.example.com',
        options: { method: 'PUT' }
      });

      await expect(apiReader.read()).rejects.toThrow('Unsupported HTTP method: PUT');
    });

    it('should extract data using responsePath', async () => {
      apiReader = new ApiReader({
        location: 'https://api.example.com',
        options: { responsePath: 'users' }
      });

      const result = await apiReader.read();
      expect(result).toEqual([{ id: 1, name: 'John' }]);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      apiReader = new ApiReader({
        location: 'https://api.example.com'
      });

      await expect(apiReader.read()).rejects.toThrow('API Error');
    });
  });
}); 