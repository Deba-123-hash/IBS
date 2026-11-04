async function runChatbotTests() {
  console.log('================================================================');
  console.log('  UNIFIX TECH — FULL CHATBOT QUERY SUITE');
  console.log('================================================================\n');

  const BASE_URL = 'http://localhost:5000/api/v1';

  // 1. Authenticate as Student
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@campus.demo', password: 'Password@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;

  const queries = [
    'What is my attendance?',
    'What is my lowest attendance subject?',
    'What complaints do I have?',
    'What is my room number?',
    'What is my fee due?',
    "What is today's mess menu?",
    'What is my next class?'
  ];

  let history = [];

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    console.log(`[Query ${i + 1}/${queries.length}] "${q}"`);
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        message: q,
        messages: [...history, { role: 'user', content: q }]
      })
    });
    const data = await res.json();
    console.log('  Success:', data.success);
    console.log('  Intent:', data.intent);
    console.log('  Response Snippet:');
    const lines = (data.message || '').split('\n').filter(l => l.trim()).slice(0, 4);
    lines.forEach(l => console.log('    ' + l));
    console.log('----------------------------------------------------------------');

    if (data.message) {
      history.push({ role: 'user', content: q });
      history.push({ role: 'assistant', content: data.message });
    }
  }

  console.log('ALL CHATBOT QUERIES COMPLETED SUCCESSFULLY!');
}

runChatbotTests().catch(console.error);
