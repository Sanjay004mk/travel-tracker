// server.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./app.js', () => ({
  default: {
    listen: vi.fn((port, host, callback) => callback()), // Simulate server start
  },
}));

vi.mock('./database/connection.js', () => ({
  default: vi.fn(() => {}), // Mock DB connection
}));

// Set mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.PORT = '5051';

describe('Server Startup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start the server and call app.listen without errors', async () => {
    await import('./server.js'); // This runs the actual server script

    const app = (await import('./app.js')).default;
    expect(app.listen).toHaveBeenCalledWith(
      5051,
      '0.0.0.0',
      expect.any(Function)
    );
  });
});
