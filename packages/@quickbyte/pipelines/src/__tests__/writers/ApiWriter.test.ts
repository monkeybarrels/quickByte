import { ApiWriter } from '../../writers/api-writer';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('ApiWriter', () => {
  let writer: ApiWriter;
  let mock: MockAdapter;
  const testData = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];
  const testUrl = 'http://test.com/api';

  beforeEach(() => {
    mock = new MockAdapter(axios);
    writer = new ApiWriter({
      location: testUrl,
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    });
  });

  afterEach(() => {
    mock.restore();
  });

  describe('write', () => {
    it('should send data to API endpoint', async () => {
      mock.onPost(testUrl).reply(200, { success: true });

      await writer.write(testData);

      expect(mock.history.post.length).toBe(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(testData);
      expect(mock.history.post[0].headers?.['Content-Type']).toBe('application/json');
    });

    it('should handle API errors', async () => {
      mock.onPost(testUrl).reply(500, { error: 'Internal Server Error' });

      await expect(writer.write(testData)).rejects.toThrow();
    });

    it('should handle empty data', async () => {
      mock.onPost(testUrl).reply(200, { success: true });

      await writer.write([]);

      expect(mock.history.post.length).toBe(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual([]);
    });
  });
}); 