import { http } from "./types";
import { setupWorker } from "./Worker";


const handlers = [
  http.get('https://test.com/api/users', () => ({
    status: 200,
    body: [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ],
  })),

  http.get('/api/users/:id', () => ({
    status: 200,
    body: { id: 1, name: 'John Doe' },
  })),

  http.post('/api/users', async (req) => ({
    status: 201,
    body: { id: 3, ...req.body },
  })),
];

const worker = setupWorker(...handlers);


// 使用
// worker.start()
export default worker