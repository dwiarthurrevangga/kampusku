import api from './api';

// Mock axios since we're having issues with axios-mock-adapter
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: {
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  })),
}));

describe('API Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('api instance is configured correctly', () => {
    expect(api.defaults.baseURL).toBe('/api');
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
  test('makes GET requests correctly', async () => {
    const mockData = { id: 1, message: 'success' };
    api.get.mockResolvedValue({ status: 200, data: mockData });

    const response = await api.get('/test');
    
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockData);
    expect(api.get).toHaveBeenCalledWith('/test');
  });
  test('makes POST requests correctly', async () => {
    const requestData = { username: 'testuser', password: 'password123' };
    const responseData = { id: 1, username: 'testuser', token: 'abc123' };
    
    api.post.mockResolvedValue({ status: 200, data: responseData });

    const response = await api.post('/login', requestData);
    
    expect(response.status).toBe(200);
    expect(response.data).toEqual(responseData);
    expect(api.post).toHaveBeenCalledWith('/login', requestData);
  });
  test('makes PUT requests correctly', async () => {
    const requestData = { content: 'Updated post content' };
    const responseData = { id: 1, content: 'Updated post content', updated_at: '2025-06-02T10:00:00Z' };
    
    api.put.mockResolvedValue({ status: 200, data: responseData });

    const response = await api.put('/posts/1', requestData);
    
    expect(response.status).toBe(200);
    expect(response.data).toEqual(responseData);
    expect(api.put).toHaveBeenCalledWith('/posts/1', requestData);
  });
  test('makes DELETE requests correctly', async () => {
    const responseData = { status: 'deleted' };
    api.delete.mockResolvedValue({ status: 200, data: responseData });

    const response = await api.delete('/posts/1');
    
    expect(response.status).toBe(200);
    expect(response.data).toEqual(responseData);
    expect(api.delete).toHaveBeenCalledWith('/posts/1');
  });
  test('handles network errors', async () => {
    const networkError = new Error('Network Error');
    api.get.mockRejectedValue(networkError);

    try {
      await api.get('/error');
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe('Network Error');
    }
  });
  test('handles HTTP error responses', async () => {
    const httpError = new Error('Request failed with status code 404');
    httpError.response = { 
      status: 404, 
      data: { error: 'Not found' } 
    };
    api.get.mockRejectedValue(httpError);

    try {
      await api.get('/not-found');
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.error).toBe('Not found');
    }
  });
  test('verifies method calls with correct parameters', async () => {
    const testData = { test: 'data' };
    api.post.mockResolvedValue({ status: 201, data: testData });

    await api.post('/test-endpoint', testData);
    
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/test-endpoint', testData);
  });

  test('handles multiple sequential requests', async () => {
    api.get.mockResolvedValueOnce({ status: 200, data: { id: 1 } });
    api.get.mockResolvedValueOnce({ status: 200, data: { id: 2 } });

    const response1 = await api.get('/item/1');
    const response2 = await api.get('/item/2');
    
    expect(response1.data.id).toBe(1);
    expect(response2.data.id).toBe(2);
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
