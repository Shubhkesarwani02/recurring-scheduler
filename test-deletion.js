// Simple test script to verify slot deletion endpoint
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testSlotDeletion() {
  try {
    console.log('Testing slot deletion endpoint...');
    
    // Test data
    const testSlotId = 'test-slot-id';
    const testDate = '2024-12-30';
    
    const response = await fetch(`${BASE_URL}/api/slots/${testSlotId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: testDate
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (response.status === 404) {
      console.log('✅ Expected 404 - slot not found (test slot doesn\'t exist)');
    } else if (response.status === 204) {
      console.log('✅ Success - slot deleted');
    } else {
      const text = await response.text();
      console.log('Response body:', text);
    }
    
  } catch (error) {
    console.error('❌ Error testing deletion:', error.message);
  }
}

// Run the test
testSlotDeletion();