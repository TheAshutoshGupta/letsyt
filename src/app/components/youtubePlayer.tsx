"use client";
import { useEffect } from 'react';
import React from 'react';
import io from 'socket.io-client';

const socket = io('/api/socket', {
  path: '/api/socket',
});

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

let player: any;

function onYouTubeIframeAPIReady() {
  player = new window.YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'M7lc1UVf-VE',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
    },
  });
}

function onPlayerReady(event: any) {
  event.target.playVideo();
}

function onPlayerStateChange(event: any) {
  const data = {
    event: 'stateChange',
    state: event.data,
    time: player.getCurrentTime(),
  };
  socket.emit('video-control', data);
}

const YouTubePlayer: React.FC = () => {
  useEffect(() => {
    if (window.YT) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    const handleVideoControl = (data: any) => {
      if (data.event === 'stateChange') {
        if (data.state === window.YT.PlayerState.PLAYING) {
          player.seekTo(data.time, true);
          player.playVideo();
        } else if (data.state === window.YT.PlayerState.PAUSED) {
          player.seekTo(data.time, true);
          player.pauseVideo();
        } else if (data.state === window.YT.PlayerState.ENDED) {
          player.seekTo(data.time, true);
          player.stopVideo();
        }
      }
    };

    socket.on('video-control', handleVideoControl);

    return () => {
      socket.off('video-control', handleVideoControl);
    };
  }, []);

  return (
    <div id="player"></div>
  );
};

export default YouTubePlayer;
