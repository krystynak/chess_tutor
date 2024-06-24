import fetch from 'node-fetch';

async function getYoutubeTranscript(videoId) {
  try {
    const response = await fetch(`http://localhost:5500/api/youtube/transcript?videoId=${videoId}`);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}\nError details: ${errorBody}`);
    }
    const transcript = await response.json();
    return transcript;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage
getYoutubeTranscript('1tqJZOzZX58').then(transcript => {
  console.log(transcript);
}).catch(error => {
  console.error('Error in main:', error);
});