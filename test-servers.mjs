import axios from 'axios';

async function testServers() {
  try {
    // Test proxy server and app server
    const response = await axios.get('http://localhost:5500/api/health');
    console.log('Proxy and App server test:', response.data);

    // Test live server
    const liveResponse = await axios.get('http://localhost:5500');
    console.log('Live server test:', liveResponse.status === 200 ? 'OK' : 'Failed');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testServers();