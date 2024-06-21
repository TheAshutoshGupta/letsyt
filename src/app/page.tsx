import Head from 'next/head';
import YouTubePlayer from './components/youtubePlayer';


const Home: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Collaborative YouTube Player</title>
      </Head>
      <main>
        <h1>Collaborative YouTube Player</h1>
        <YouTubePlayer/>
      </main>
    </div>
  );
};

export default Home;

