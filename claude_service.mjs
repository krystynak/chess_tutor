export async function getTranscript(videoId, isDevelopmentMode) {
    console.log('getTranscript called with videoId:', videoId);
    if (isDevelopmentMode) {
      return await getLocalTranscript(videoId);
    } else {
      return await getYoutubeTranscript(videoId);
    }
  }

  async function getLocalTranscript(videoId) {
    console.log('Fetching local transcript');
    try {
      const response = await fetch(`http://localhost:5500/api/local-transcript?videoId=${videoId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching local transcript:', error);
      throw error;
    }
  }
  
  async function getYoutubeTranscript(videoId) {
    console.log('Fetching YouTube transcript')

    const response = await fetch(`http://localhost:5500/api/youtube/transcript?videoId=${videoId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }


export async function processTranscript(transcript) {
    console.log('Processing transcript');
    try {
      const response = await fetch('http://localhost:3000/api/process-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error processing transcript:', error);
      throw error;
    }
  }
